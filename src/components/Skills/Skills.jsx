import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import SplitText from '../SplitText/SplitText';
import { fundamentals, skillCategories, skillsTitle } from '../../data/portfolio';
import { skillsCar } from '../../config/media';
import './Skills.css';

const CarScene = lazy(() => import('../Three/CarScene'));

const pad = (n) => String(n).padStart(2, '0');

const Skills = () => {
  const trackRef = useRef(null);
  const revealRef = useRef(null);
  const [near, setNear] = useState(false);
  const [carReady, setCarReady] = useState(false);

  // Fetch three.js and the car only as the section approaches.
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNear(true);
        io.disconnect();
      }
    }, { rootMargin: '400% 0px' });
    io.observe(trackRef.current);
    return () => io.disconnect();
  }, []);

  const FundIcon = fundamentals.icon;

  return (
    <section id="skills" className="skills" aria-labelledby="skills-title">
      {/* Pinned drift stage: scroll drives the car (and reverses it). */}
      <div ref={trackRef} className="drift-track">
        <div className="drift-stage">
          <div className="drift-meta section-head-meta">
            <span className="label">02</span>
            <span className="rule" />
            <span className="label">Skills</span>
          </div>

          <div ref={revealRef} className={`drift-title-wrap ${carReady ? 'is-driven' : ''}`}>
            <h2 id="skills-title" className="drift-title">
              <SplitText text={skillsTitle.lead} />{' '}
              <SplitText text={skillsTitle.accent} className="serif" />
            </h2>
            {/* outline ghost shows where the car will "paint" the title */}
            <p className="drift-title drift-title-ghost" aria-hidden="true">
              {skillsTitle.lead} <span className="serif">{skillsTitle.accent}</span>
            </p>
          </div>

          <div className="drift-road" aria-hidden="true" />

          {near && (
            <Suspense fallback={null}>
              <CarScene url={skillsCar.url} trackRef={trackRef} revealRef={revealRef} onReady={() => setCarReady(true)} />
            </Suspense>
          )}

          <p className="drift-hint label" aria-hidden="true">Scroll</p>
        </div>
      </div>

      {/* Spec sheet */}
      <div className="container spec">
        <div className="spec-grid">
          {skillCategories.map((category, ci) => (
            <article key={category.title} className="spec-block" style={{ '--cat': category.color }} data-reveal="fade">
              <header className="spec-head">
                <span className="spec-index">{pad(ci + 1)}</span>
                <h3 className="spec-title">{category.title}</h3>
                <span className="spec-count">{pad(category.skills.length)}</span>
              </header>
              <ul className="spec-list">
                {category.skills.map((skill) => {
                  const Icon = skill.icon;
                  return (
                    <li key={skill.name} className="spec-item" style={{ '--brand': skill.color }}>
                      <span className="spec-icon" aria-hidden="true"><Icon /></span>
                      <span className="spec-name">{skill.name}</span>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}

          <article className="spec-block spec-block-text" data-reveal="fade">
            <header className="spec-head">
              <span className="spec-index">{pad(skillCategories.length + 1)}</span>
              <h3 className="spec-title">{fundamentals.title}</h3>
              <span className="spec-count" aria-hidden="true"><FundIcon /></span>
            </header>
            <p className="spec-text">{fundamentals.text}</p>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Skills;
