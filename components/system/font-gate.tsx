'use client';

import { useEffect } from 'react';

export function FontGate() {
  useEffect(() => {
    let active = true;
    let revealed = false;
    let complete = false;
    let frame = 0;
    let sentinel: HTMLElement | null = null;
    let onAnimationFinished: ((event: AnimationEvent) => void) | undefined;
    const root = document.documentElement;
    const completeReveal = () => {
      if (!active || complete) return;
      complete = true;
      if (sentinel && onAnimationFinished) {
        sentinel.removeEventListener('animationend', onAnimationFinished);
        sentinel.removeEventListener('animationcancel', onAnimationFinished);
      }
      root.setAttribute('data-reveal-complete', 'true');
    };
    const reveal = () => {
      if (!active || revealed) return;
      revealed = true;
      sentinel = document.querySelector<HTMLElement>('[data-reveal-sentinel]');
      if (!sentinel) {
        root.classList.add('fonts-ready');
        completeReveal();
        return;
      }
      onAnimationFinished = (event: AnimationEvent) => {
        if (event.target !== sentinel) return;
        completeReveal();
      };
      sentinel.addEventListener('animationend', onAnimationFinished);
      sentinel.addEventListener('animationcancel', onAnimationFinished);
      frame = window.requestAnimationFrame(() => {
        root.classList.add('fonts-ready');
        frame = window.requestAnimationFrame(() => {
          if (!sentinel || typeof sentinel.getAnimations !== 'function') return;
          const ceremony = sentinel.getAnimations().find((animation) => animation.playState !== 'finished');
          if (!ceremony) return completeReveal();
          void ceremony.finished.then(completeReveal, completeReveal);
        });
      });
    };
    const timeout = window.setTimeout(reveal, 2000);
    void Promise.race([document.fonts.ready, new Promise((resolve) => window.setTimeout(resolve, 2000))]).then(reveal);
    root.removeAttribute('data-reveal-complete');
    return () => {
      active = false;
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(frame);
      if (sentinel && onAnimationFinished) {
        sentinel.removeEventListener('animationend', onAnimationFinished);
        sentinel.removeEventListener('animationcancel', onAnimationFinished);
      }
    };
  }, []);
  return null;
}
