import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FiMail, FiLinkedin, FiInstagram } from 'react-icons/fi';
import './Contact.css';

const socialLinks = [
  {
    icon: FiLinkedin,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/aayush-bhadula-a78a67298/',
    color: 'var(--color-blue)',
    shape: 'circle',
  },
  {
    icon: FiInstagram,
    label: 'Instagram',
    href: 'https://www.instagram.com/aayush.developer/',
    color: 'var(--color-pink)',
    shape: 'square',
  },
];

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="contact" className="contact section">
      <div className="halftone-overlay" />
      <div className="container" ref={ref}>
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">
            Get In <span style={{ color: 'var(--color-pink)' }}>Touch</span>
          </h2>
        </motion.div>

        <div className="contact-centered">

          {/* Social Links & Info */}
          <motion.div
            className="contact-info"
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="contact-text-card memphis-card">
              <h3 className="contact-info-title">Let's Work Together! 🤝</h3>
              <p className="contact-info-desc">
                Have a project in mind, a question, or just want to say hi?
                Feel free to reach out. I'd love to hear from you!
              </p>

              <div className="contact-email-display">
                <FiMail />
                <a href="mailto:aayushbhadula567@gmail.com">
                  aayushbhadula567@gmail.com
                </a>
              </div>

              {/* Social Links in geometric containers */}
              <div className="social-links">
                <h4 className="social-title">Find Me On</h4>
                <div className="social-grid">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <motion.a
                        key={social.label}
                        href={social.href}
                        className={`social-link social-shape-${social.shape}`}
                        style={{ '--social-color': social.color }}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.7 + index * 0.15 }}
                        whileHover={{ scale: 1.15, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Icon size={24} />
                        <span className="social-label">{social.label}</span>
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
