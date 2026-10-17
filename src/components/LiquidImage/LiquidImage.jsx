import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { LiquidSurface, liquidSupported, preloadLiquidTexture } from '../../lib/webgl/liquid';
import { gsap, hasFinePointer, prefersReducedMotion } from '../../lib/motion';
import { useTheme } from '../../context/contexts';
import './LiquidImage.css';

/**
 * Image with WebGL liquid interactions.
 *
 *  - Hover: fluid lens follows the pointer.
 *  - `revealSrc`: hovering (or tapping on touch) melts through to a second
 *    image from the entry point, and back on leave.
 *  - Changing `src`: liquid transition from `origin` ({x, y} in 0–1, y up).
 *
 * The real <img> stays in the DOM for accessibility and as the fallback;
 * the canvas covers it once WebGL has drawn. Without WebGL a CSS clip-path
 * reveal stands in. Effects initialise only when near the viewport.
 */
const LiquidImage = ({
  src,
  alt,
  revealSrc,
  origin,
  className = '',
  imgClassName = '',
  loading = 'lazy',
  ...rest
}) => {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const surfaceRef = useRef(null);
  const glRef = useRef(false);
  const shownRef = useRef(src);
  const originRef = useRef(origin);
  const revealedRef = useRef(false);
  const [gl, setGl] = useState(false);
  const [baseSrc, setBaseSrc] = useState(src);
  const [overlaySrc, setOverlaySrc] = useState(null);
  const { theme } = useTheme();

  useLayoutEffect(() => {
    originRef.current = origin;
  });

  // Lazily create the WebGL surface when the image approaches the viewport.
  useEffect(() => {
    const wrap = wrapRef.current;
    let surface = null;
    let ro = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        if (!liquidSupported()) return;
        surface = new LiquidSurface(canvasRef.current, {
          src: shownRef.current,
          onReady: () => {
            glRef.current = true;
            setGl(true);
          },
          onFallback: () => {
            glRef.current = false;
            setGl(false);
          },
        });
        surfaceRef.current = surface;
        surface.load().catch(() => setGl(false));
        ro = new ResizeObserver(() => surface.resize());
        ro.observe(wrap);
        if (revealSrc) preloadLiquidTexture(revealSrc);
      },
      { rootMargin: '300px' }
    );
    io.observe(wrap);
    return () => {
      io.disconnect();
      ro?.disconnect();
      surface?.dispose();
      surfaceRef.current = null;
      glRef.current = false;
    };
    // The surface follows later `src` changes through transitions, not remounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme changes alter the stage and accent colours baked into the shader.
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    surface.refreshColors();
    surface.draw();
  }, [theme]);

  // `src` changed → transition to it.
  useEffect(() => {
    if (src === shownRef.current) return;
    shownRef.current = src;
    const from = originRef.current || { x: 0.5, y: 0.5 };
    const surface = surfaceRef.current;
    if (surface && glRef.current) {
      setBaseSrc(src);
      surface.transitionTo(src, from);
      return;
    }
    // CSS fallback: unmask the new image from the origin, then swap.
    setOverlaySrc(src);
  }, [src]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlaySrc || !overlay || revealSrc) return;
    const from = originRef.current || { x: 0.5, y: 0.5 };
    const at = `${from.x * 100}% ${(1 - from.y) * 100}%`;
    const tween = gsap.fromTo(
      overlay,
      { clipPath: `circle(0% at ${at})` },
      {
        clipPath: `circle(150% at ${at})`,
        duration: prefersReducedMotion() ? 0.01 : 1.2,
        ease: 'power3.inOut',
        onComplete: () => {
          setBaseSrc(overlaySrc);
          setOverlaySrc(null);
        },
      }
    );
    return () => tween.kill();
  }, [overlaySrc, revealSrc]);

  const local = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top, rect };
  };

  const setReveal = (on, e) => {
    if (!revealSrc) return;
    revealedRef.current = on;
    const surface = surfaceRef.current;
    const { x, y, rect } = local(e);
    const at = { x: x / rect.width, y: 1 - y / rect.height };
    if (surface && glRef.current) {
      surface.reveal(revealSrc, on, at);
    } else {
      wrapRef.current.style.setProperty('--ox', `${x}px`);
      wrapRef.current.style.setProperty('--oy', `${y}px`);
      wrapRef.current.classList.toggle('is-revealed', on);
    }
  };

  const onPointerEnter = (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    surfaceRef.current?.setHover(true);
    setReveal(true, e);
  };

  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    const surface = surfaceRef.current;
    if (!surface) return;
    const { x, y, rect } = local(e);
    surface.pointer(x, y, rect);
  };

  const onPointerLeave = (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    surfaceRef.current?.setHover(false);
    setReveal(false, e);
  };

  // Touch: tapping toggles the reveal.
  const onClick = (e) => {
    if (!revealSrc || hasFinePointer()) return;
    setReveal(!revealedRef.current, e);
  };

  return (
    <div
      ref={wrapRef}
      className={`liquid ${gl ? 'is-gl' : ''} ${className}`}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
      {...rest}
    >
      <img className={`liquid-img ${imgClassName}`} src={baseSrc} alt={alt} loading={loading} decoding="async" draggable="false" />
      {revealSrc && !gl && (
        <img className="liquid-img liquid-reveal-fallback" src={revealSrc} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      )}
      {overlaySrc && !revealSrc && (
        <img ref={overlayRef} className="liquid-img liquid-overlay" src={overlaySrc} alt="" aria-hidden="true" decoding="async" />
      )}
      <canvas ref={canvasRef} className="liquid-canvas" aria-hidden="true" />
    </div>
  );
};

export default LiquidImage;
