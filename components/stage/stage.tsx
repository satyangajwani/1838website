'use client';

import { type PointerEvent, type ReactNode, useEffect, useRef } from 'react';
import { Layers } from './layers';

export function Stage({ children }: { children: ReactNode }) {
  const stage = useRef<HTMLElement>(null);
  const reduced = useRef(false);
  useEffect(() => { reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches; }, []);
  const move = (event: PointerEvent<HTMLElement>) => {
    if (reduced.current || !stage.current) return;
    const rect = stage.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    stage.current.querySelectorAll<HTMLElement>('[data-depth]').forEach((layer) => {
      const depth = Number(layer.dataset.depth);
      layer.style.transform = `translate3d(${(x * depth * 34).toFixed(2)}px, ${(y * depth * 24).toFixed(2)}px, 0)`;
    });
    stage.current.style.setProperty('--light-x', `${50 + x * 30}%`);
    stage.current.style.setProperty('--light-y', `${45 + y * 30}%`);
  };
  const requestTilt = async () => {
    const device = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };
    if (device.requestPermission && await device.requestPermission() !== 'granted') return;
    window.addEventListener('deviceorientation', (event) => {
      if (reduced.current || !stage.current) return;
      stage.current.style.setProperty('--light-x', `${50 + Math.max(-20, Math.min(20, event.gamma ?? 0))}%`);
    }, { once: true });
  };
  return <main ref={stage} data-stage className="stage" onPointerMove={move} onPointerDown={requestTilt}>
    <Layers />
    <div className="stage-copy hero-copy">{children}</div>
  </main>;
}
