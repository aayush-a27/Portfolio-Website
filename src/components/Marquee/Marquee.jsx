import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/motion';
import './Marquee.css';

/**
 * Endless band of items. Drifts on its own, follows scroll direction,
 * accelerates with scroll velocity and eases down while hovered. It always
 * drifts (a slow, steady loop); reduced-motion users just skip the
 * scroll-velocity boost. Ticks only
 * while on screen. Decorative: items must exist elsewhere on the page, so
 * the band is hidden from assistive tech.
 */
const Marquee = ({ items, speed = 60, reverse = false, outline = false, className = '' }) => {
  const rootRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;
    const calm = prefersReducedMotion();

    const base = reverse ? -1 : 1;
    let x = 0;
    let half = track.scrollWidth / 2;
    let direction = base;
    let boost = 0;
    let hover = 1;
    let hoverTarget = 1;
    let visible = false;

    const measure = () => {
      half = track.scrollWidth / 2;
    };
    const ro = new ResizeObserver(measure);
    ro.observe(track);

    const tick = (_, deltaMs) => {
      if (!visible) return;
      const dt = Math.min(deltaMs, 64) / 1000;
      hover += (hoverTarget - hover) * 0.08;
      boost *= 0.92;
      x -= direction * (speed * hover + boost) * dt;
      x = gsap.utils.wrap(-half, 0, x);
      track.style.transform = `translate3d(${x}px, 0, 0)`;
    };
    gsap.ticker.add(tick);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(root);

    const st = ScrollTrigger.create({
      trigger: root,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        direction = base * self.direction;
        if (!calm) boost = Math.min(Math.abs(self.getVelocity()) * 0.25, 900);
      },
    });

    const enter = () => (hoverTarget = 0.2);
    const leave = () => (hoverTarget = 1);
    root.addEventListener('pointerenter', enter);
    root.addEventListener('pointerleave', leave);

    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
      ro.disconnect();
      st.kill();
      root.removeEventListener('pointerenter', enter);
      root.removeEventListener('pointerleave', leave);
    };
  }, [speed, reverse]);

  const group = (copy) => (
    <div className="marquee-group" key={copy}>
      {items.map((item, i) => (
        <span className="marquee-item" key={`${copy}-${i}`}>
          <span className="marquee-text">{item}</span>
          <span className="marquee-sep">✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div ref={rootRef} className={`marquee ${outline ? 'marquee-outline' : ''} ${className}`} aria-hidden="true">
      <div ref={trackRef} className="marquee-track">
        {group('a')}
        {group('b')}
      </div>
    </div>
  );
};

export default Marquee;
