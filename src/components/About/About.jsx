import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import './About.css';

const aboutItems = [
  {
    icon: '💻',
    title: 'Full Stack Developer',
    desc: 'Passionate about building end-to-end web applications with modern frameworks and clean architecture.',
    color: 'var(--color-cyan)',
  },
  {
    icon: '🎓',
    title: 'B.Tech Student',
    desc: 'Currently pursuing B.Tech with a strong focus on modern web development and software engineering.',
    color: 'var(--color-yellow)',
  },
  {
    icon: '🚀',
    title: 'Production-Ready Builder',
    desc: 'Enthusiastic about building production-ready applications, learning new technologies, and creating engaging user experiences.',
    color: 'var(--color-pink)',
  },
  {
    icon: '🤖',
    title: 'Innovation Explorer',
    desc: 'Loves solving problems, building innovative products, and exploring AI-powered applications.',
    color: 'var(--color-purple)',
  },
];

const factCards = [
  { emoji: '🚀', text: 'Full Stack MERN Developer', bg: 'var(--color-cyan)' },
  { emoji: '🎓', text: 'B.Tech Graduated', bg: 'var(--color-yellow)' },
  { emoji: '💡', text: 'Always Learning New Technologies', bg: 'var(--color-pink)' },
  { emoji: '🤖', text: 'Interested in AI Applications', bg: 'var(--color-orange)' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" className="about section">
      <div className="halftone-overlay" />
      <div className="container" ref={ref}>
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">
            About <span style={{ color: 'var(--color-cyan)' }}>Me</span>
          </h2>
        </motion.div>

        {/* Bio */}
        <motion.div
          className="about-bio"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="about-bio-bubble">
            <p>
              I am a passionate <strong>Full Stack Developer</strong> specializing in building
              responsive, scalable, and high-performance web applications. I enjoy transforming
              ideas into real-world products and continuously exploring new technologies.
            </p>
          </div>
        </motion.div>

        {/* About Cards Grid */}
        <motion.div
          className="about-grid"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {aboutItems.map((item, index) => (
            <motion.div
              key={index}
              className="about-card memphis-card"
              variants={itemVariants}
              whileHover={{ scale: 1.03, rotate: index % 2 === 0 ? 1 : -1 }}
              style={{ '--card-accent': item.color }}
            >
              <div className="about-card-accent" style={{ background: item.color }} />
              <span className="about-card-icon">{item.icon}</span>
              <h3 className="about-card-title">{item.title}</h3>
              <p className="about-card-desc">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Fun Fact Stickers */}
        <motion.div
          className="fact-stickers"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <h3 className="fact-stickers-title">Quick Facts ⚡</h3>
          <div className="fact-stickers-grid">
            {factCards.map((fact, index) => (
              <motion.div
                key={index}
                className="comic-sticker fact-sticker"
                style={{ background: fact.bg, color: '#1A1A2E' }}
                variants={itemVariants}
                whileHover={{ scale: 1.1, rotate: Math.random() > 0.5 ? 5 : -5 }}
              >
                <span className="fact-emoji">{fact.emoji}</span>
                <span>{fact.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
