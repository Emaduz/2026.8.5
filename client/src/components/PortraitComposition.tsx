type PortraitCompositionProps = {
  compact?: boolean;
  className?: string;
  static?: boolean;
  src?: string;
  alt?: string;
};

export default function PortraitComposition({ compact = false, className = "", static: isStatic = false, src = "/api/portrait?v=9", alt = "EmadAlddine profile portrait" }: PortraitCompositionProps) {
  return (
    <div
      className={`portrait-composition ${compact ? "portrait-composition-compact" : ""} ${isStatic ? "portrait-composition-static" : ""} ${className}`}
      aria-label={alt}
      onContextMenu={event => event.preventDefault()}
    >
      {!isStatic && <>
        <div className="portrait-orbit portrait-orbit-one" aria-hidden="true">
          <span className="portrait-asteroid portrait-asteroid-one" />
        </div>
        <div className="portrait-orbit portrait-orbit-two" aria-hidden="true">
          <span className="portrait-asteroid portrait-asteroid-two" />
        </div>
        <div className="portrait-orbit portrait-orbit-three" aria-hidden="true">
          <span className="portrait-asteroid portrait-asteroid-three" />
        </div>
      </>}
      <div className="portrait-image-wrap" style={{ width: "70%", aspectRatio: "1" }}>
        <img
          src={src}
          alt={alt}
          className="portrait-fit-zoom"
          draggable={false}
          onDragStart={event => event.preventDefault()}
        />
      </div>
    </div>
  );
}
