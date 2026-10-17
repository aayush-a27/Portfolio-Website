import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion } from './motion';

let lenis = null;

/**
 * Lenis smooth scrolling driven by the GSAP ticker so ScrollTrigger and
 * Lenis share one clock. Skipped entirely for reduced-motion users, who
 * keep native scrolling.
 */
export function initSmoothScroll() {
  if (prefersReducedMotion()) return () => {};

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.3,
  });

  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

export const getLenis = () => lenis;

/** Scrolls to a selector or element, through Lenis when it is active. */
export function scrollToTarget(target, { immediate = false } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { duration: immediate ? 0 : 1.4, immediate, force: true });
  } else {
    el.scrollIntoView({ behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' });
  }
}

/** Handles an in-page anchor click: smooth scroll + keep the URL hash in sync. */
export function handleAnchorClick(event, href) {
  if (!href?.startsWith('#')) return;
  event.preventDefault();
  scrollToTarget(href);
  if (window.location.hash !== href) {
    window.history.pushState(null, '', href);
  }
}

export function lockScroll() {
  lenis?.stop();
  document.documentElement.classList.add('scroll-locked');
}

export function unlockScroll() {
  lenis?.start();
  document.documentElement.classList.remove('scroll-locked');
}
