import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FiExternalLink, FiGithub, FiStar } from 'react-icons/fi';
import './Projects.css';

const projects = [
  {
    title: 'AI Resume Builder',
    category: 'Full Stack Web Application',
    description:
      'AI Resume Builder is a modern full-stack web application that enables users to create professional and ATS-friendly resumes with ease. Users can manage personal information, education, experience, skills, and projects through an intuitive interface while previewing changes in real time.',
    features: [
      'AI-powered professional summary generation using Google Gemini',
      'Create and manage multiple resume sections',
      'Real-time resume preview',
      'Multiple professional resume templates',
      'Export resumes as ATS-friendly PDFs',
      'Dark and Light theme support',
      'Responsive design across all devices',
      'Local storage support',
    ],
    techStack: {
      Frontend: ['React', 'Vite', 'Tailwind CSS', 'Context API', 'React Hook Form'],
      Backend: ['Node.js', 'Express.js', 'MongoDB'],
      AI: ['Google Gemini API'],
      Deployment: ['Vercel'],
    },
    liveDemo: 'https://ai-resume-builder-sigma-one.vercel.app',
    github: 'https://github.com/aayush-a27/AI-Resume-Builder',
  },
  {
    title: 'B2B Commodity Trading & Logistics Platform',
    category: 'Full Stack Web Application',
    description:
      'Architected and developed a scalable B2B commodity trading and logistics platform using the MERN stack. Designed and implemented modular RESTful APIs to manage supply chain entities such as freight pricing, ports, and incoterms.',
    features: [
      'Built a responsive admin dashboard using React, Tailwind CSS, and modern UI libraries',
      'Implemented bulk data ingestion (CSV/Excel) using Node.js streams with Papaparse and ExcelJS',
      'Optimized performance using React Query, Redux Toolkit, and Redis caching',
      'Secured system with JWT-based RBAC'
    ],
    techStack: {
      Frontend: ['React.js', 'Tailwind CSS', 'React Query', 'Redux'],
      Backend: ['Node.js', 'Express.js', 'MongoDB', 'Redis'],
    },
  }
];

const techColors = {
  React: 'var(--color-cyan)',
  Vite: 'var(--color-purple)',
  'Tailwind CSS': 'var(--color-blue)',
  'Context API': 'var(--color-orange)',
  'React Hook Form': 'var(--color-pink)',
  'Node.js': 'var(--color-lime)',
  'Express.js': 'var(--color-yellow)',
  MongoDB: 'var(--color-lime)',
  'Google Gemini API': 'var(--color-blue)',
  Vercel: 'var(--color-purple)',
  'React.js': 'var(--color-cyan)',
  Redis: 'var(--color-orange)',
  'React Query': 'var(--color-pink)',
  Redux: 'var(--color-purple)',
};

const Projects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="projects" className="projects section">
      <div className="halftone-overlay" />
      <div className="container" ref={ref}>
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">
            My <span style={{ color: 'var(--color-purple)' }}>Projects</span>
          </h2>
        </motion.div>

        <div className="projects-list" style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
          {projects.map((project, index) => (
            <motion.div
              key={index}
              className="featured-project"
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + index * 0.2, duration: 0.7 }}
            >
              {/* Decorative shapes */}
              <div className="project-shapes" aria-hidden="true">
                <div className="proj-shape-circle-1" />
                <div className="proj-shape-circle-2" />
                <div className="proj-shape-triangle" />
                <div className="proj-shape-dots" />
                <div className="proj-shape-square" />
              </div>

              {/* Featured sticker */}
              <motion.div
                className="featured-sticker"
                initial={{ rotate: -20, scale: 0 }}
                animate={isInView ? { rotate: -12, scale: 1 } : {}}
                transition={{ delay: 0.8 + index * 0.2, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.1, rotate: 0 }}
              >
                <FiStar /> FEATURED!
              </motion.div>

              <div className="project-content">
                {/* Category badge */}
                <motion.span
                  className="project-category"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.5 + index * 0.2 }}
                >
                  {project.category}
                </motion.span>

                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>

                {/* Features list */}
                <div className="project-features">
                  <h4 className="project-features-title">✨ Key Features</h4>
                  <ul className="project-features-list">
                    {project.features.map((feature, fIndex) => (
                      <motion.li
                        key={fIndex}
                        className="project-feature-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.7 + fIndex * 0.08 + index * 0.2 }}
                      >
                        <span className="feature-check">▸</span>
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack */}
                <div className="project-tech">
                  <h4 className="project-tech-title">🛠️ Tech Stack</h4>
                  <div className="tech-groups">
                    {Object.entries(project.techStack).map(([group, techs]) => (
                      <div key={group} className="tech-group">
                        <span className="tech-group-label">{group}:</span>
                        <div className="tech-pills">
                          {techs.map((tech) => (
                            <motion.span
                              key={tech}
                              className="tech-pill"
                              style={{
                                background: techColors[tech] || 'var(--color-cyan)',
                                color: '#1A1A2E',
                              }}
                              whileHover={{ scale: 1.1, y: -3 }}
                            >
                              {tech}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                {(project.liveDemo || project.github) && (
                  <div className="project-actions">
                    {project.liveDemo && (
                      <motion.a
                        href={project.liveDemo}
                        className="memphis-btn memphis-btn-primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FiExternalLink /> Live Demo
                      </motion.a>
                    )}
                    {project.github && (
                      <motion.a
                        href={project.github}
                        className="memphis-btn memphis-btn-secondary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FiGithub /> GitHub
                      </motion.a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
