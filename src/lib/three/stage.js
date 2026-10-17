import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { devFlag } from '../devFlags';

export { THREE };

/* ------------------------------------------------------------ model cache */

const modelCache = new Map();

/** Loads a (meshopt-compressed) GLB once; later callers share the promise. */
export function loadModel(url) {
  if (!modelCache.has(url)) {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const promise = loader.loadAsync(url).catch((err) => {
      modelCache.delete(url);
      throw err;
    });
    modelCache.set(url, promise);
  }
  return modelCache.get(url);
}

/**
 * Clones the loaded scene, centres it on the origin and scales it so its
 * longest side equals `size`. Geometry and materials stay shared.
 */
export function prepareModel(gltf, size = 4) {
  const model = gltf.scene.clone(true);
  const box = new THREE.Box3().setFromObject(model);
  const dims = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = size / Math.max(dims.x, dims.y, dims.z);
  model.position.sub(center).multiplyScalar(scale);
  model.scale.setScalar(scale);
  const pivot = new THREE.Group();
  pivot.add(model);
  return { pivot, model, longAxis: dims.y >= dims.x && dims.y >= dims.z ? 'y' : dims.x >= dims.z ? 'x' : 'z' };
}

/* ---------------------------------------------------------------- stage */

export function webglAvailable() {
  if (import.meta.env.DEV && devFlag('nowebgl')) return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Renderer + image-based lighting from three's procedural RoomEnvironment
 * (no HDR download needed) + a key light and two coloured rim lights.
 */
export function createStage(canvas, { dpr = 1.75, antialias = true, alpha = true } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias, alpha, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dpr));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;

  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.position.set(4, 6, 6);
  const rimA = new THREE.PointLight(0xff8a3d, 40, 30, 2);
  rimA.position.set(-5, 2, -2);
  const rimB = new THREE.PointLight(0x9b8cff, 40, 30, 2);
  rimB.position.set(5, -3, -1);
  scene.add(key, rimA, rimB);

  const dispose = () => {
    envRT.dispose();
    pmrem.dispose();
    renderer.dispose();
  };

  return { renderer, scene, lights: { key, rimA, rimB }, dispose };
}

/** Lighting moods, keyed by theme or gallery preset. */
export const LIGHT_PRESETS = {
  dark: { env: 0.55, exposure: 1.05, key: [0xfff1e0, 1.6], rimA: [0xff8a3d, 55], rimB: [0x9b8cff, 45], bg: null },
  light: { env: 1.0, exposure: 0.95, key: [0xffffff, 2.4], rimA: [0xff7a2e, 25], rimB: [0x6a5cff, 18], bg: null },
  studio: { env: 1.1, exposure: 1, key: [0xffffff, 2.6], rimA: [0xffd2b0, 18], rimB: [0xd0d6ff, 18], bg: 0xe9e4db },
  ember: { env: 0.45, exposure: 1.1, key: [0xffe2c4, 1.4], rimA: [0xff6a1f, 70], rimB: [0xb04dff, 50], bg: 0x120c08 },
  night: { env: 0.3, exposure: 1.15, key: [0x9fb6ff, 1.1], rimA: [0xffb347, 60], rimB: [0x3a6dff, 55], bg: 0x070a14 },
};

/** Tweens the stage toward a preset with the supplied gsap instance. */
export function applyPreset(gsap, stage, preset, duration = 1.2) {
  const { scene, renderer, lights } = stage;
  const p = LIGHT_PRESETS[preset];
  const tweenColor = (light, [hex, intensity]) => {
    const c = new THREE.Color(hex);
    gsap.to(light.color, { r: c.r, g: c.g, b: c.b, duration, ease: 'power2.inOut' });
    gsap.to(light, { intensity, duration, ease: 'power2.inOut' });
  };
  tweenColor(lights.key, p.key);
  tweenColor(lights.rimA, p.rimA);
  tweenColor(lights.rimB, p.rimB);
  gsap.to(scene, { environmentIntensity: p.env, duration, ease: 'power2.inOut' });
  gsap.to(renderer, { toneMappingExposure: p.exposure, duration, ease: 'power2.inOut' });
  if (p.bg !== null) {
    if (!(scene.background instanceof THREE.Color)) scene.background = new THREE.Color(p.bg);
    const c = new THREE.Color(p.bg);
    gsap.to(scene.background, { r: c.r, g: c.g, b: c.b, duration, ease: 'power2.inOut' });
  }
}
