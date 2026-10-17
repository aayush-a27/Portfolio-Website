import { useEffect, useRef, useState } from 'react';
import { FiMaximize2, FiMinimize2, FiX } from 'react-icons/fi';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { gsap, prefersReducedMotion } from '../../lib/motion';
import { THREE, applyPreset, createStage, loadModel, prepareModel } from '../../lib/three/stage';
import { lockScroll, unlockScroll } from '../../lib/smoothScroll';
import './ModelViewer.css';

const PRESETS = [
  { id: 'studio', label: 'Studio', tone: 'light' },
  { id: 'ember', label: 'Ember', tone: 'dark' },
  { id: 'night', label: 'Night', tone: 'dark' },
];

/**
 * Full-screen model inspector: drag to orbit, scroll / pinch to zoom,
 * switchable lighting moods, optional browser full screen. Owns its own
 * renderer only while open and releases it on close.
 */
const ModelViewer = ({ item, onClose }) => {
  const dialogRef = useRef(null);
  const canvasRef = useRef(null);
  const closeRef = useRef(null);
  const stageRef = useRef(null);
  const [preset, setPreset] = useState('ember');
  const [status, setStatus] = useState('loading');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Scene lifecycle
  useEffect(() => {
    const dialog = dialogRef.current;
    const canvas = canvasRef.current;
    const stage = createStage(canvas, { alpha: false });
    stageRef.current = stage;
    applyPreset(gsap, stage, 'ember', 0);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(3.4, 1.5, 6.6);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 2.5;
    controls.maxDistance = 16;
    controls.autoRotate = !prefersReducedMotion();
    controls.autoRotateSpeed = 0.8;
    const stopAuto = () => (controls.autoRotate = false);
    controls.addEventListener('start', stopAuto);

    let raf = 0;
    let disposed = false;
    const resize = () => {
      const { width, height } = dialog.getBoundingClientRect();
      stage.renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const loop = () => {
      controls.update();
      stage.renderer.render(stage.scene, camera);
      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(dialog);
    resize();

    loadModel(item.model)
      .then((gltf) => {
        if (disposed) return;
        const { pivot } = prepareModel(gltf, 6);
        pivot.rotation.z = -Math.PI / 4;
        stage.scene.add(pivot);
        setStatus('ready');
        gsap.from(pivot.rotation, { y: -Math.PI, duration: prefersReducedMotion() ? 0.01 : 2.2, ease: 'expo.out' });
        gsap.from(pivot.scale, { x: 0.6, y: 0.6, z: 0.6, duration: prefersReducedMotion() ? 0.01 : 1.8, ease: 'expo.out' });
      })
      .catch(() => !disposed && setStatus('error'));
    raf = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.removeEventListener('start', stopAuto);
      controls.dispose();
      stage.dispose();
      stageRef.current = null;
    };
  }, [item.model]);

  useEffect(() => {
    if (stageRef.current) applyPreset(gsap, stageRef.current, preset);
  }, [preset]);

  // Dialog behaviour: scroll lock, focus, Escape, focus trap, restore focus.
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;
    lockScroll();
    closeRef.current?.focus();
    gsap.fromTo(dialog, { clipPath: 'inset(50% 50% 50% 50% round 24px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)',
      duration: prefersReducedMotion() ? 0.01 : 1,
      ease: 'expo.inOut',
    });

    const onKey = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) onClose();
      if (e.key === 'Tab') {
        const focusables = dialog.querySelectorAll('button');
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const onFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    window.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFullscreen);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      unlockScroll();
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else dialogRef.current.requestFullscreen?.().catch(() => {});
  };

  return (
    <div
      ref={dialogRef}
      className="viewer"
      data-tone={PRESETS.find((p) => p.id === preset).tone}
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title} — interactive 3D model`}
      data-lenis-prevent
    >
      <canvas ref={canvasRef} className="viewer-canvas" data-cursor="drag" data-cursor-label="Drag" />

      <div className="viewer-top">
        <div>
          <p className="label">Interactive model</p>
          <h3 className="viewer-title">{item.title}</h3>
        </div>
        <div className="viewer-actions">
          {document.fullscreenEnabled && (
            <button type="button" className="viewer-icon-btn" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}>
              {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
            </button>
          )}
          <button ref={closeRef} type="button" className="viewer-icon-btn" onClick={onClose} aria-label="Close 3D viewer">
            <FiX />
          </button>
        </div>
      </div>

      <div className="viewer-bottom">
        <div className="viewer-presets" role="group" aria-label="Lighting">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`viewer-preset ${preset === p.id ? 'is-active' : ''}`}
              aria-pressed={preset === p.id}
              onClick={() => setPreset(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="viewer-hint label">Drag to rotate · Scroll to zoom</p>
      </div>

      {status !== 'ready' && (
        <div className="viewer-status" role="status">
          {status === 'loading' ? 'Loading model…' : 'The model could not be loaded.'}
        </div>
      )}
    </div>
  );
};

export default ModelViewer;
