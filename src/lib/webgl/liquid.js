import { gsap, prefersReducedMotion } from '../motion';
import { LIQUID_VERT, LIQUID_FRAG } from './liquidShaders';
import { devFlag } from '../devFlags';

/*
 * One WebGL context serves every liquid image on the page.
 *
 * Each LiquidSurface owns a plain 2D <canvas> in the DOM. To draw a frame,
 * the surface renders into the shared off-screen WebGL canvas and copies
 * the result across with drawImage. This avoids the per-page WebGL context
 * limit, keeps DOM layering normal, and costs nothing while idle: the
 * frame loop only runs while a surface is hovered or transitioning.
 */

const MAX_DPR = 2;
const MAX_TEXTURES = 8;

let shared;            // lazily created { canvas, gl, uniforms, ... } or null if unsupported
const surfaces = new Set();
const active = new Set();
let rafId = 0;
let lastTime = 0;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Liquid shader compile failed: ${log}`);
  }
  return shader;
}

function createShared() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });
    if (!gl) return null;

    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, LIQUID_VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, LIQUID_FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Liquid program link failed: ${gl.getProgramInfoLog(program)}`);
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const names = [
      'uTexA', 'uTexB', 'uPlane', 'uSizeA', 'uSizeB', 'uMouse', 'uHover', 'uVelocity',
      'uProgress', 'uOrigin', 'uTime', 'uBg', 'uEdge', 'uIntensity',
    ];
    const uniforms = Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(program, n)]));
    gl.uniform1i(uniforms.uTexA, 0);
    gl.uniform1i(uniforms.uTexB, 1);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const state = { canvas, gl, uniforms, textures: new Map(), lost: false };
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      state.lost = true;
      surfaces.forEach((s) => s.onFallback?.());
    });
    return state;
  } catch (err) {
    console.warn(err);
    return null;
  }
}

export function liquidSupported() {
  if (shared === undefined) shared = import.meta.env.DEV && devFlag('nowebgl') ? null : createShared();
  return Boolean(shared && !shared.lost);
}

/* ---------------------------------------------------------------- textures */

function touchTexture(url) {
  const entry = shared.textures.get(url);
  if (entry) entry.used = performance.now();
  return entry;
}

function evictTextures() {
  const { gl, textures } = shared;
  if (textures.size <= MAX_TEXTURES) return;
  const inUse = new Set();
  surfaces.forEach((s) => {
    inUse.add(s.urlA);
    if (s.urlB) inUse.add(s.urlB);
  });
  const candidates = [...textures.entries()]
    .filter(([url, t]) => !inUse.has(url) && t.texture)
    .sort((a, b) => a[1].used - b[1].used);
  while (textures.size > MAX_TEXTURES && candidates.length) {
    const [url, t] = candidates.shift();
    gl.deleteTexture(t.texture);
    textures.delete(url);
  }
}

function loadTexture(url) {
  const existing = touchTexture(url);
  if (existing) return existing.promise;

  const entry = { texture: null, width: 1, height: 1, used: performance.now(), promise: null };
  entry.promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    img
      .decode()
      .then(() => {
        if (!shared || shared.lost) return reject(new Error('context lost'));
        const { gl } = shared;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        entry.texture = texture;
        entry.width = img.naturalWidth;
        entry.height = img.naturalHeight;
        evictTextures();
        resolve(entry);
      })
      .catch(reject);
  });
  shared.textures.set(url, entry);
  return entry.promise;
}

/* -------------------------------------------------------------- frame loop */

function frame(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  active.forEach((surface) => {
    if (!surface.step(dt)) active.delete(surface);
  });
  rafId = active.size ? requestAnimationFrame(frame) : 0;
}

function wake(surface) {
  active.add(surface);
  if (!rafId) {
    lastTime = performance.now();
    rafId = requestAnimationFrame(frame);
  }
}

/* ------------------------------------------------------------------ colour */

const probe = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
function cssColorToRgb(color) {
  if (!probe) return [0, 0, 0];
  probe.fillStyle = '#000';
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  probe.clearRect(0, 0, 1, 1);
  return [r / 255, g / 255, b / 255];
}

/* ----------------------------------------------------------------- surface */

export class LiquidSurface {
  /**
   * @param {HTMLCanvasElement} canvas  visible 2D canvas
   * @param {object} opts
   * @param {string} opts.src           initial image URL
   * @param {() => void} [opts.onReady] first frame drawn
   * @param {() => void} [opts.onFallback] WebGL became unavailable
   */
  constructor(canvas, { src, onReady, onFallback }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.urlA = src;
    this.urlB = null;
    this.texA = null;
    this.texB = null;
    this.onReady = onReady;
    this.onFallback = onFallback;
    this.ready = false;

    this.time = Math.random() * 100;
    this.hover = 0;
    this.hoverTarget = 0;
    this.mouse = { x: 0.5, y: 0.5 };
    this.mouseTarget = { x: 0.5, y: 0.5 };
    this.velocity = 0;
    this.progress = 0;
    this.origin = { x: 0.5, y: 0.5 };
    this.tween = null;
    this.intensity = prefersReducedMotion() ? 0 : 1;
    this.width = 1;
    this.height = 1;
    this.refreshColors();

    surfaces.add(this);
  }

  refreshColors() {
    const styles = getComputedStyle(this.canvas);
    this.bg = cssColorToRgb(styles.getPropertyValue('--liquid-bg').trim() || styles.backgroundColor || '#000');
    this.edge = cssColorToRgb(styles.getPropertyValue('--accent').trim() || '#ff8a3d');
  }

