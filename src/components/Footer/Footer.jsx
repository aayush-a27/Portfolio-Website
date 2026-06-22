import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FiHeart } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <footer className="footer" ref={ref}>
      {/* Zigzag divider */}
      <div className="footer-divider" />

      <div className="container footer-container">
        {/* Decorative shapes */}
        <div className="footer-shapes" aria-hidden="true">
          <div className="footer-circle-1" />
          <div className="footer-circle-2" />
          <div className="footer-triangle" />
        </div>

        <motion.div
          className="footer-quote"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="quote-word quote-code">Code.</span>
          <span className="quote-word quote-create">Create.</span>
          <span className="quote-word quote-innovate">Innovate.</span>
        </motion.div>

        <motion.div
          className="footer-bottom"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
        >
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} Aayush Bhadula. Made with{' '}
            <motion.span
              className="footer-heart"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <FiHeart />
            </motion.span>{' '}
            and lots of ☕
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
