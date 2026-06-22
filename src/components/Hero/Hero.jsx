import { motion } from 'framer-motion';
import { FiArrowDown, FiDownload, FiMail } from 'react-icons/fi';
import resumePdf from '../../assets/AayushBhadulaUpdatedResume (1).pdf';
import './Hero.css';

const Hero = () => {
  const handleScroll = (href) => {
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="hero section">
      <div className="halftone-overlay" />

      {/* Decorative shapes */}
      <div className="hero-shapes" aria-hidden="true">
        <div className="hero-circle-1 animate-float" />
        <div className="hero-circle-2 animate-float-reverse" />
        <div className="hero-triangle-1 animate-wiggle" />
        <div className="hero-square-1 animate-spin-slow" />
        <div className="hero-dots-1" />
        <div className="hero-zigzag-1" />
        <div className="hero-cross-1" />
      </div>

      <div className="container hero-container">
        <div className="hero-content">
          {/* Speech bubble */}
          <motion.div
            className="speech-bubble hero-speech"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            Full Stack Developer 🚀
          </motion.div>

          {/* Main heading */}
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <span className="hero-hi">Hi, I'm</span>
            <span className="hero-name">
              <span className="name-aayush">Aayush</span>{' '}
              <span className="name-bhadula">Bhadula</span>
            </span>
            <span className="hero-wave">👋</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            Full Stack Developer crafting <span className="highlight-text">scalable</span>,{' '}
            <span className="highlight-text-alt">modern</span>, and{' '}
            <span className="highlight-text-third">user-centric</span> web experiences.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="hero-cta"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <motion.button
              className="memphis-btn memphis-btn-primary"
              onClick={() => handleScroll('#projects')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Projects
            </motion.button>
            <motion.a
              href={resumePdf}
              download="Aayush_Bhadula_Resume.pdf"
              className="memphis-btn memphis-btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiDownload /> Resume
            </motion.a>
            <motion.button
              className="memphis-btn memphis-btn-tertiary"
              onClick={() => handleScroll('#contact')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiMail /> Contact Me
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          onClick={() => handleScroll('#about')}
        >
          <span className="scroll-text">Scroll Down</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <FiArrowDown size={20} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
