import SplitText from '../SplitText/SplitText';

/**
 * Shared section header: index rule + label, then the section's existing
 * title with its accent word set in italic serif.
 */
const SectionHeading = ({ index, label, title, id }) => (
  <header className="section-head">
    <div className="section-head-meta" data-reveal="fade">
      <span className="label">{index}</span>
      <span className="rule" />
      <span className="label">{label}</span>
    </div>
    <h2 className="section-title" id={id} data-reveal="chars">
      <SplitText text={title.lead} />{' '}
      <SplitText text={title.accent} className="serif" />
    </h2>
  </header>
);

export default SectionHeading;
