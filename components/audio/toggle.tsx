'use client';
import { useRef, useState } from 'react'; import { Ambience } from '@/lib/audio/ambience';
export function AudioToggle() { const ambience = useRef<Ambience | undefined>(undefined); const [enabled, setEnabled] = useState(false); const toggle = async () => { ambience.current ??= new Ambience(); await ambience.current.toggle(); setEnabled(ambience.current.active); }; return <button className="audio-toggle" type="button" aria-pressed={enabled} onClick={toggle}>{enabled ? 'Mute ambience' : 'Enable ambience'}</button>; }
