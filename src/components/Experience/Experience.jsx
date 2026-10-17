import { useLayoutEffect, useRef } from 'react';
import { FiBriefcase, FiCalendar, FiMapPin } from 'react-icons/fi';
import SectionHeading from '../SectionHeading/SectionHeading';
import { experiences, experienceLabels, experienceTitle } from '../../data/portfolio';
import { gsap, prefersReducedMotion } from '../../lib/motion';
import './Experience.css';

const Experience = () => {
  const sectionRef = useRef(null);

  // Each company name fills from outline to solid, and the rail draws, in step with scroll.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.exp-entry', sectionRef.current).forEach((entry) => {
        gsap.fromTo(entry.querySelector('.exp-company-fill'), { clipPath: 'inset(0% 100% 0% 0%)' }, {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          scrollTrigger: { trigger: entry, start: 'top 85%', end: 'top 30%', scrub: 0.6 },
        });
      });
      gsap.fromTo('.exp-rail-fill', { scaleY: 0 }, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: '.exp-timeline', start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="experience" className="section experience" aria-labelledby="experience-title">
      <div className="container">
        <SectionHeading index="03" label="Experience" title={experienceTitle} id="experience-title" />

        <div className="exp-timeline">
          <div className="exp-rail" aria-hidden="true"><div className="exp-rail-fill" /></div>

          {experiences.map((job) => (
            <article key={`${job.company}-${job.role}`} className="exp-entry">
              <span className="exp-node" aria-hidden="true"><FiBriefcase /></span>

              <div className="exp-left">
                <p className="exp-company">
                  <span className="sr-only">{job.company}</span>
                  <span className="exp-company-outline" aria-hidden="true">{job.company}</span>
                  <span className="exp-company-fill" aria-hidden="true">{job.company}</span>
                </p>
                {job.companyDetail && <p className="exp-company-detail">{job.companyDetail}</p>}
                <h3 className="exp-role">{job.role}</h3>
                <div className="exp-meta">
                  <span className="exp-meta-item">
                    <FiCalendar aria-hidden="true" />
                    {job.duration}
                  </span>
                  <span className="exp-meta-item">
                    <FiMapPin aria-hidden="true" />
                    {job.location}
                  </span>
                  {job.current && <span className="exp-meta-item exp-current">{experienceLabels.current}</span>}
                </div>
              </div>

              <div className="exp-right">
                <h4 className="label exp-resp-title">{experienceLabels.responsibilities}</h4>
                <ol className="exp-list" data-reveal="stagger">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index} className="exp-item">
                      <span className="exp-item-index">{String(index + 1).padStart(2, '0')}</span>
                      <span className="exp-item-text">{resp}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
