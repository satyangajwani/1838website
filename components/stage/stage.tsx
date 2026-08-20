'use client';

import { type PointerEvent, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { AudioToggle } from '@/components/audio/toggle';
import { autonomousLight, blendSteering, type LightPosition, STEERING_DECAY_MS } from './stage-controller';
import { Layers } from './layers';

export function Stage({ children }: { children: ReactNode }) {
  const stage = useRef<HTMLElement>(null);
  const controlsTrigger = useRef<HTMLButtonElement>(null);
  const frame = useRef(0);
  const steering = useRef<{ light: LightPosition; at: number } | null>(null);
  const [motion, setMotion] = useState<'unknown' | 'full' | 'reduce'>('unknown');
  const [paused, setPaused] = useState(false);
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const running = motion === 'full' && !paused;

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

  useEffect(() => {
    if (!controlsOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setControlsOpen(false);
      controlsTrigger.current?.focus();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [controlsOpen]);

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

  useEffect(() => {
    if (!tiltEnabled || !running) return;
    const orient = (event: DeviceOrientationEvent) => {
      const gamma = Math.max(-20, Math.min(20, event.gamma ?? 0));
      const beta = Math.max(-20, Math.min(20, (event.beta ?? 45) - 45));
      steer({ x: 50 + gamma * 1.2, y: 44 + beta * .95 });
    };
    window.addEventListener('deviceorientation', orient);
    return () => window.removeEventListener('deviceorientation', orient);
  }, [tiltEnabled, running, steer]);

  const requestTilt = async (event: PointerEvent<HTMLElement>) => {
    if (!running || tiltEnabled || (event.target as Element).closest('button, a, input, select, textarea')) return;
    const device = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };
    if (device.requestPermission && await device.requestPermission() !== 'granted') return;
    setTiltEnabled(true);
  };

  const controlLabel = motion === 'reduce'
    ? 'Visual ambience paused for reduced motion'
    : paused ? 'Resume visual ambience' : 'Pause visual ambience';

  return <main
    ref={stage}
    data-stage
    data-ambience={running ? 'running' : 'paused'}
    data-reduced-motion={motion === 'reduce' ? 'true' : undefined}
    className="stage"
    onPointerMove={move}
    onPointerDown={requestTilt}
  >
    <div className="stage-controls">
      <button
        ref={controlsTrigger}
        className="stage-controls-trigger"
        type="button"
        aria-label="Stage controls"
        aria-controls="stage-controls-popover"
        aria-expanded={controlsOpen}
        onClick={() => setControlsOpen((open) => !open)}
      >Controls</button>
      {controlsOpen && <div id="stage-controls-popover" className="stage-controls-popover" role="group" aria-label="Stage ambience controls">
        <AudioToggle />
        <button
          className="visual-toggle"
          type="button"
          aria-label={controlLabel}
          aria-pressed={!running}
          disabled={motion !== 'full'}
          onClick={() => setPaused((value) => !value)}
        >{motion === 'reduce' ? 'Visuals paused' : paused ? 'Visuals resume' : 'Visuals pause'}</button>
      </div>}
    </div>
    <Layers />
    <div className="stage-copy hero-copy">{children}</div>
  </main>;
}
