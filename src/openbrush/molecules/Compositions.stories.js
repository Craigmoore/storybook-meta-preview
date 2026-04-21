import { setColor, setSize, rect, circle, polygon, star, line, path } from '../utils.js';
import { openbrushStory } from '../story.js';

export default { title: 'OpenBrush/Molecules/Compositions' };

const SIZE = setSize(0.025);

export const NestedSquares = {
  render: () => openbrushStory({ commands: [
    SIZE,
    ...[ 1.6, 1.2, 0.8, 0.4 ].flatMap((s, i) => {
      const hue = i / 4;
      return [
        setColor(1 - hue * 0.7, 0.27 + hue * 0.5, 0.376 + hue * 0.3),
        ...rect(0, 0, s, s),
      ];
    }),
  ]}),
};

export const ConcentricCircles = {
  render: () => openbrushStory({ commands: [
    SIZE,
    ...[ 1.5, 1.1, 0.75, 0.45, 0.2 ].flatMap((r, i) => {
      const t = i / 5;
      return [
        setColor(t, 0.8 - t * 0.5, 1 - t),
        ...circle(0, 0, r, 96),
      ];
    }),
  ]}),
};

// 8-fold mandala: concentric rings of polygons
export const Mandala = {
  render: () => openbrushStory({ commands: [
    SIZE,
    // Outer ring: 8 pentagons
    ...Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      const t = i / 8;
      return [
        setColor(0.914, 0.271 + t * 0.4, 0.376),
        ...polygon(Math.cos(a) * 1.1, Math.sin(a) * 1.1, 0.28, 5, a),
      ];
    }).flat(),
    // Middle ring: 6 triangles
    ...Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      return [
        setColor(0, 0.8, 1),
        ...polygon(Math.cos(a) * 0.6, Math.sin(a) * 0.6, 0.2, 3, a),
      ];
    }).flat(),
    // Centre
    setColor(1, 0.8, 0),
    ...circle(0, 0, 0.18, 48),
  ]}),
};

// 4×4 grid of circles, colour-coded by position
export const DotGrid = {
  render: () => openbrushStory({ commands: [
    setSize(0.02),
    ...Array.from({ length: 4 }, (_, row) =>
      Array.from({ length: 4 }, (_, col) => {
        const x = (col - 1.5) * 0.55;
        const y = (row - 1.5) * 0.55;
        const t = (row * 4 + col) / 16;
        return [
          setColor(0.914 - t * 0.5, 0.271 + t * 0.5, 0.376 + t * 0.3),
          ...circle(x, y, 0.18, 32),
        ];
      }).flat()
    ).flat(),
  ]}),
};

// Olympic-style interlocking rings
export const InterlockingRings = {
  render: () => openbrushStory({ commands: [
    setSize(0.03),
    ...[
      { x: -1.0, y:  0.2, r: [0.914, 0.271, 0.376] },
      { x: -0.5, y: -0.2, r: [0, 0.8, 1] },
      { x:  0.0, y:  0.2, r: [1, 0.8, 0] },
      { x:  0.5, y: -0.2, r: [0.2, 0.8, 0.2] },
      { x:  1.0, y:  0.2, r: [0.8, 0.3, 1] },
    ].flatMap(({ x, y, r }) => [
      setColor(...r),
      ...circle(x, y, 0.38, 64),
    ]),
  ]}),
};

// Snowflake: 6-fold radial symmetry of line spokes and hexagons
export const Snowflake = {
  render: () => openbrushStory({ commands: [
    setSize(0.025),
    // 6 main spokes
    ...Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      return [
        setColor(0.7, 0.9, 1),
        ...line(0, 0, Math.cos(a) * 1.3, Math.sin(a) * 1.3),
        // branch tips
        ...[0.5, 0.8, 1.1].flatMap(t => {
          const bx = Math.cos(a) * t;
          const by = Math.sin(a) * t;
          const pa = a + Math.PI / 2;
          return [
            ...line(bx, by, bx + Math.cos(pa) * 0.15, by + Math.sin(pa) * 0.15),
            ...line(bx, by, bx - Math.cos(pa) * 0.15, by - Math.sin(pa) * 0.15),
          ];
        }),
      ];
    }).flat(),
    // centre hexagon
    setColor(0.4, 0.7, 1),
    ...polygon(0, 0, 0.25, 6, 0),
  ]}),
};
