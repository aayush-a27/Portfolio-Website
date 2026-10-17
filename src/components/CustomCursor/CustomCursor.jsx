import { useEffect, useRef } from 'react';
import { hasFinePointer, prefersReducedMotion } from '../../lib/motion';
import './CustomCursor.css';

const INTERACTIVE = 'a, button, [role="button"], summary, label, select, [data-cursor]';
const TEXTUAL = 'p, li, h1, h2, h3, h4, blockquote, dd, dt';

/**
 * Dot + trailing ring cursor. Context comes from the element under the
 * pointer:
 *   data-cursor="view|drag|explore|..."   filled disc with a label
 *   data-cursor-label="Text"              overrides the label text
 *   links / buttons                       ring expands
 *   running text                          ring narrows into a caret
 * Only mounts behaviour on fine pointers; the native cursor stays for touch,
 * and the layer never receives pointer events.
 */
const CustomCursor = () => {
  const rootRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (!hasFinePointer()) return;

    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    const html = document.documentElement;
    html.classList.add('has-custom-cursor');

    const reduce = prefersReducedMotion();
    const ease = reduce ? 1 : 0.2;
    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let raf = 0;
    let state = '';

    const render = () => {
      ringPos.x += (pos.x - ringPos.x) * ease;
      ringPos.y += (pos.y - ringPos.y) * ease;
      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      // Sleep once the ring has caught up; the next move wakes the loop.
      if (Math.abs(pos.x - ringPos.x) + Math.abs(pos.y - ringPos.y) > 0.1) {
        raf = requestAnimationFrame(render);
      } else {
        raf = 0;
      }
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    const setState = (next, text = '') => {
      if (next === state && label.textContent === text) return;
      state = next;
      root.dataset.state = next;
      label.textContent = text;
    };

    const resolve = (target) => {
      if (!(target instanceof Element)) return setState('');
      const contextual = target.closest('[data-cursor]');
      if (contextual && contextual.dataset.cursor) {
        return setState('label', contextual.dataset.cursorLabel || contextual.dataset.cursor);
      }
      if (target.closest(INTERACTIVE)) return setState('link');
      if (target.closest(TEXTUAL)) return setState('text');
      return setState('');
    };

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      root.dataset.visible = 'true';
      wake();
    };

    const onOver = (e) => resolve(e.target);
    const onDown = () => (root.dataset.pressed = 'true');
    const onUp = () => (root.dataset.pressed = 'false');
    const onLeaveWindow = (e) => {
      if (!e.relatedTarget) root.dataset.visible = 'false';
    };
    // Elements can change their data-cursor while hovered (e.g. the 3D canvas).
    const onRefresh = (e) => resolve(document.elementFromPoint(pos.x, pos.y) || e.target);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('pointerout', onLeaveWindow, { passive: true });
    window.addEventListener('cursor:refresh', onRefresh);

    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerout', onLeaveWindow);
      window.removeEventListener('cursor:refresh', onRefresh);
    };
  }, []);

  return (
    <div ref={rootRef} className="cursor" aria-hidden="true" data-visible="false">
      <div ref={ringRef} className="cursor-ring">
        <div className="cursor-ring-shape">
          <span ref={labelRef} className="cursor-label" />
        </div>
      </div>
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
};

export default CustomCursor;
