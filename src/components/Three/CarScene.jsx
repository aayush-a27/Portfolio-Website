import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../lib/motion';
import { THREE, applyPreset, createStage, loadModel, webglAvailable } from '../../lib/three/stage';
import { useTheme } from '../../context/contexts';
import './CarScene.css';

/*
 * Scroll-scrubbed drift. The car's whole pose is a pure function of scroll
 * progress `u` (0 → 1), so scrolling back plays the drift exactly in
 * reverse — including tire smoke and skid marks, which are precomputed
 * along the path rather than simulated.
 */

const TRACK = 15; // car travels x: -TRACK → +TRACK (off-screen at both ends)
const ARC = 2.4; // how far the path bows toward the camera
const MAX_SLIP = 0.9; // peak drift angle (radians, ≈ 52°)
const WHEEL_RADIUS = 0.36;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Slow in the middle (the drift), fast entering and leaving. */
const travel = (u) => u + (0.62 * Math.sin(2 * Math.PI * u)) / (2 * Math.PI);

/** Drift angle: builds in, holds with a little life, unwinds. */
const slip = (u) => {
  const env = smooth(0.14, 0.36, u) * (1 - smooth(0.7, 0.9, u));
  return MAX_SLIP * env * (1 + 0.07 * Math.sin(u * 38));
};

const tmpA = new THREE.Vector3();

/** Car pose at progress u: position, yaw, slip. */
function pose(u, out = {}) {
  const s = travel(u);
  const x = -TRACK + 2 * TRACK * s;
  const z = ARC * Math.sin(Math.PI * s) - ARC * 0.4;
  // Path tangent (finite difference) → heading
  const s2 = travel(Math.min(1, u + 0.001));
  const dx = 2 * TRACK * (s2 - s) || 1e-4;
  const dz = ARC * (Math.sin(Math.PI * s2) - Math.sin(Math.PI * s));
  const heading = Math.atan2(dz, dx); // angle of travel in the XZ plane
  const beta = slip(u);
  // The path bows toward the camera, so the turn's inside is away from it;
  // in a drift the nose points to the inside and the tail swings out.
  const fwd = heading - beta;
  out.x = x;
  out.z = z;
  out.beta = beta;
  // The model faces +Z: yaw θ maps (0,0,1) to (cos fwd, 0, sin fwd).
  out.yaw = Math.atan2(Math.cos(fwd), Math.sin(fwd));
  out.distance = s * 2 * TRACK;
  return out;
}

function smokeTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,0.9)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.35)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Deterministic pseudo-random in [0, 1). */
const rand = (i) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const THEME_FX = {
  dark: { smoke: 0xd9d4cc, smokeOpacity: 0.42, skid: 0xefeae2, skidOpacity: 0.12, shadow: 0.55 },
  light: { smoke: 0x8a8070, smokeOpacity: 0.24, skid: 0x16130f, skidOpacity: 0.2, shadow: 0.28 },
};

