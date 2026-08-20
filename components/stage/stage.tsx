'use client';

import { type PointerEvent, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { autonomousLight, blendSteering, type LightPosition, STEERING_DECAY_MS } from './stage-controller';
import { Layers } from './layers';

export function Stage({ children }: { children: ReactNode }) {
  const stage = useRef<HTMLElement>(null);
  const frame = useRef(0);
  const steering = useRef<{ light: LightPosition; at: number } | null>(null);
  const [motion, setMotion] = useState<'unknown' | 'full' | 'reduce'>('unknown');
  const running = motion === 'full';

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setMotion(preference.matches ? 'reduce' : 'full');
    update();
    preference.addEventListener?.('change', update);
    return () => preference.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (!running || !stage.current) return;
    const tick = (time: number) => {
      if (!stage.current) return;
      const autonomous = autonomousLight(time);
      const input = steering.current;
      const elapsed = input ? time - input.at : STEERING_DECAY_MS;
      const light = input ? blendSteering(autonomous, input.light, elapsed) : autonomous;
      stage.current.style.setProperty('--light-x', `${light.x.toFixed(2)}%`);
      stage.current.style.setProperty('--light-y', `${light.y.toFixed(2)}%`);
      if (input && elapsed >= STEERING_DECAY_MS) {
        steering.current = null;
        stage.current.removeAttribute('data-steering');
      }
      frame.current = window.requestAnimationFrame(tick);
    };
    frame.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame.current);
  }, [running]);

  const steer = useCallback((light: LightPosition) => {
    if (!running || !stage.current) return;
    steering.current = { light, at: performance.now() };
    stage.current.setAttribute('data-steering', 'active');
  }, [running]);

  useEffect(() => {
    if (motion !== 'reduce' || !stage.current) return;
    steering.current = null;
    stage.current.removeAttribute('data-steering');
    stage.current.style.setProperty('--light-x', '50%');
    stage.current.style.setProperty('--light-y', '44%');
    stage.current.querySelectorAll<HTMLElement>('[data-depth]').forEach((layer) => layer.style.removeProperty('transform'));
  }, [motion]);

  const move = (event: PointerEvent<HTMLElement>) => {
    if (!running || !stage.current) return;
    const rect = stage.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    stage.current.querySelectorAll<HTMLElement>('[data-depth]').forEach((layer) => {
      const depth = Number(layer.dataset.depth);
      layer.style.transform = `translate3d(${(x * depth * 34).toFixed(2)}px, ${(y * depth * 24).toFixed(2)}px, 0)`;
    });
    steer({ x: 50 + x * 50, y: 44 + y * 38 });
  };

  return <main
    ref={stage}
    data-stage
    data-ambience={running ? 'running' : 'paused'}
    data-reduced-motion={motion === 'reduce' ? 'true' : undefined}
    className="stage"
    onPointerMove={move}
  >
    <Layers />
    <div className="stage-copy hero-copy">{children}</div>
  </main>;
}
