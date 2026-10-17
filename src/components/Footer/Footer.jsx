import { useLayoutEffect, useRef } from 'react';
import { FiArrowUp, FiHeart } from 'react-icons/fi';
import { footer } from '../../data/portfolio';
import { gsap, prefersReducedMotion } from '../../lib/motion';
import { scrollToTarget } from '../../lib/smoothScroll';
import './Footer.css';

const Footer = () => {
  const footerRef = useRef(null);

  // The three words slide in from alternating sides as the footer arrives.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.quote-word', footerRef.current).forEach((word, i) => {
        gsap.fromTo(word, { xPercent: i % 2 ? 18 : -18 }, {
          xPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: footerRef.current, start: 'top bottom', end: 'top 30%', scrub: 0.8 },
        });
      });
    }, footerRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="footer">
      <p className="footer-quote">
        <span className="sr-only">{footer.quote.join(' ')}</span>
        {footer.quote.map((word, i) => (
          <span key={word} className={`quote-word quote-word-${i + 1}`} aria-hidden="true">
            {word}
          </span>
        ))}
      </p>

      <div className="footer-bottom">
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} {footer.name}. {footer.madeWith}{' '}
          <span className="footer-heart" aria-hidden="true"><FiHeart /></span>{' '}
          {footer.andLotsOf}
        </p>
        <button type="button" className="footer-top" onClick={() => scrollToTarget('#home')}>
          <span>Back to top</span>
          <FiArrowUp aria-hidden="true" />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
