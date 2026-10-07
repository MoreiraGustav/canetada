import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { GamePhase, SettingsData } from '@/types';
import { createAudioController } from '@/utils/audioSynth';
import type { AudioController, SoundCue } from '@/utils/audioSynth';

/** Efeito sonoro tocado ao entrar em cada fase (fases ausentes = silêncio). */
const PHASE_CUES: Partial<Record<GamePhase, SoundCue>> = {
  summary: 'page',
  event: 'alert',
  'election-result': 'fanfare',
  result: 'fanfare',
};

const UNLOCK_EVENTS = ['pointerdown', 'keydown'] as const;

const selectMix = (state: SettingsData): SettingsData => ({
  volume: state.volume,
  muted: state.muted,
  musicEnabled: state.musicEnabled,
  sfxEnabled: state.sfxEnabled,
});

/**
 * Trilha ambiente sintetizada + efeitos de troca de fase.
 * O AudioContext só é criado após o primeiro gesto do usuário (política de autoplay).
 */
export const useAudio = (phase: GamePhase): void => {
  const mix = useSettingsStore(useShallow(selectMix));
  const controllerRef = useRef<AudioController | null>(null);
  const previousPhaseRef = useRef<GamePhase>(phase);

  useEffect(() => {
    const controller = createAudioController(selectMix(useSettingsStore.getState()));
    controllerRef.current = controller;
    const handleGesture = (): void => controller.unlock();
    UNLOCK_EVENTS.forEach((type) => window.addEventListener(type, handleGesture));
    return () => {
      UNLOCK_EVENTS.forEach((type) => window.removeEventListener(type, handleGesture));
      controller.dispose();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    controllerRef.current?.applyMix(mix);
  }, [mix]);

  useEffect(() => {
    if (previousPhaseRef.current === phase) return;
    previousPhaseRef.current = phase;
    const cue = PHASE_CUES[phase];
    if (cue) controllerRef.current?.playCue(cue);
  }, [phase]);
};
