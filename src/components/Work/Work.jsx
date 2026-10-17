import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { FiArrowLeft, FiArrowRight, FiBox, FiLayers } from 'react-icons/fi';
import SectionHeading from '../SectionHeading/SectionHeading';
import LiquidImage from '../LiquidImage/LiquidImage';
import Magnetic from '../Magnetic/Magnetic';
import { work3d, workMedium, workTitle } from '../../config/media';
import { preloadLiquidTexture } from '../../lib/webgl/liquid';
import { gsap, hasFinePointer } from '../../lib/motion';
import './Work.css';

const ModelViewer = lazy(() => import('../Three/ModelViewer'));

const pad = (n) => String(n).padStart(2, '0');

const Work = () => {
  const [index, setIndex] = useState(0);
  const [showIteration, setShowIteration] = useState(false);
  const [origin, setOrigin] = useState({ x: 0.5, y: 0.5 });
  const [viewerItem, setViewerItem] = useState(null);
  const previewRef = useRef(null);
  const indexListRef = useRef(null);

  const item = work3d[index];
  const total = work3d.length;
  const src = showIteration && item.iteration ? item.iteration : item.image;
  const nextItem = work3d[(index + 1) % total];

  // Warm the next transition's textures.
  useEffect(() => {
    preloadLiquidTexture(nextItem.image);
    if (item.iteration) preloadLiquidTexture(item.iteration);
  }, [item, nextItem]);

  const goTo = useCallback((i, from = { x: 0.5, y: 0.5 }) => {
    setOrigin(from);
    setShowIteration(false);
    setIndex(((i % total) + total) % total);
  }, [total]);

  const onStageClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    goTo(index + 1, { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height });
  };

  const toggleIteration = () => {
    setOrigin({ x: 0.5, y: 0.5 });
    setShowIteration((v) => !v);
  };

  // Floating preview that trails the cursor over the index list.
  useEffect(() => {
    const list = indexListRef.current;
    const preview = previewRef.current;
    if (!list || !preview || !hasFinePointer()) return;
    const xTo = gsap.quickTo(preview, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(preview, 'y', { duration: 0.6, ease: 'power3.out' });
    const onMove = (e) => {
      const r = list.getBoundingClientRect();
      xTo(e.clientX - r.left);
      yTo(e.clientY - r.top);
    };
    list.addEventListener('pointermove', onMove);
    return () => list.removeEventListener('pointermove', onMove);
  }, []);

  const showPreview = (piece) => {
    const preview = previewRef.current;
    if (!preview || !hasFinePointer()) return;
    preview.querySelector('img').src = piece.image;
    preview.classList.add('is-visible');
  };
  const hidePreview = () => previewRef.current?.classList.remove('is-visible');

  return (
    <section id="work" className="section work" aria-labelledby="work-title">
      <div className="container">
        <SectionHeading index="05" label="3D Work" title={workTitle} id="work-title" />

        <div className="work-layout">
          <div className="work-main">
            <div
              className="work-stage"
              onClick={onStageClick}
              data-cursor="view"
              data-cursor-label="Next"
              data-reveal="clip"
            >
              <LiquidImage
                src={src}
                alt={`${item.title} — 3D render${showIteration ? ' (iteration)' : ''}`}
                origin={origin}
                className="work-stage-img"
              />
            </div>

            <div className="work-caption">
              <div className="work-caption-text" aria-live="polite">
                <span className="label">{pad(index + 1)} / {pad(total)}</span>
                <h3 key={item.id} className="work-title">
                  <span className="sr-only">{item.title}</span>
                  <span aria-hidden="true">
                    {Array.from(item.title).map((ch, i) => (
                      <span key={i} className="work-title-char" style={{ '--ci': i }}>{ch === ' ' ? ' ' : ch}</span>
                    ))}
                  </span>
                </h3>
                <span className="label">{workMedium}</span>
              </div>

              <div className="work-controls">
                <button type="button" className="work-arrow" onClick={() => goTo(index - 1, { x: 0, y: 0.5 })} aria-label="Previous piece">
                  <FiArrowLeft />
                </button>
                <button type="button" className="work-arrow" onClick={() => goTo(index + 1, { x: 1, y: 0.5 })} aria-label={`Next piece: ${nextItem.title}`}>
                  <FiArrowRight />
                </button>
                {item.iteration && (
                  <button
                    type="button"
                    className={`work-toggle ${showIteration ? 'is-on' : ''}`}
                    onClick={toggleIteration}
                    aria-pressed={showIteration}
                  >
                    <FiLayers aria-hidden="true" />
                    <span>Iteration {showIteration ? '02' : '01'}</span>
                  </button>
                )}
                {item.model && (
                  <Magnetic>
                    <button type="button" className="btn btn-primary" onClick={() => setViewerItem(item)}>
                      <FiBox aria-hidden="true" />
                      <span data-magnetic-inner>Inspect in 3D</span>
                    </button>
                  </Magnetic>
                )}
              </div>
            </div>
          </div>

          <div className="work-index-wrap" ref={indexListRef} onPointerLeave={hidePreview}>
            <ol className="work-index" data-reveal="stagger">
              {work3d.map((piece, i) => (
                <li key={piece.id}>
                  <button
                    type="button"
                    className={`work-index-item ${i === index ? 'is-active' : ''}`}
                    aria-current={i === index ? 'true' : undefined}
                    onClick={() => goTo(i, { x: 1, y: 0.5 })}
                    onPointerEnter={() => showPreview(piece)}
                  >
                    <span className="work-index-num">{pad(i + 1)}</span>
                    <span className="work-index-title">{piece.title}</span>
                    {piece.model && (
                      <>
                        <FiBox className="work-index-badge" aria-hidden="true" />
                        <span className="sr-only">(interactive 3D model)</span>
                      </>
                    )}
                  </button>
                </li>
              ))}
            </ol>
            <div ref={previewRef} className="work-preview" aria-hidden="true">
              <img src={work3d[0].image} alt="" />
            </div>
          </div>
        </div>
      </div>

      {viewerItem && (
        <Suspense fallback={null}>
          <ModelViewer item={viewerItem} onClose={() => setViewerItem(null)} />
        </Suspense>
      )}
    </section>
  );
};

export default Work;
