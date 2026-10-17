import { useLayoutEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/motion';
import { loading } from '../../data/portfolio';
import './LoadingScreen.css';

const MIN_DURATION = 1.6; // seconds — long enough to read, short enough not to annoy

/**
 * Intro curtain. The counter tracks real readiness (web fonts) and never
 * finishes before MIN_DURATION; the curtain then lifts and `onComplete`
 * hands control to the page intro.
 */
const LoadingScreen = ({ onComplete }) => {
  const rootRef = useRef(null);
  const countRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (prefersReducedMotion()) {
      // Still wait (briefly) for the hero model's GPU warm-up so the first
      // frames after the loader are smooth.
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        onComplete();
      };
      const t = window.setTimeout(finish, 4000);
      const onModel = () => window.setTimeout(finish, 150);
      if (window.__heroModelReady) onModel();
      else window.addEventListener('hero-model:ready', onModel, { once: true });
      return () => {
        done = true;
        window.clearTimeout(t);
        window.removeEventListener('hero-model:ready', onModel);
      };
    }

    let cancelled = false;
    const ctx = gsap.context((self) => {
      const counter = { v: 0 };
      const fontsReady = document.fonts?.ready ?? Promise.resolve();
      // Hold the curtain until the hero model has uploaded and compiled on the
      // GPU (signalled by HeroModel), so its intro sweep starts smooth. Capped
      // so a slow network never traps the visitor behind the loader.
      const modelReady = new Promise((resolve) => {
        if (window.__heroModelReady) return resolve();
        window.addEventListener('hero-model:ready', resolve, { once: true });
        window.setTimeout(resolve, 4000);
      });

      const intro = gsap.timeline();
      intro
        .from('.loader-letter', { yPercent: 120, rotate: 12, duration: 1, stagger: 0.08, ease: 'expo.out' })
        .from('.loader-text, .loader-meta', { autoAlpha: 0, y: 12, duration: 0.8, stagger: 0.1 }, '-=0.6')
        .from('.loader-bar-fill', { scaleX: 0, duration: MIN_DURATION, ease: 'power2.inOut' }, 0)
        .to(counter, {
          v: 86,
          duration: MIN_DURATION,
          ease: 'power2.inOut',
          onUpdate: () => {
            countRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0');
          },
        }, 0);

      Promise.all([fontsReady, modelReady, new Promise((r) => intro.eventCallback('onComplete', r))]).then(() => {
        if (cancelled) return;
        // Created asynchronously, so register it with the context for cleanup.
        self.add(() => gsap.timeline({ onComplete })
          .to(counter, {
            v: 100,
            duration: 0.35,
            ease: 'power1.out',
            onUpdate: () => {
              countRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0');
            },
          })
          .to('.loader-inner', { yPercent: -30, autoAlpha: 0, duration: 0.7, ease: 'power3.in' }, '+=0.05')
          .to(root, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, '-=0.35'));
      });
    }, root);

    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, [onComplete]);

  return (
    <div ref={rootRef} className="loader" role="status" aria-live="polite">
      <div className="loader-inner">
        <div className="loader-logo" aria-hidden="true">
          <span className="loader-mask"><span className="loader-letter">{loading.letter}</span></span>
          <span className="loader-mask"><span className="loader-letter loader-letter-accent">{loading.letterAccent}</span></span>
        </div>
        <p className="loader-text">{loading.text}</p>
        <div className="loader-meta">
          <div className="loader-bar"><div className="loader-bar-fill" /></div>
          <span ref={countRef} className="loader-count" aria-hidden="true">000</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
