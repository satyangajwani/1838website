'use client';

import { useEffect } from 'react';

export function FontGate() {
  useEffect(() => {
    let active = true;
    let revealed = false;
    let complete = false;
    let frame = 0;
    let heroCopy: HTMLElement | null = null;
    let onTransitionFinished: ((event: TransitionEvent) => void) | undefined;
    const root = document.documentElement;
    const completeReveal = () => {
      if (!active || complete) return;
      complete = true;
      if (heroCopy && onTransitionFinished) {
        heroCopy.removeEventListener('transitionend', onTransitionFinished);
        heroCopy.removeEventListener('transitioncancel', onTransitionFinished);
      }
      root.setAttribute('data-reveal-complete', 'true');
    };
    const reveal = () => {
      if (!active || revealed) return;
      revealed = true;
      heroCopy = document.querySelector<HTMLElement>('.hero-copy');
      if (!heroCopy) {
        root.classList.add('fonts-ready');
        completeReveal();
        return;
      }
      onTransitionFinished = (event: TransitionEvent) => {
        if (event.target !== heroCopy || event.propertyName !== 'opacity') return;
        completeReveal();
      };
      heroCopy.addEventListener('transitionend', onTransitionFinished);
      heroCopy.addEventListener('transitioncancel', onTransitionFinished);
      frame = window.requestAnimationFrame(() => {
        root.classList.add('fonts-ready');
        frame = window.requestAnimationFrame(() => {
          if (!heroCopy || typeof heroCopy.getAnimations !== 'function') return;
          const opacityTransition = heroCopy.getAnimations().find((animation) => (animation as CSSTransition).transitionProperty === 'opacity');
          if (!opacityTransition) return completeReveal();
          void opacityTransition.finished.then(completeReveal, completeReveal);
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
      if (heroCopy && onTransitionFinished) {
        heroCopy.removeEventListener('transitionend', onTransitionFinished);
        heroCopy.removeEventListener('transitioncancel', onTransitionFinished);
      }
    };
  }, []);
  return null;
}