  async load() {
    const entry = await loadTexture(this.urlA);
    this.texA = entry;
    this.resize();
    if (!this.ready) {
      this.ready = true;
      this.onReady?.();
    }
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    this.width = Math.max(1, Math.round(rect.width * dpr));
    this.height = Math.max(1, Math.round(rect.height * dpr));
    if (this.canvas.width !== this.width || this.canvas.height !== this.height) {
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
    this.draw();
  }

  /** Pointer position in element-relative CSS pixels. */
  pointer(x, y, rect) {
    const nx = x / rect.width;
    const ny = 1 - y / rect.height;
    const dx = nx - this.mouseTarget.x;
    const dy = ny - this.mouseTarget.y;
    this.velocity = Math.min(1, this.velocity + Math.hypot(dx, dy) * 6);
    this.mouseTarget.x = nx;
    this.mouseTarget.y = ny;
    if (this.hover < 0.01) {
      this.mouse.x = nx;
      this.mouse.y = ny;
    }
    wake(this);
  }

  setHover(on) {
    this.hoverTarget = on && this.intensity > 0 ? 1 : 0;
    wake(this);
  }

  /** Liquid transition to a new image, then the new image becomes the base. */
  async transitionTo(url, origin = { x: 0.5, y: 0.5 }, duration = 1.6) {
    if (!url || url === this.urlA) return;
    this.refreshColors();
    // Interrupted mid-way: promote whichever image dominates the screen.
    if (this.tween && this.texB && this.progress > 0.5) {
      this.urlA = this.urlB;
      this.texA = this.texB;
    }
    this.tween?.kill();
    this.tween = null;
    const entry = await loadTexture(url);
    this.urlB = url;
    this.texB = entry;
    this.origin = origin;
    this.progress = 0;
    return new Promise((resolve) => {
      this.tween = gsap.to(this, {
        progress: 1,
        duration: this.intensity ? duration : 0.4,
        ease: 'power2.inOut',
        onUpdate: () => wake(this),
        onComplete: () => {
          this.urlA = url;
          this.texA = entry;
          this.urlB = null;
          this.texB = null;
          this.progress = 0;
          this.tween = null;
          this.draw();
          resolve();
        },
      });
    });
  }

  /** Reversible reveal of a second image (hover in / hover out). */
  async reveal(url, on, origin) {
    this.refreshColors();
    if (on) {
      const entry = await loadTexture(url);
      // Re-anchor the front only when starting from the base image.
      if (this.progress < 0.02 && origin) this.origin = origin;
      this.urlB = url;
      this.texB = entry;
    }
    this.tween?.kill();
    this.tween = gsap.to(this, {
      progress: on ? 1 : 0,
      duration: this.intensity ? (on ? 1.3 : 1) : 0.3,
      ease: on ? 'power2.out' : 'power2.inOut',
      onUpdate: () => wake(this),
      onComplete: () => {
        this.tween = null;
      },
    });
  }

  /** Advances one frame; returns whether more frames are needed. */
  step(dt) {
    this.time += dt;
    const k = 1 - Math.pow(0.001, dt); // frame-rate independent smoothing
    this.hover += (this.hoverTarget - this.hover) * k * 0.9;
    this.mouse.x += (this.mouseTarget.x - this.mouse.x) * k;
    this.mouse.y += (this.mouseTarget.y - this.mouse.y) * k;
    this.velocity *= Math.pow(0.02, dt);
    this.draw();
    const settling = Math.abs(this.hoverTarget - this.hover) > 0.002 || this.velocity > 0.002;
    return this.hoverTarget > 0 || settling || Boolean(this.tween);
  }

  draw() {
    if (!shared || shared.lost || !this.texA?.texture) return;
    const { gl, canvas, uniforms: u } = shared;
    const w = this.width;
    const h = this.height;
    if (canvas.width < w || canvas.height < h) {
      canvas.width = Math.max(canvas.width, w);
      canvas.height = Math.max(canvas.height, h);
    }
    gl.viewport(0, 0, w, h);

    const texB = this.texB?.texture ? this.texB : this.texA;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texA.texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texB.texture);

    gl.uniform2f(u.uPlane, w, h);
    gl.uniform2f(u.uSizeA, this.texA.width, this.texA.height);
    gl.uniform2f(u.uSizeB, texB.width, texB.height);
    gl.uniform2f(u.uMouse, this.mouse.x, this.mouse.y);
    gl.uniform1f(u.uHover, this.hover);
    gl.uniform1f(u.uVelocity, this.velocity);
    gl.uniform1f(u.uProgress, this.progress);
    gl.uniform2f(u.uOrigin, this.origin.x, this.origin.y);
    gl.uniform1f(u.uTime, this.time);
    gl.uniform3fv(u.uBg, this.bg);
    gl.uniform3fv(u.uEdge, this.edge);
    gl.uniform1f(u.uIntensity, this.intensity);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // GL's origin is bottom-left, so the rendered region sits at the bottom
    // of the shared canvas.
    this.ctx.drawImage(canvas, 0, canvas.height - h, w, h, 0, 0, w, h);
  }

  dispose() {
    this.tween?.kill();
    active.delete(this);
    surfaces.delete(this);
  }
}

/** Preload a texture ahead of a transition (e.g. the next gallery item). */
export function preloadLiquidTexture(url) {
  if (liquidSupported()) loadTexture(url).catch(() => {});
}
