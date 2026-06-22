import './FloatingShapes.css';

const FloatingShapes = () => {
  return (
    <div className="floating-shapes" aria-hidden="true">
      {/* Circles */}
      <div className="fs fs-circle fs-1" />
      <div className="fs fs-circle fs-2" />
      <div className="fs fs-circle fs-3" />

      {/* Triangles */}
      <div className="fs fs-triangle fs-4" />
      <div className="fs fs-triangle fs-5" />

      {/* Squares */}
      <div className="fs fs-square fs-6" />
      <div className="fs fs-square fs-7" />

      {/* Crosses */}
      <div className="fs fs-cross-el fs-8" />
      <div className="fs fs-cross-el fs-9" />

      {/* Dots cluster */}
      <div className="fs fs-dots fs-10" />
      <div className="fs fs-dots fs-11" />

      {/* Zigzag */}
      <div className="fs fs-zigzag fs-12" />
    </div>
  );
};

export default FloatingShapes;
