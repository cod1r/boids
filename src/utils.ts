export const OFFSET_ANGLE = (165 * Math.PI) / 180;
export const DIFF_BETWEEN_TAILS_ANGLE = Math.PI / 6;

export const RATIO = 0.05;
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
