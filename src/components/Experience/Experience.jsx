import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FiBriefcase, FiCalendar, FiClock } from 'react-icons/fi';
import './Experience.css';

const experience = {
  company: 'AventIQ',
  role: 'Full Stack Developer Intern',
  duration: 'December 8, 2025 - March 8, 2026',
  durationLength: '4 Months',
  responsibilities: [
    'Developed and maintained full-stack web applications.',
    'Collaborated with team members on frontend and backend features.',
    'Built scalable APIs and responsive user interfaces.',
    'Participated in debugging, testing, and code reviews.',
  ],
};

const Experience = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="experience" className="experience section">
      <div className="halftone-overlay" />
      <div className="container" ref={ref}>
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">
            My <span style={{ color: 'var(--color-orange)' }}>Experience</span>
          </h2>
        </motion.div>

        <div className="timeline">
          {/* Timeline line */}
          <motion.div
            className="timeline-line"
            initial={{ height: 0 }}
            animate={isInView ? { height: '100%' } : {}}
            transition={{ duration: 1, delay: 0.3 }}
          />

          {/* Timeline node */}
          <motion.div
            className="timeline-node"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
          >
            <FiBriefcase size={20} />
          </motion.div>

          {/* Experience card */}
          <motion.div
            className="experience-card memphis-card"
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Card decorative elements */}
            <div className="exp-card-shapes" aria-hidden="true">
              <div className="exp-shape-circle" />
              <div className="exp-shape-dots" />
            </div>

            {/* Company badge */}
            <motion.div
              className="exp-company-badge"
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 0.8, type: 'spring' }}
            >
              {experience.company}
            </motion.div>

            <h3 className="exp-role">{experience.role}</h3>

            <div className="exp-meta">
              <div className="exp-meta-item">
                <FiCalendar />
                <span>{experience.duration}</span>
              </div>
              <div className="exp-meta-item exp-duration-badge">
                <FiClock />
                <span>{experience.durationLength}</span>
              </div>
            </div>

            <div className="exp-responsibilities">
              <h4 className="exp-resp-title">Key Responsibilities</h4>
              <ul className="exp-resp-list">
                {experience.responsibilities.map((resp, index) => (
                  <motion.li
                    key={index}
                    className="exp-resp-item"
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.9 + index * 0.1 }}
                  >
                    <span className="exp-bullet" />
                    {resp}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
