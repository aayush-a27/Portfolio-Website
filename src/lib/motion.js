import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { devFlag } from './devFlags';

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'expo.out', duration: 1.1 });

export { gsap, ScrollTrigger };

const mq = (query) =>
  typeof window !== 'undefined' && window.matchMedia(query).matches;

/*
 * Dev-only `?motion` previews full motion on machines that request reduced
 * motion (e.g. Windows "Animation effects" off). In production the visitor's
 * preference is always respected.
 */
const forceMotion = import.meta.env.DEV && devFlag('motion');
if (forceMotion) document.documentElement.classList.add('force-motion');

/** Media query under which full motion runs (used with gsap.matchMedia). */
export const FULL_MOTION_QUERY = forceMotion ? '(min-width: 0px)' : '(prefers-reduced-motion: no-preference)';

export const prefersReducedMotion = () => !forceMotion && mq('(prefers-reduced-motion: reduce)');

/** True for devices with a precise pointer that can hover (mouse, trackpad). */
export const hasFinePointer = () => mq('(hover: hover) and (pointer: fine)');

export const isSmallScreen = () => mq('(max-width: 767px)');

/** Shared motion vocabulary so every section moves with the same rhythm. */
export const MOTION = {
  ease: 'expo.out',
  easeInOut: 'power3.inOut',
  charStagger: 0.028,
  wordStagger: 0.06,
  revealDuration: 1.2,
};
