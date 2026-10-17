import SectionHeading from '../SectionHeading/SectionHeading';
import SplitText from '../SplitText/SplitText';
import { about, aboutItems, education, factCards } from '../../data/portfolio';
import './About.css';

/** Moves a soft spotlight to the pointer inside whichever item is hovered. */
const spotlight = (e) => {
  const item = e.target.closest('[data-spotlight]');
  if (!item) return;
  const r = item.getBoundingClientRect();
  item.style.setProperty('--mx', `${e.clientX - r.left}px`);
  item.style.setProperty('--my', `${e.clientY - r.top}px`);
};

const About = () => (
  <section id="about" className="section about" aria-labelledby="about-title">
    <div className="container">
      <SectionHeading index="01" label="About" title={about.title} id="about-title" />

      <p className="about-bio" data-reveal="scrub-words">
        {about.bio.map((part, i) => {
          const text = <SplitText text={part.text.trim()} by="words" />;
          return (
            <span key={i}>
              {i > 0 ? ' ' : null}
              {part.strong ? <strong className="about-bio-strong">{text}</strong> : text}
            </span>
          );
        })}
      </p>

      <ul className="about-items" data-reveal="stagger" onPointerMove={spotlight}>
        {aboutItems.map((item, index) => (
          <li key={item.title} className="about-item" data-spotlight style={{ '--item-accent': item.color }}>
            <div className="about-item-top">
              <span className="label">{String(index + 1).padStart(2, '0')}</span>
              <span className="about-item-icon" aria-hidden="true">{item.icon}</span>
            </div>
            <h3 className="about-item-title">{item.title}</h3>
            <p className="about-item-desc">{item.desc}</p>
          </li>
        ))}
      </ul>

      <div className="edu">
        <h3 className="edu-title label" data-reveal="fade">{about.educationTitle}</h3>
        <ul className="edu-list" data-reveal="stagger">
          {education.map((e) => (
            <li key={e.title} className="edu-item">
              <span className="edu-period">{e.period}</span>
              <span className="edu-name">{e.title}</span>
              <span className="edu-place">{e.place}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="facts">
        <h3 className="facts-title" data-reveal="fade">{about.factsTitle}</h3>
        <ul className="facts-list" data-reveal="stagger">
          {factCards.map((fact) => (
            <li key={fact.text} className="fact" style={{ '--fact-accent': fact.bg }}>
              <span className="fact-emoji" aria-hidden="true">{fact.emoji}</span>
              <span>{fact.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

export default About;
