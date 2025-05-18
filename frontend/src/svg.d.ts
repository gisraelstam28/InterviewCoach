// src/svg.d.ts
declare module '*.svg' {
  import * as React from 'react';

  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

// Allow direct use of SVG tags in TSX
declare namespace JSX {
  interface IntrinsicElements {
    svg: React.SVGProps<SVGSVGElement>;
    path: React.SVGProps<SVGPathElement>;
    circle: React.SVGProps<SVGCircleElement>;
    // Add other SVG elements if needed (e.g., rect)
  }
}
