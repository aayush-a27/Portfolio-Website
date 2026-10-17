import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FiArrowUpRight } from 'react-icons/fi';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { navItems, logo, contact, socialLinks } from '../../data/portfolio';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/motion';
import { handleAnchorClick, lockScroll, unlockScroll } from '../../lib/smoothScroll';
import './Navbar.css';

/** Text that rolls up to a duplicate of itself on hover. */
const RollText = ({ children }) => (
  <span className="roll">
    <span className="roll-a">{children}</span>
    <span className="roll-b" aria-hidden="true">{children}</span>
  </span>
);

const Navbar = () => {
  const navRef = useRef(null);
  const progressRef = useRef(null);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const menuTl = useRef(null);
  const pendingHref = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Active section: whichever section crosses the viewport's middle band.
  useEffect(() => {
    const ids = navItems.map((item) => item.href.slice(1));
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Scroll progress + hide on scroll down / reveal on scroll up.
  useEffect(() => {
    const nav = navRef.current;
    const bar = progressRef.current;
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        bar.style.transform = `scaleX(${self.progress})`;
        const scrolled = self.scroll() > 40;
        nav.classList.toggle('is-scrolled', scrolled);
        const hide = self.direction === 1 && self.scroll() > 240;
        nav.classList.toggle('is-hidden', hide && !document.documentElement.classList.contains('menu-open'));
      },
    });
    return () => st.kill();
  }, []);

  // Menu open / close timeline.
  useLayoutEffect(() => {
    const menu = menuRef.current;
    const ctx = gsap.context(() => {
      menuTl.current = gsap
        .timeline({ paused: true })
        .set(menu, { visibility: 'visible' })
        .fromTo(menu, { clipPath: 'circle(0% at calc(100% - 48px) 38px)' }, {
          clipPath: 'circle(150% at calc(100% - 48px) 38px)',
          duration: prefersReducedMotion() ? 0.01 : 1,
          ease: 'expo.inOut',
        })
        .from('.menu-link-inner', { yPercent: 110, duration: 0.9, stagger: 0.05, ease: 'expo.out' }, '-=0.45')
        .from('.menu-foot > *', { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.06 }, '-=0.6');
    }, menu);
    return () => ctx.revert();
  }, []);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  // The overlay menu does not exist at desktop widths; close it on resize.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1100px)');
    const onChange = (e) => e.matches && closeMenu();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [closeMenu]);

  useEffect(() => {
    const tl = menuTl.current;
    const html = document.documentElement;
    if (!tl) return;
    if (isMenuOpen) {
      html.classList.add('menu-open');
      lockScroll();
      tl.timeScale(1).play();
      // The timeline makes the menu visible on its first tick; focus after it.
      const t = window.setTimeout(() => menuRef.current.querySelector('a')?.focus({ preventScroll: true }), 60);
      return () => window.clearTimeout(t);
    } else if (tl.progress() > 0) {
      html.classList.remove('menu-open');
      unlockScroll();
      tl.timeScale(1.6).reverse();
      menuButtonRef.current?.focus({ preventScroll: true });
      // A link chosen from the menu scrolls only once the lock has lifted.
      if (pendingHref.current) {
        const href = pendingHref.current;
        pendingHref.current = null;
        requestAnimationFrame(() => handleAnchorClick({ preventDefault() {} }, href));
      }
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeMenu();
      // Keep focus inside the open menu.
      if (e.key === 'Tab') {
        const focusables = [menuButtonRef.current, ...menuRef.current.querySelectorAll('a, button')];
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMenuOpen, closeMenu]);

  const onNavClick = (e, href) => {
    if (isMenuOpen) {
      e.preventDefault();
      pendingHref.current = href;
      setIsMenuOpen(false);
      return;
    }
    handleAnchorClick(e, href);
  };

  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <div ref={progressRef} className="scroll-progress-fill" />
      </div>

      <header ref={navRef} className="nav">
        <div className="nav-inner">
          <a href="#home" className="nav-logo" onClick={(e) => onNavClick(e, '#home')} aria-label="Aayush Bhadula — home">
            <span className="nav-logo-a">{logo.first}</span>
            <span className="nav-logo-b">{logo.second}</span>
            <span className="nav-logo-dot">{logo.dot}</span>
          </a>

          <nav className="nav-links" aria-label="Primary">
            <ul>
              {navItems.map((item) => {
                const isActive = activeSection === item.href.slice(1);
                return (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className={`nav-link ${isActive ? 'is-active' : ''}`}
                      aria-current={isActive ? 'location' : undefined}
                      onClick={(e) => onNavClick(e, item.href)}
                    >
                      <RollText>{item.label}</RollText>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="nav-actions">
            <ThemeToggle />
            <button
              ref={menuButtonRef}
              type="button"
              className={`menu-button ${isMenuOpen ? 'is-open' : ''}`}
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-expanded={isMenuOpen}
              aria-controls="site-menu"
              aria-label="Toggle menu"
            >
              <span className="menu-button-label"><RollText>{isMenuOpen ? 'Close' : 'Menu'}</RollText></span>
              <span className="menu-button-icon" aria-hidden="true"><span /><span /></span>
            </button>
          </div>
        </div>
      </header>

      <div ref={menuRef} id="site-menu" className="menu" aria-hidden={!isMenuOpen} inert={!isMenuOpen ? true : undefined}>
        <nav className="menu-nav" aria-label="Menu">
          <ul>
            {navItems.map((item, i) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={`menu-link ${activeSection === item.href.slice(1) ? 'is-active' : ''}`}
                  onClick={(e) => onNavClick(e, item.href)}
                >
                  <span className="menu-link-inner">
                    <span className="menu-link-index">{String(i + 1).padStart(2, '0')}</span>
                    <span className="menu-link-text">{item.label}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="menu-foot">
          <a href={`mailto:${contact.email}`} className="menu-email">{contact.email}</a>
          <div className="menu-socials">
            {socialLinks.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                {s.label} <FiArrowUpRight aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
