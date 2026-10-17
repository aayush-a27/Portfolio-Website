import { useEffect, useRef, useState } from 'react';
import { gsap, hasFinePointer, prefersReducedMotion } from '../../lib/motion';
import { THREE, applyPreset, createStage, loadModel, prepareModel, webglAvailable } from '../../lib/three/stage';
import { useTheme } from '../../context/contexts';
import LiquidImage from '../LiquidImage/LiquidImage';
import './HeroModel.css';

/**
 * Interactive hero model.
 *  - idle: slow turn around the blade's long axis and a gentle float
 *  - pointer: the whole piece tilts toward the cursor
 *  - scroll: rises, rotates and pushes toward the camera as the hero leaves
 *  - click / tap on the model: a full spin with a flare of rim light
 * Lighting follows the theme. Renders only while visible; falls back to the
 * still render (with the liquid hover) without WebGL, on data-saver, or if
 * the model fails to load.
 */
const HeroModel = ({ url, poster, alt, scrollState, ready }) => {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const introRef = useRef(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  const [status, setStatus] = useState(() =>
    webglAvailable() && !navigator.connection?.saveData ? 'loading' : 'fallback'
  );

  useEffect(() => {
    if (status === 'fallback') return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const small = window.matchMedia('(max-width: 767px)').matches;
    const reduce = prefersReducedMotion();
    const fine = hasFinePointer();

    const stage = createStage(canvas, { dpr: small ? 1.25 : 1.75, antialias: !small });
    stageRef.current = stage;
    applyPreset(gsap, stage, themeRef.current, 0);
    const { renderer, scene } = stage;

    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
    const root = new THREE.Group(); // tilt, scroll, intro
    const turn = new THREE.Group(); // free rotation from hold-and-drag
    const spinner = new THREE.Group(); // spin about the long axis
    root.add(turn);
    turn.add(spinner);
    scene.add(root);
    root.visible = false;

    const layout = { baseX: 1.6, baseZ: -0.95, camZ: 14 };
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const spin = { extra: 0 };
    const intro = { y: -5, rz: -2.4 };
    introRef.current = intro;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2(9, 9);
    let pivot = null;
    let hovering = false;
    // hold-and-drag rotation (trackball style) with inertia on release
    const drag = { active: false, moved: 0, x: 0, y: 0, vx: 0, vy: 0, id: null };
    let idleTime = 0;
    const qTmp = new THREE.Quaternion();
    const qRoot = new THREE.Quaternion();
    const axisX = new THREE.Vector3();
    const axisY = new THREE.Vector3();
    const rotateBy = (dx, dy) => {
      // Screen-space drag → rotation about the camera's up / right axes,
      // expressed in the turn group's parent frame.
      root.getWorldQuaternion(qRoot).invert();
      axisY.set(0, 1, 0).applyQuaternion(qRoot);
      axisX.set(1, 0, 0).applyQuaternion(qRoot);
      turn.quaternion.premultiply(qTmp.setFromAxisAngle(axisY, dx * 0.008));
      turn.quaternion.premultiply(qTmp.setFromAxisAngle(axisX, dy * 0.008));
    };
    let rayPending = false;
    let visible = true;
    let raf = 0;
    let last = performance.now();
    let time = 0;
    let disposed = false;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      // Portrait screens: centre the blade behind the name and step back.
      const portrait = camera.aspect < 1;
      layout.baseX = portrait ? 0.2 : camera.aspect < 1.5 ? 0.9 : 1.6;
      layout.baseZ = portrait ? -0.6 : -0.95;
      layout.camZ = portrait ? 19 : 14;
    };

    const setHover = (next) => {
      if (next === hovering) return;
      hovering = next;
      if (next) {
        canvas.dataset.cursor = 'drag';
        canvas.dataset.cursorLabel = 'Drag';
      } else {
        delete canvas.dataset.cursor;
        delete canvas.dataset.cursorLabel;
      }
      window.dispatchEvent(new Event('cursor:refresh'));
    };

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;
      const k = 1 - Math.pow(0.02, dt);
      pointer.x += (pointer.tx - pointer.x) * k;
      pointer.y += (pointer.ty - pointer.y) * k;
      const p = scrollState.current.progress;

      // Idle turn pauses while the user holds the blade.
      if (!drag.active && !reduce) idleTime += dt;
      spinner.rotation.y = 0.6 + idleTime * 0.32 + spin.extra;
      if (!drag.active && (Math.abs(drag.vx) + Math.abs(drag.vy) > 0.01)) {
        rotateBy(drag.vx, drag.vy);
        const decay = Math.pow(0.04, dt);
        drag.vx *= decay;
        drag.vy *= decay;
      }
      root.rotation.x = pointer.y * 0.22 + p * 0.5;
      root.rotation.y = pointer.x * 0.35 - p * 0.4;
      root.rotation.z = layout.baseZ + intro.rz + p * 1.1;
      root.position.x = layout.baseX - p * 1.4;
      root.position.y = intro.y + (reduce ? 0 : Math.sin(time * 0.8) * 0.12) + p * 2.6;
      camera.position.set(0, 0, layout.camZ - p * 3);

      if (rayPending && pivot && !drag.active) {
        rayPending = false;
        raycaster.setFromCamera(ndc, camera);
        setHover(raycaster.intersectObject(pivot, true).length > 0);
      }

      renderer.render(scene, camera);
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const start = () => {
      if (!raf && visible && !disposed) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    const onPointerMove = (e) => {
      if (drag.active) return; // the drag owns the blade while held
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
      const rect = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      rayPending = true;
    };

    const hitTest = (e) => {
      if (!pivot) return false;
      const rect = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      return raycaster.intersectObject(pivot, true).length > 0;
    };

    // A click (no drag) spins the blade; user-triggered, so it plays even
    // when the OS asks for reduced motion.
    const spinOnce = () => {
      gsap.to(spin, { extra: spin.extra + Math.PI * 2, duration: 1.8, ease: 'expo.out', overwrite: true });
      const { rimA, rimB } = stage.lights;
      gsap.fromTo([rimA, rimB], { intensity: (i) => [rimA, rimB][i].intensity * 3 }, {
        intensity: (i) => [rimA, rimB][i].intensity,
        duration: 1.4,
        ease: 'power3.out',
      });
    };

    const onPointerDown = (e) => {
      if (e.button !== 0 || !hitTest(e)) return;
      e.preventDefault();
      Object.assign(drag, { active: true, moved: 0, x: e.clientX, y: e.clientY, vx: 0, vy: 0, id: e.pointerId });
      canvas.setPointerCapture(e.pointerId);
      canvas.classList.add('is-grabbing');
      start();
    };

    const onDragMove = (e) => {
      if (!drag.active || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      rotateBy(dx, dy);
      drag.vx = dx;
      drag.vy = dy;
    };

    const onPointerUp = (e) => {
      if (!drag.active || e.pointerId !== drag.id) return;
      drag.active = false;
      canvas.classList.remove('is-grabbing');
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      if (drag.moved < 6) {
        drag.vx = drag.vy = 0;
        spinOnce();
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    const ro = new ResizeObserver(resize);
    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
      start();
    };

    resize();
    io.observe(wrap);
    ro.observe(wrap);
    document.addEventListener('visibilitychange', onVisibility);
    if (fine) window.addEventListener('pointermove', onPointerMove, { passive: true });
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onDragMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    // Upload textures and compile shaders up front (while the loader is
    // still covering the page) so the intro sweep never stutters on a
    // first-frame GPU hitch. The loader waits for this event.
    const announce = () => {
      window.__heroModelReady = true;
      window.dispatchEvent(new Event('hero-model:ready'));
    };

    loadModel(url)
      .then(async (gltf) => {
        if (disposed) return;
        const prepared = prepareModel(gltf, 6.4);
        pivot = prepared.pivot;
        spinner.add(pivot);
        root.visible = true;
        pivot.traverse((o) => {
          if (!o.material) return;
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
            Object.values(m).forEach((v) => v?.isTexture && renderer.initTexture(v));
          });
        });
        try {
          await renderer.compileAsync(scene, camera);
        } catch {
          /* compileAsync unsupported — the first render compiles instead */
        }
        if (disposed) return;
        renderer.render(scene, camera);
        setStatus('ready');
        announce();
        start();
      })
      .catch((err) => {
        console.warn('Hero model failed to load:', err);
        announce();
        if (!disposed) setStatus('fallback');
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onDragMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      gsap.killTweensOf([spin, intro, stage.lights.rimA, stage.lights.rimB]);
      stage.dispose();
      stageRef.current = null;
    };
    // `status` only gates the first run (fallback never mounts the canvas).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, scrollState]);

  // Intro: the blade sweeps up into place when the loader lifts.
  useEffect(() => {
    const intro = introRef.current;
    if (!ready || status !== 'ready' || !intro) return;
    const tween = gsap.to(intro, {
      y: 0,
      rz: 0,
      duration: prefersReducedMotion() ? 0.01 : 2.2,
      ease: 'expo.out',
      delay: 0.25,
    });
    return () => tween.kill();
  }, [ready, status]);

  useEffect(() => {
    themeRef.current = theme;
    if (stageRef.current) applyPreset(gsap, stageRef.current, theme);
  }, [theme]);

  if (status === 'fallback') {
    return (
      <div className="hero-model hero-model-fallback">
        <LiquidImage src={poster} alt={alt} className="hero-model-poster" loading="eager" data-cursor="view" data-cursor-label="Explore" />
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={`hero-model is-${status}`}>
      <canvas ref={canvasRef} className="hero-model-canvas" role="img" aria-label={alt} />
    </div>
  );
};

export default HeroModel;
