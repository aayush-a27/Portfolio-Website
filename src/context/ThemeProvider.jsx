import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ThemeContext } from './contexts';
import { prefersReducedMotion } from '../lib/motion';

const STORAGE_KEY = 'portfolio-theme';

const readInitialTheme = () => {
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'light' ? 'light' : 'dark';
};

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme);
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable (private mode) — theme still applies for this visit */
    }
  }, [theme]);

  /**
   * Switches theme with a circular reveal expanding from the toggle
   * (View Transitions API), falling back to a colour cross-fade.
   */
  const toggleTheme = useCallback((event) => {
    const next = themeRef.current === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    const apply = () => {
      root.setAttribute('data-theme', next);
      flushSync(() => setTheme(next));
    };

    if (prefersReducedMotion()) {
      apply();
      return;
    }

    if (!document.startViewTransition) {
      root.classList.add('theme-fading');
      apply();
      window.setTimeout(() => root.classList.remove('theme-fading'), 650);
      return;
    }

    const rect = event?.currentTarget?.getBoundingClientRect?.();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 40;
    const y = rect ? rect.top + rect.height / 2 : 40;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(apply);
    transition.ready
      .then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 750, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' }
        );
      })
      .catch(() => {});
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
