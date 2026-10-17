import { memo } from 'react';

/**
 * Splits text into masked words (and optionally characters) for staggered
 * reveals. Screen readers get the intact string; the split copy is hidden
 * from assistive tech.
 *
 *   by="chars" → .split-word > .split-char
 *   by="words" → .split-word > .split-word-inner
 */
const SplitText = ({ text, by = 'chars', as: Tag = 'span', className = '', charClassName = '', ...rest }) => {
  const words = text.split(' ');
  let charIndex = 0;

  return (
    <Tag className={className} {...rest}>
      <span className="sr-only">{text}</span>
      <span className="split" aria-hidden="true">
        {words.map((word, wi) => (
          <span key={wi}>
            <span className="split-word">
              {by === 'chars' ? (
                Array.from(word).map((ch, ci) => (
                  <span key={ci} className={`split-char ${charClassName}`} style={{ '--ci': charIndex++ }}>
                    {ch}
                  </span>
                ))
              ) : (
                <span className="split-word-inner" style={{ '--wi': wi }}>{word}</span>
              )}
            </span>
            {wi < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </Tag>
  );
};

export default memo(SplitText);
