import React from "react";

export default function BehanceMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="behance-mark"
      width={size * 1.5}
      height={size}
      viewBox="0 0 28 20"
      role="img"
      aria-label="Behance"
      focusable="false"
      fill="currentColor"
    >
      <title>Behance</title>
      <path d="M2 3h6.9c3.6 0 5.7 1.6 5.7 4.1 0 1.35-.72 2.44-1.94 3.05 1.67.57 2.64 1.8 2.64 3.47C15.3 16.54 12.83 18 9.08 18H2V3Zm3.2 2.6v3.4h3.1c1.64 0 2.7-.5 2.7-1.72 0-1.16-.94-1.68-2.7-1.68H5.2Zm0 5.92v3.88h3.73c1.78 0 2.98-.56 2.98-1.93 0-1.35-1.12-1.95-2.98-1.95H5.2Z" />
      <path d="M17.2 12.2c.08 2.1 1.2 3.22 3.16 3.22 1.13 0 1.97-.45 2.51-1.34h2.82c-.8 2.6-2.67 4.05-5.39 4.05-3.85 0-6.28-2.4-6.28-6.55 0-4.05 2.38-6.54 6.12-6.54 3.7 0 5.93 2.48 5.93 6.56 0 .2 0 .4-.03.6H17.2Zm5.74-2.08c-.18-1.79-1.15-2.68-2.79-2.68-1.65 0-2.68.9-2.9 2.68h5.69Z" />
      <path d="M18 2h7.5v1.75H18z" />
    </svg>
  );
}
