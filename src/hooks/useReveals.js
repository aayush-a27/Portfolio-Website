import { useLayoutEffect } from 'react';
import { gsap, ScrollTrigger, MOTION, FULL_MOTION_QUERY } from '../lib/motion';

/**
 * Declarative scroll-reveal system. Components annotate markup with data
 * attributes; this hook wires every annotation under `scopeRef` once.
 *
 *   data-reveal="chars"        split characters rise in a wave (needs <SplitText by="chars">)
 *   data-reveal="words"        split words rise in sequence  (needs <SplitText by="words">)
 *   data-reveal="fade"         element fades and lifts
 *   data-reveal="stagger"      direct children fade and lift in sequence
 *   data-reveal="scrub-words"  split words brighten as the reader scrolls through
 *   data-reveal="clip"         element unmasks from the bottom edge
 *   data-reveal="line"         element scales in along X (hairlines)
 *   data-speed="0.85"          parallax: <1 lags behind scroll, >1 leads
 *
 * Reduced-motion users get the final state immediately.
 */
export default function useReveals(scopeRef, enabled = true) {
  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope || !enabled) return;

    const mm = gsap.matchMedia(scope);

    mm.add(FULL_MOTION_QUERY, () => {
      const q = (selector) => gsap.utils.toArray(selector, scope);
      const once = (el, start = 'top 88%') => ({ trigger: el, start, once: true });

      q('[data-reveal="chars"]').forEach((el) => {
        gsap.from(el.querySelectorAll('.split-char'), {
          yPercent: 118,
          rotate: 8,
          duration: MOTION.revealDuration,
          ease: MOTION.ease,
          stagger: { each: MOTION.charStagger, ease: 'sine.inOut' },
          scrollTrigger: once(el),
        });
      });

      q('[data-reveal="words"]').forEach((el) => {
        gsap.from(el.querySelectorAll('.split-word-inner'), {
          yPercent: 110,
          duration: MOTION.revealDuration,
          ease: MOTION.ease,
          stagger: MOTION.wordStagger,
          scrollTrigger: once(el),
        });
      });

      q('[data-reveal="fade"]').forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0,
          y: 48,
          duration: 1.2,
          delay: parseFloat(el.dataset.delay || 0),
          scrollTrigger: once(el, 'top 92%'),
        });
      });

      q('[data-reveal="stagger"]').forEach((el) => {
        gsap.from(el.children, {
          autoAlpha: 0,
          y: 40,
          duration: 1.1,
          stagger: 0.08,
          scrollTrigger: once(el, 'top 90%'),
        });
      });

      q('[data-reveal="clip"]').forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: once(el, 'top 85%') }
        );
      });

      q('[data-reveal="line"]').forEach((el) => {
        gsap.from(el, {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: 1.6,
          ease: 'expo.inOut',
          scrollTrigger: once(el, 'top 95%'),
        });
      });

      q('[data-reveal="scrub-words"]').forEach((el) => {
        gsap.fromTo(
          el.querySelectorAll('.split-word-inner'),
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.1,
            scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 },
          }
        );
      });

      q('[data-speed]').forEach((el) => {
        const speed = parseFloat(el.dataset.speed);
        if (!speed || speed === 1) return;
        gsap.fromTo(
          el,
          { y: () => (1 - speed) * -0.5 * window.innerHeight * 0.4 },
          {
            y: () => (1 - speed) * 0.5 * window.innerHeight * 0.4,
            ease: 'none',
            scrollTrigger: {
              trigger: el.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    });

    // Fonts change line lengths; re-measure once they are in.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => mm.revert();
  }, [scopeRef, enabled]);
}