const CarScene = ({ url, trackRef, revealRef, onReady }) => {
  const canvasRef = useRef(null);
  const ctlRef = useRef(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  const [failed, setFailed] = useState(() => !webglAvailable());

  useEffect(() => {
    if (failed) return;
    const canvas = canvasRef.current;
    const track = trackRef.current;
    const small = window.matchMedia('(max-width: 767px)').matches;

    const stage = createStage(canvas, { dpr: small ? 1.25 : 1.75, antialias: !small });
    const { renderer, scene, lights } = stage;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    applyPreset(gsap, stage, themeRef.current, 0);

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
    const lookAt = new THREE.Vector3(0, 0.5, 0);

    // Shadow-catching ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 40),
      new THREE.ShadowMaterial({ opacity: THEME_FX[themeRef.current].shadow })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    lights.key.castShadow = true;
    lights.key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
    Object.assign(lights.key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 30 });
    lights.key.shadow.bias = -0.0005;
    lights.key.shadow.radius = 6;
    scene.add(lights.key.target);

    const car = new THREE.Group();
    const body = new THREE.Group(); // receives roll / pitch
    car.add(body);
    scene.add(car);
    car.visible = false;
    const wheels = [];

    // ---- precomputed effects along the path ----
    const fx = THEME_FX[themeRef.current];
    const SMOKE = small ? 60 : 110;
    const smokeTex = smokeTexture();
    const puffs = [];
    const rearOffset = new THREE.Vector3(0, 0, -1.45); // rear axle, car-local (model faces +Z)
    for (let i = 0; i < SMOKE; i++) {
      const u0 = 0.16 + (0.74 * i) / SMOKE;
      const p = pose(u0);
      const strength = p.beta / MAX_SLIP;
      if (strength < 0.15) continue;
      const side = i % 2 ? 0.8 : -0.8;
      tmpA.set(side, 0.25, rearOffset.z).applyAxisAngle(THREE.Object3D.DEFAULT_UP, p.yaw);
      const mat = new THREE.SpriteMaterial({ map: smokeTex, color: fx.smoke, transparent: true, depthWrite: false, opacity: 0 });
      const sprite = new THREE.Sprite(mat);
      sprite.visible = false;
      scene.add(sprite);
      puffs.push({
        sprite,
        u0,
        strength,
        base: new THREE.Vector3(p.x + tmpA.x, tmpA.y, p.z + tmpA.z),
        drift: new THREE.Vector3((rand(i) - 0.5) * 2.5, 1 + rand(i + 9) * 1.5, (rand(i + 3) - 0.2) * 2),
        size: 1.2 + rand(i + 5) * 1.4,
      });
    }

    // Skid marks: one ribbon per rear wheel, revealed up to the current u.
    const SKID_SAMPLES = 260;
    const skidMat = new THREE.MeshBasicMaterial({ color: fx.skid, transparent: true, opacity: fx.skidOpacity, depthWrite: false, side: THREE.DoubleSide });
    const skids = [-0.78, 0.78].map((side) => {
      const positions = [];
      const us = [];
      for (let i = 0; i < SKID_SAMPLES; i++) {
        const u = 0.12 + (0.8 * i) / SKID_SAMPLES;
        const p = pose(u);
        const w = p.beta > 0.12 ? 0.11 : 0; // only while sliding
        for (const edge of [-w, w]) {
          tmpA.set(side + edge, 0.005, rearOffset.z).applyAxisAngle(THREE.Object3D.DEFAULT_UP, p.yaw);
          positions.push(p.x + tmpA.x, 0.004, p.z + tmpA.z);
        }
        us.push(u);
      }
      const index = [];
      for (let i = 0; i < SKID_SAMPLES - 1; i++) {
        const a = i * 2;
        index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setIndex(index);
      const mesh = new THREE.Mesh(geo, skidMat);
      mesh.renderOrder = 1;
      scene.add(mesh);
      return { mesh, geo, us };
    });

    // ---- per-frame pose ----
    const state = { u: 0 };
    const current = {};
    let raf = 0;
    let visible = false;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // Keep ~±7 units of track visible at any aspect ratio.
      const dist = Math.max(16, 7 / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect));
      camera.position.set(0, dist * 0.3, dist);
      camera.lookAt(lookAt);
      camera.updateProjectionMatrix();
      render();
    };

    const render = () => {
      raf = 0;
      const u = state.u;
      pose(u, current);
      car.position.set(current.x, 0, current.z);
      car.rotation.y = current.yaw;
      const k = current.beta / MAX_SLIP;
      body.rotation.z = -0.045 * k; // roll toward the outside of the slide
      body.rotation.x = 0.012 * Math.sin(u * 50) * k; // a little chassis chatter
      const spin = current.distance / WHEEL_RADIUS;
      wheels.forEach((w) => {
        w.pivot.rotation.x = spin;
        if (w.front) w.pivot.rotation.y = -0.55 * current.beta; // counter-steer
      });

      lights.key.position.set(current.x + 4, 9, current.z + 6);
      lights.key.target.position.set(current.x, 0, current.z);

      puffs.forEach((p) => {
        const age = u - p.u0;
        if (age <= 0 || age > 0.22) {
          p.sprite.visible = false;
          return;
        }
        const t = age / 0.22;
        p.sprite.visible = true;
        p.sprite.position.copy(p.base).addScaledVector(p.drift, t);
        p.sprite.scale.setScalar(p.size * (0.5 + t * 3));
        p.sprite.material.opacity = THEME_FX[themeRef.current].smokeOpacity * p.strength * (1 - t) * Math.min(1, t * 8);
      });

      skids.forEach((s) => {
        let n = 0;
        while (n < s.us.length && s.us[n] <= u) n++;
        s.geo.setDrawRange(0, Math.max(0, n - 1) * 6);
      });

      renderer.render(scene, camera);

      // Reveal the title behind the car: everything left of its nose shows.
      if (revealRef?.current) {
        tmpA.set(current.x + 1.6, 0.6, current.z).project(camera);
        const px = ((tmpA.x + 1) / 2) * 100;
        revealRef.current.style.setProperty('--reveal', `${Math.min(100, Math.max(0, px))}%`);
      }
    };

    const schedule = () => {
      if (!raf && visible) raf = requestAnimationFrame(render);
    };

    // Scroll drives u. Scrub smoothing keeps fast flicks graceful.
    const tween = gsap.to(state, {
      u: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: track,
        start: 'top 65%',
        end: 'bottom bottom',
        scrub: 0.9,
        invalidateOnRefresh: true,
      },
      onUpdate: schedule,
    });

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }, { rootMargin: '200px' });
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    ctlRef.current = {
      stage,
      setTheme(next) {
        const f = THEME_FX[next];
        applyPreset(gsap, stage, next, 0.6);
        ground.material.opacity = f.shadow;
        skidMat.color.set(f.skid);
        skidMat.opacity = f.skidOpacity;
        puffs.forEach((p) => p.sprite.material.color.set(f.smoke));
        gsap.delayedCall(0.65, schedule);
        schedule();
      },
    };

    let disposed = false;
    loadModel(url)
      .then((gltf) => {
        if (disposed) return;
        const model = gltf.scene.clone(true);
        // Sit on the ground, centred on the origin.
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.set(-center.x, -box.min.y, -center.z);
        body.add(model);
        body.updateMatrixWorld(true);

        // Wheels: group tire + rim meshes by axle position into spin pivots.
        const parts = [];
        model.traverse((o) => {
          if (!o.isMesh) return;
          o.castShadow = true;
          const name = (Array.isArray(o.material) ? o.material[0] : o.material)?.name?.toLowerCase() || '';
          if (name.includes('tire') || name.includes('rim')) {
            const c = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
            parts.push({ mesh: o, c });
          }
        });
        const groups = [];
        parts
          .sort((a, b) => new THREE.Box3().setFromObject(b.mesh).getSize(tmpA).y - new THREE.Box3().setFromObject(a.mesh).getSize(tmpA).y)
          .forEach((p) => {
            let g = groups.find((g) => g.c.distanceTo(p.c) < 0.6);
            if (!g) groups.push((g = { c: p.c.clone(), meshes: [] }));
            g.meshes.push(p.mesh);
          });
        groups.forEach((g) => {
          const pivot = new THREE.Group();
          pivot.rotation.order = 'YXZ';
          body.worldToLocal(pivot.position.copy(g.c));
          body.add(pivot);
          pivot.updateMatrixWorld(true);
          g.meshes.forEach((m) => pivot.attach(m));
          wheels.push({ pivot, front: pivot.position.z > 0 });
        });

        car.visible = true;
        onReady?.();
        ScrollTrigger.refresh();
        schedule();
      })
      .catch((err) => {
        console.warn('Car model failed to load:', err);
        if (!disposed) setFailed(true);
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      tween.scrollTrigger?.kill();
      tween.kill();
      io.disconnect();
      ro.disconnect();
      smokeTex.dispose();
      skidMat.dispose();
      skids.forEach((s) => s.geo.dispose());
      puffs.forEach((p) => p.sprite.material.dispose());
      ground.geometry.dispose();
      ground.material.dispose();
      stage.dispose();
      ctlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, failed]);

  useEffect(() => {
    themeRef.current = theme;
    ctlRef.current?.setTheme(theme);
  }, [theme]);

  if (failed) return null;
  return <canvas ref={canvasRef} className="car-canvas" role="img" aria-label="1975 Porsche 911 (930) Turbo drifting across the screen as you scroll" />;
};

export default CarScene;
