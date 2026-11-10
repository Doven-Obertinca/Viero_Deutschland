import type { Point, Quad } from "./model";

// Inverse homography from a photographed quadrilateral into wall space.
export function inversePlane(plane: Quad) {
  const turns = plane.map(([x, y], index) => {
    const [nextX, nextY] = plane[(index + 1) % 4];
    const [endX, endY] = plane[(index + 2) % 4];
    return (nextX - x) * (endY - nextY) - (nextY - y) * (endX - nextX);
  });
  if (
    !turns.every((turn) => turn > 1e-9) &&
    !turns.every((turn) => turn < -1e-9)
  )
    return null;
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = plane;
  const dx = x1 - x2,
    dy = y1 - y2,
    ex = x3 - x2,
    ey = y3 - y2;
  const det = dx * ey - dy * ex;
  if (Math.abs(det) < 1e-9) return null;
  const sx = x0 - x1 + x2 - x3,
    sy = y0 - y1 + y2 - y3;
  const g = (sx * ey - sy * ex) / det,
    h = (dx * sy - dy * sx) / det;
  const a = x1 - x0 + g * x1,
    b = x3 - x0 + h * x3;
  const d = y1 - y0 + g * y1,
    e = y3 - y0 + h * y3;
  return [
    e - y0 * h,
    x0 * h - b,
    b * y0 - x0 * e,
    y0 * g - d,
    a - x0 * g,
    x0 * d - a * y0,
    d * h - e * g,
    b * g - a * h,
    a * e - b * d,
  ];
}

export function project(m: number[], [x, y]: Point): Point {
  const w = m[6] * x + m[7] * y + m[8];
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w];
}
