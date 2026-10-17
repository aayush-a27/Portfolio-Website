import { FiArrowUpRight, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import SectionHeading from '../SectionHeading/SectionHeading';
import SplitText from '../SplitText/SplitText';
import Magnetic from '../Magnetic/Magnetic';
import { contact, socialLinks } from '../../data/portfolio';
import './Contact.css';

const Contact = () => (
  <section id="contact" className="section contact" aria-labelledby="contact-title">
    <div className="container">
      <SectionHeading index="06" label="Contact" title={contact.title} id="contact-title" />

      <h3 className="contact-heading" data-reveal="chars">
        <SplitText text={contact.heading} />
      </h3>

      <div className="contact-grid">
        <div className="contact-side" data-reveal="fade">
          <p className="contact-desc">{contact.description}</p>
          <ul className="contact-details">
            <li>
              <FiPhone aria-hidden="true" />
              <a href={'tel:' + contact.phone.replace(/\s+/g, '')}>{contact.phone}</a>
            </li>
            <li>
              <FiMapPin aria-hidden="true" />
              <span>{contact.location}</span>
            </li>
          </ul>
        </div>

        <div className="contact-email-wrap" data-reveal="fade" data-delay="0.15">
          <Magnetic strength={0.15}>
            <a href={`mailto:${contact.email}`} className="contact-email" data-cursor="view" data-cursor-label="Email">
              <FiMail className="contact-email-icon" aria-hidden="true" />
              <span data-magnetic-inner className="contact-email-text">
                {/* <wbr> lets narrow screens break after the @ instead of mid-word */}
                {contact.email.split('@')[0]}@<wbr />{contact.email.split('@')[1]}
              </span>
              <FiArrowUpRight className="contact-email-arrow" aria-hidden="true" />
            </a>
          </Magnetic>
        </div>
      </div>

      <div className="social">
        <h4 className="label" data-reveal="fade">{contact.socialTitle}</h4>
        <ul className="social-list" data-reveal="stagger">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <li key={social.label}>
                <a
                  href={social.href}
                  className={`social-row social-shape-${social.shape}`}
                  style={{ '--social': social.color }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="social-icon" aria-hidden="true"><Icon /></span>
                  <span className="social-label">{social.label}</span>
                  <FiArrowUpRight className="social-arrow" aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  </section>
);

export default Contact;
