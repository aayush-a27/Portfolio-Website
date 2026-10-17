import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import { FiArrowDown, FiDownload, FiMail } from 'react-icons/fi';
import SplitText from '../SplitText/SplitText';
import Magnetic from '../Magnetic/Magnetic';
import { hero } from '../../data/portfolio';
import { heroModel } from '../../config/media';
import { useAppState } from '../../context/contexts';
import { gsap, ScrollTrigger, hasFinePointer, prefersReducedMotion } from '../../lib/motion';
import { handleAnchorClick } from '../../lib/smoothScroll';
import './Hero.css';

const HeroModel = lazy(() => import('../Three/HeroModel'));

const Hero = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const scrollRef = useRef({ progress: 0 });
  const introRef = useRef(null);
  const { ready } = useAppState();

  // Hold everything hidden until the loader lifts, then play the intro.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      const intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
      intro
        .from('.hero-badge', { autoAlpha: 0, y: 24, duration: 1 })
        .from('.hero-hi .split-word-inner', { yPercent: 110, duration: 1.1, stagger: 0.06 }, '<0.1')
        .from('.hero-wave', { scale: 0, rotate: -40, duration: 1.2, ease: 'elastic.out(1, 0.45)' }, '<0.3')
        .from('.hero-first .split-char', {
          yPercent: 125,
          rotate: 12,
          duration: 1.5,
          stagger: { each: 0.055, ease: 'sine.inOut' },
        }, '<-0.2')
        .from('.hero-last .split-char', {
          yPercent: 125,
          rotate: -10,
          duration: 1.5,
          stagger: { each: 0.055, ease: 'sine.inOut' },
        }, '<0.18')
        .from('.hero-subtitle', { autoAlpha: 0, y: 30, duration: 1.2 }, '<0.5')
        .from('.hero-hl-swash path', { strokeDashoffset: 1, duration: 1.4, stagger: 0.15, ease: 'power3.inOut' }, '<0.4')
        .from('.hero-cta .magnetic', { autoAlpha: 0, y: 30, duration: 1, stagger: 0.08 }, '<-0.6')
        .from('.hero-scroll', { autoAlpha: 0, duration: 1 }, '<0.3');
      introRef.current = intro;
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (ready) introRef.current?.play();
  }, [ready]);

  // Scroll-out: content drifts and fades; the model reads the same progress.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => {
          scrollRef.current.progress = self.progress;
        },
      });
      if (prefersReducedMotion()) return;
      gsap.to('.hero-content', {
        yPercent: -18,
        autoAlpha: 0.15,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  // Name reacts to the cursor: nearby letters lift (and gain weight).
  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const title = titleRef.current;
    const chars = [...title.querySelectorAll('.hero-first .split-char, .hero-last .split-char')];
    gsap.set(title.querySelectorAll('.hero-first .split-char'), { '--wght': 800 });
    const setters = chars.map((el) => ({
      el,
      y: gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3.out' }),
      wght: el.closest('.hero-first')
        ? gsap.quickTo(el, '--wght', { duration: 0.7, ease: 'power3.out' })
        : null,
    }));
    let raf = 0;
    let px = -9999;
    let py = -9999;

    const update = () => {
      raf = 0;
      setters.forEach(({ el, y, wght }) => {
        const r = el.getBoundingClientRect();
        const d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
        const f = Math.max(0, 1 - d / 260);
        const ease = f * f * (3 - 2 * f);
        y(-ease * 26);
        wght?.(800 - ease * 500);
      });
    };
    const onMove = (e) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onLeave = () => {
      px = py = -9999;
      if (!raf) raf = requestAnimationFrame(update);
    };
    title.addEventListener('pointermove', onMove);
    title.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      title.removeEventListener('pointermove', onMove);
      title.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const { ctas } = hero;

  return (
    <section ref={sectionRef} id="home" className="hero" aria-labelledby="hero-title">
      <div className="hero-stage">
        <Suspense fallback={null}>
          <HeroModel url={heroModel.url} poster={heroModel.poster} alt={heroModel.alt} scrollState={scrollRef} ready={ready} />
        </Suspense>
      </div>

      <div className="hero-content">
        <div className="hero-top">
          <p className="hero-badge">
            <span className="hero-badge-dot" aria-hidden="true" />
            {hero.badge}
          </p>
        </div>

        <h1 ref={titleRef} id="hero-title" className="hero-title">
          <span className="hero-hi">
            <SplitText text={hero.greeting} by="words" className="serif" />
            <span className="hero-wave" aria-hidden="true">{hero.wave}</span>
          </span>
          <SplitText text={hero.firstName} className="hero-name-line hero-first" />
          <SplitText text={hero.lastName} className="hero-name-line hero-last serif" />
        </h1>

        <div className="hero-bottom">
          <p className="hero-subtitle">
            {hero.subtitle.map((part, i) =>
              part.highlight ? (
                <span key={i} className={`hero-hl hero-hl-${part.highlight}`}>
                  <span className="text-gradient">{part.text}</span>
                  <svg className="hero-hl-swash" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M2 8 C 25 2, 50 12, 98 4" pathLength="1" />
                  </svg>
                </span>
              ) : (
                <span key={i}>{part.text}</span>
              )
            )}
          </p>

          <div className="hero-cta">
            <Magnetic>
              <a href={ctas.projects.href} className="btn btn-primary" onClick={(e) => handleAnchorClick(e, ctas.projects.href)}>
                <span data-magnetic-inner>{ctas.projects.label}</span>
                <span className="btn-dot" aria-hidden="true" />
              </a>
            </Magnetic>
            <Magnetic>
              <a href={ctas.resume.href} download={ctas.resume.download} className="btn btn-ghost">
                <FiDownload aria-hidden="true" />
                <span data-magnetic-inner>{ctas.resume.label}</span>
              </a>
            </Magnetic>
            <Magnetic>
              <a href={ctas.contact.href} className="btn btn-ghost" onClick={(e) => handleAnchorClick(e, ctas.contact.href)}>
                <FiMail aria-hidden="true" />
                <span data-magnetic-inner>{ctas.contact.label}</span>
              </a>
            </Magnetic>
          </div>
        </div>

        <a href={hero.scroll.href} className="hero-scroll" onClick={(e) => handleAnchorClick(e, hero.scroll.href)}>
          <span className="hero-scroll-line" aria-hidden="true" />
          <span className="label">{hero.scroll.label}</span>
          <FiArrowDown aria-hidden="true" />
        </a>
      </div>
    </section>
  );
};

export default Hero;
