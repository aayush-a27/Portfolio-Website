import { useLayoutEffect, useRef } from 'react';
import { FiArrowUpRight, FiGithub, FiStar } from 'react-icons/fi';
import SectionHeading from '../SectionHeading/SectionHeading';
import SplitText from '../SplitText/SplitText';
import Magnetic from '../Magnetic/Magnetic';
import LiquidImage from '../LiquidImage/LiquidImage';
import { moreProjects, projectLabels, projects, projectsTitle } from '../../data/portfolio';
import { gsap, prefersReducedMotion } from '../../lib/motion';
import './Projects.css';

/** Rotating circular seal carrying the existing "FEATURED!" label. */
const FeaturedSeal = ({ label, id }) => {
  const text = `${label} · ${label} · ${label} · `;
  return (
    <div className="seal">
      <span className="sr-only">{label}</span>
      <svg className="seal-ring" viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <path id={id} d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
        </defs>
        <text>
          <textPath href={`#${id}`} textLength="289">{text}</textPath>
        </text>
      </svg>
      <FiStar className="seal-star" aria-hidden="true" />
    </div>
  );
};

const Projects = () => {
  const sectionRef = useRef(null);

  // Each chapter settles forward from a slightly receded state as it enters.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.project', sectionRef.current).forEach((el) => {
        gsap.fromTo(el, { scale: 0.92, '--project-radius': '48px' }, {
          scale: 1,
          '--project-radius': '24px',
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 35%', scrub: 0.6 },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="projects" className="section projects" aria-labelledby="projects-title">
      <div className="container">
        <SectionHeading index="04" label="Projects" title={projectsTitle} id="projects-title" />

        <div className="projects-list">
          {projects.map((project, index) => (
            <article key={project.title} className="project">
              <span className="project-ghost" aria-hidden="true" data-speed="0.8">
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="project-top">
                <div className="project-tags">
                  <span className="project-category">{project.category}</span>
                  {project.status && <span className="project-status">{project.status}</span>}
                </div>
                <FeaturedSeal label={projectLabels.featured} id={`seal-path-${index}`} />
              </div>

              <h3 className="project-title" data-reveal="words">
                <SplitText text={project.title} by="words" />
              </h3>

              {project.preview && (
                <LiquidImage
                  src={project.preview}
                  alt={project.title}
                  className="project-preview"
                  data-reveal="clip"
                  data-cursor={project.liveDemo ? 'view' : undefined}
                  data-cursor-label="View"
                />
              )}

              <div className="project-body">
                <div className="project-aside">
                  <p className="project-description">{project.description}</p>
                  {(project.liveDemo || project.github) && (
                    <div className="project-actions">
                      {project.liveDemo && (
                        <Magnetic>
                          <a href={project.liveDemo} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                            <span data-magnetic-inner>{projectLabels.liveDemo}</span>
                            <FiArrowUpRight aria-hidden="true" />
                          </a>
                        </Magnetic>
                      )}
                      {project.github && (
                        <Magnetic>
                          <a href={project.github} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
                            <FiGithub aria-hidden="true" />
                            <span data-magnetic-inner>{projectLabels.github}</span>
                          </a>
                        </Magnetic>
                      )}
                    </div>
                  )}
                </div>

                <div className="project-details">
                  <div className="project-block">
                    <h4 className="project-block-title">{projectLabels.features}</h4>
                    <ul className="project-features" data-reveal="stagger">
                      {project.features.map((feature) => (
                        <li key={feature} className="project-feature">
                          <span className="feature-check" aria-hidden="true">▸</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="project-block">
                    <h4 className="project-block-title">{projectLabels.techStack}</h4>
                    <dl className="tech-groups">
                      {Object.entries(project.techStack).map(([group, techs]) => (
                        <div key={group} className="tech-group">
                          <dt className="tech-group-label">{group}:</dt>
                          <dd>
                            <ul className="tech-pills">
                              {techs.map((tech) => (
                                <li key={tech} className="tech-pill">{tech}</li>
                              ))}
                            </ul>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="more">
          <h3 className="more-title" data-reveal="fade">{projectLabels.more}</h3>
          <ul className="more-grid" data-reveal="stagger">
            {moreProjects.map((p, i) => (
              <li key={p.title} className="more-item">
                <div className="more-head">
                  <span className="label">{String(projects.length + i + 1).padStart(2, '0')}</span>
                  <div className="more-links">
                    {p.liveDemo && (
                      <a href={p.liveDemo} target="_blank" rel="noopener noreferrer" aria-label={`${p.title} — ${projectLabels.liveDemo}`} data-cursor="view" data-cursor-label="Live">
                        <FiArrowUpRight aria-hidden="true" />
                      </a>
                    )}
                    <a href={p.github} target="_blank" rel="noopener noreferrer" aria-label={`${p.title} — ${projectLabels.github}`}>
                      <FiGithub aria-hidden="true" />
                    </a>
                  </div>
                </div>
                <h4 className="more-name">{p.title}</h4>
                <p className="more-desc">{p.description}</p>
                <ul className="more-tags">
                  {p.tags.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Projects;
