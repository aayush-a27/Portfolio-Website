import './Atmosphere.css';

/**
 * Fixed atmospheric layers: slow-drifting light pools behind the page and a
 * film-grain veil above it. Gradients are soft by construction (no blur
 * filters) and only transforms animate, so both stay on the compositor.
 */
const Atmosphere = () => (
  <>
    <div className="atmosphere" aria-hidden="true">
      <div className="atmo-glow atmo-glow-1" />
      <div className="atmo-glow atmo-glow-2" />
      <div className="atmo-glow atmo-glow-3" />
    </div>
    <div className="grain" aria-hidden="true" />
  </>
);

export default Atmosphere;
