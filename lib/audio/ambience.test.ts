import { expect, it } from 'vitest';
import { audioSource } from './ambience';
it('uses AAC when Opus-in-WebM is unavailable', () => expect(audioSource(false)).toBe('/audio/ambience.m4a'));
