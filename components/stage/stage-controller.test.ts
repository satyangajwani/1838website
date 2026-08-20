import { describe, expect, it } from 'vitest';
import { autonomousLight, blendSteering, steeringWeight } from './stage-controller';

describe('stage controller', () => {
  it('blends two slow sine paths into a bounded shared light position', () => {
    for (const elapsed of [0, 3_500, 7_000, 11_500, 14_000, 23_000, 46_000]) {
      const light = autonomousLight(elapsed);
      expect(light.x).toBeGreaterThanOrEqual(38);
      expect(light.x).toBeLessThanOrEqual(62);
      expect(light.y).toBeGreaterThanOrEqual(34);
      expect(light.y).toBeLessThanOrEqual(54);
    }
  });

  it('decays steering back to the autonomous path over exactly two seconds', () => {
    expect(steeringWeight(0)).toBe(1);
    expect(steeringWeight(1_000)).toBe(.5);
    expect(steeringWeight(2_000)).toBe(0);
    expect(steeringWeight(2_500)).toBe(0);

    const autonomous = { x: 46, y: 42 };
    const steered = { x: 74, y: 27 };
    expect(blendSteering(autonomous, steered, 0)).toEqual(steered);
    expect(blendSteering(autonomous, steered, 1_000)).toEqual({ x: 60, y: 34.5 });
    expect(blendSteering(autonomous, steered, 2_000)).toEqual(autonomous);
  });
});
