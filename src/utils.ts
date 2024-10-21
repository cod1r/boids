import type { Boid } from "./Boid";
export const OFFSET_ANGLE = (165 * Math.PI) / 180;
export const DIFF_BETWEEN_TAILS_ANGLE = Math.PI / 6;

export const RATIO = 0.05;
export const BOID_NEARBY_DIST = 0.1
export const MAX_GROUP_SIZE = 10
export const FACING_ANGLE_CHANGE_RATE = 2 * Math.PI
export function calculateTailPointsGivenHeadPoint({
  x,
  y,
  angle,
}: {
  x: number;
  y: number;
  angle: number;
}) {
  const x2 = RATIO * Math.cos(angle + OFFSET_ANGLE) + x;
  const y2 = RATIO * Math.sin(angle + OFFSET_ANGLE) + y;

  const x3 =
    RATIO * Math.cos(angle + OFFSET_ANGLE + DIFF_BETWEEN_TAILS_ANGLE) + x;
  const y3 =
    RATIO * Math.sin(angle + OFFSET_ANGLE + DIFF_BETWEEN_TAILS_ANGLE) + y;
  return { x2, y2, x3, y3 };
}

export function calculateAveragePosition(boids: Boid[]) {
  const avgX = boids.reduce((a, b) => a + b.getVertices()[0], 0) / boids.length
  const avgY = boids.reduce((a, b) => a + b.getVertices()[1], 0) / boids.length
  return [avgX, avgY] as const
}
