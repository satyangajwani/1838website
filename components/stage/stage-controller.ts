export type LightPosition = { x: number; y: number };

const TAU = Math.PI * 2;
export const STEERING_DECAY_MS = 2_000;

export function autonomousLight(elapsedMs: number): LightPosition {
  const long = elapsedMs / 23_000 * TAU;
  const short = elapsedMs / 14_000 * TAU;
  return {
    x: 50 + Math.sin(short) * 12 + Math.sin(long + Math.PI / 3) * 6,
    y: 44 + Math.sin(long) * 9 + Math.sin(short + Math.PI / 2) * 4,
  };
}

export function steeringWeight(elapsedSinceInput: number) {
  const progress = Math.max(0, Math.min(1, elapsedSinceInput / STEERING_DECAY_MS));
  return 1 - progress * progress * (3 - 2 * progress);
}

export function blendSteering(autonomous: LightPosition, steered: LightPosition, elapsedSinceInput: number): LightPosition {
  const weight = steeringWeight(elapsedSinceInput);
  return {
    x: autonomous.x + (steered.x - autonomous.x) * weight,
    y: autonomous.y + (steered.y - autonomous.y) * weight,
  };
}
