import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CustomCursor from './components/CustomCursor/CustomCursor';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import Atmosphere from './components/Atmosphere/Atmosphere';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import Marquee from './components/Marquee/Marquee';
import About from './components/About/About';
import Skills from './components/Skills/Skills';
import Experience from './components/Experience/Experience';
import Projects from './components/Projects/Projects';
import Work from './components/Work/Work';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import { AppStateContext } from './context/contexts';
import { skillCategories } from './data/portfolio';
import { ScrollTrigger } from './lib/motion';
import { initSmoothScroll, lockScroll, scrollToTarget, unlockScroll } from './lib/smoothScroll';
import useReveals from './hooks/useReveals';
import './App.css';

// Every distinct skill name, for the decorative marquee band.
const marqueeSkills = [...new Set(skillCategories.flatMap((c) => c.skills.map((s) => s.name)))];

function App() {
  const [ready, setReady] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    return initSmoothScroll();
  }, []);

  // Hold the page still under the loader; afterwards honour any #hash.
  useEffect(() => {
    if (!ready) {
      lockScroll();
      return;
    }
    unlockScroll();
    ScrollTrigger.refresh();
    if (window.location.hash) scrollToTarget(window.location.hash, { immediate: true });
  }, [ready]);

  // Back / forward between section hashes.
  useEffect(() => {
    const onPop = () => scrollToTarget(window.location.hash || '#home');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useReveals(mainRef);

  const handleLoadingComplete = useCallback(() => setReady(true), []);
  const appState = useMemo(() => ({ ready }), [ready]);

  return (
    <AppStateContext.Provider value={appState}>
      <a className="skip-link" href="#main">Skip to content</a>
      <CustomCursor />
      <Atmosphere />
      {!ready && <LoadingScreen onComplete={handleLoadingComplete} />}

      <Navbar />

      <main id="main" ref={mainRef}>
        <Hero />
        <Marquee items={marqueeSkills} outline />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Work />
        <Contact />
      </main>

      <Footer />
    </AppStateContext.Provider>
  );
}

export default App;
