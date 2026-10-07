/**
 * Síntese de áudio via Web Audio API (sem arquivos de áudio, sem React).
 * Fornece um controlador imperativo: trilha ambiente institucional (pad lento)
 * e efeitos curtos de interface ("cues").
 */
import type { SettingsData } from '@/types';

export type SoundCue = 'page' | 'alert' | 'fanfare';

export interface AudioController {
  /** Cria/retoma o AudioContext. Deve ser chamado a partir de um gesto do usuário. */
  unlock: () => void;
  /** Aplica volume, mudo e chaves de música/efeitos (ao vivo). */
  applyMix: (mix: SettingsData) => void;
  playCue: (cue: SoundCue) => void;
  dispose: () => void;
}

interface AudioGraph {
  ctx: AudioContext;
  master: GainNode;
  music: GainNode;
  sfx: GainNode;
}

interface ToneSpec {
  frequency: number;
  /** Segundos a partir de agora. */
  start: number;
  duration: number;
  type: OscillatorType;
  peak: number;
  attack?: number;
}

// ─── Níveis de mixagem ────────────────────────────────────────────────────
const MUSIC_LEVEL = 0.12;
const SFX_LEVEL = 0.35;
/** Constante de tempo (s) para transições suaves de ganho. */
const GAIN_SMOOTHING = 0.15;

// ─── Pad ambiente ─────────────────────────────────────────────────────────
const PAD_CHORD_SECONDS = 9;
const PAD_ATTACK = 3.5;
const PAD_RELEASE = 4;
const PAD_NOTE_PEAK = 0.06;
const PAD_LOWPASS_HZ = 900;
const PAD_DETUNE_CENTS = 6;
/** Progressão lenta e sóbria (MIDI): Ré – Si menor – Sol – Lá. */
const PAD_CHORDS: readonly (readonly number[])[] = [
  [50, 57, 62, 66],
  [47, 54, 59, 62],
  [43, 50, 55, 59],
  [45, 52, 57, 61],
];

// ─── Efeitos ──────────────────────────────────────────────────────────────
const MIDI_A4 = 69;
const FREQ_A4 = 440;
const SEMITONES_PER_OCTAVE = 12;
const SILENT_GAIN = 0.0001;
const PAGE_NOISE_SECONDS = 0.25;
const PAGE_NOISE_BANDPASS_HZ = 2400;
const PAGE_NOISE_PEAK = 0.25;
const FANFARE_STEP = 0.13;
const FANFARE_NOTES: readonly number[] = [60, 64, 67, 72];

export const midiToFrequency = (midi: number): number => FREQ_A4 * 2 ** ((midi - MIDI_A4) / SEMITONES_PER_OCTAVE);

/** Oscilador com envelope ataque/decaimento exponencial. */
export const playTone = (ctx: AudioContext, destination: AudioNode, spec: ToneSpec): void => {
  const startAt = ctx.currentTime + spec.start;
  const attack = spec.attack ?? 0.01;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = spec.type;
  osc.frequency.value = spec.frequency;
  gain.gain.setValueAtTime(SILENT_GAIN, startAt);
  gain.gain.exponentialRampToValueAtTime(spec.peak, startAt + attack);
  gain.gain.exponentialRampToValueAtTime(SILENT_GAIN, startAt + spec.duration);
  osc.connect(gain).connect(destination);
  osc.start(startAt);
  osc.stop(startAt + spec.duration + 0.05);
};

/** Ruído branco filtrado: "virar de página" do jornal. */
const playPageNoise = (ctx: AudioContext, destination: AudioNode): void => {
  const length = Math.floor(ctx.sampleRate * PAGE_NOISE_SECONDS);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.value = PAGE_NOISE_BANDPASS_HZ;
  gain.gain.value = PAGE_NOISE_PEAK;
  source.connect(filter).connect(gain).connect(destination);
  source.start();
};

const CUE_PLAYERS: Record<SoundCue, (ctx: AudioContext, destination: AudioNode) => void> = {
  page: (ctx, destination) => {
    playPageNoise(ctx, destination);
    playTone(ctx, destination, { frequency: midiToFrequency(76), start: 0.18, duration: 0.9, type: 'sine', peak: 0.18 });
    playTone(ctx, destination, { frequency: midiToFrequency(83), start: 0.3, duration: 1.1, type: 'sine', peak: 0.12 });
  },
  alert: (ctx, destination) => {
    playTone(ctx, destination, { frequency: midiToFrequency(43), start: 0, duration: 0.6, type: 'triangle', peak: 0.35, attack: 0.03 });
    playTone(ctx, destination, { frequency: midiToFrequency(42), start: 0.45, duration: 0.9, type: 'triangle', peak: 0.3, attack: 0.03 });
  },
  fanfare: (ctx, destination) => {
    FANFARE_NOTES.forEach((note, index) => {
      const isLast = index === FANFARE_NOTES.length - 1;
      const spec = { start: index * FANFARE_STEP, duration: isLast ? 1.4 : 0.45, peak: 0.2, attack: 0.02 };
      playTone(ctx, destination, { ...spec, frequency: midiToFrequency(note), type: 'triangle' });
      playTone(ctx, destination, { ...spec, frequency: midiToFrequency(note + SEMITONES_PER_OCTAVE), type: 'sine', peak: 0.06 });
    });
  },
};

/** Um acorde do pad: senoides levemente desafinadas com envelope lento. */
const playPadChord = (ctx: AudioContext, destination: AudioNode, notes: readonly number[]): void => {
  const now = ctx.currentTime;
  const end = now + PAD_CHORD_SECONDS + PAD_RELEASE;
  notes.forEach((note) => {
    [-PAD_DETUNE_CENTS, PAD_DETUNE_CENTS].forEach((detune) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = midiToFrequency(note);
      osc.detune.value = detune;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(PAD_NOTE_PEAK / notes.length, now + PAD_ATTACK);
      gain.gain.setValueAtTime(PAD_NOTE_PEAK / notes.length, now + PAD_CHORD_SECONDS);
      gain.gain.linearRampToValueAtTime(0, end);
      osc.connect(gain).connect(destination);
      osc.start(now);
      osc.stop(end + 0.1);
    });
  });
};

/** Inicia o pad em loop; retorna a função que o interrompe. */
export const startAmbientPad = (ctx: AudioContext, destination: AudioNode): (() => void) => {
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = PAD_LOWPASS_HZ;
  filter.connect(destination);
  let chordIndex = 0;
  let timer: number | undefined;
  const step = (): void => {
    playPadChord(ctx, filter, PAD_CHORDS[chordIndex % PAD_CHORDS.length]);
    chordIndex += 1;
    timer = window.setTimeout(step, PAD_CHORD_SECONDS * 1000);
  };
  step();
  return () => {
    window.clearTimeout(timer);
    // As notas já agendadas terminam pelo próprio envelope; o filtro é desligado após o release.
    window.setTimeout(() => filter.disconnect(), (PAD_RELEASE + PAD_CHORD_SECONDS) * 1000);
  };
};

const createAudioContext = (): AudioContext | null => {
  const scope = window as Window & { webkitAudioContext?: typeof AudioContext };
  const Ctor = window.AudioContext ?? scope.webkitAudioContext;
  return Ctor ? new Ctor() : null;
};

const createGraph = (): AudioGraph | null => {
  const ctx = createAudioContext();
  if (!ctx) return null;
  const master = ctx.createGain();
  const music = ctx.createGain();
  const sfx = ctx.createGain();
  master.gain.value = 0;
  music.connect(master);
  sfx.connect(master);
  master.connect(ctx.destination);
  return { ctx, master, music, sfx };
};

const setGain = (graph: AudioGraph, node: GainNode, value: number): void => {
  node.gain.setTargetAtTime(value, graph.ctx.currentTime, GAIN_SMOOTHING);
};

/** Volume mestre (respeitando o mudo) e níveis de música/efeitos. */
const applyGains = (graph: AudioGraph, mix: SettingsData): void => {
  setGain(graph, graph.master, mix.muted ? 0 : mix.volume);
  setGain(graph, graph.music, mix.musicEnabled ? MUSIC_LEVEL : 0);
  setGain(graph, graph.sfx, mix.sfxEnabled ? SFX_LEVEL : 0);
};

export const createAudioController = (initialMix: SettingsData): AudioController => {
  let graph: AudioGraph | null = null;
  let mix = initialMix;
  let stopPad: (() => void) | null = null;

  const syncPad = (): void => {
    if (!graph) return;
    if (mix.musicEnabled && !stopPad) stopPad = startAmbientPad(graph.ctx, graph.music);
    if (!mix.musicEnabled && stopPad) {
      stopPad();
      stopPad = null;
    }
  };

  const applyMix = (next: SettingsData): void => {
    mix = next;
    if (!graph) return;
    applyGains(graph, mix);
    syncPad();
  };

  return {
    unlock: () => {
      if (!graph) graph = createGraph();
      if (!graph) return;
      if (graph.ctx.state === 'suspended') void graph.ctx.resume();
      applyMix(mix);
    },
    applyMix,
    playCue: (cue) => {
      // Em contexto ainda suspenso, os sons ficam agendados e tocam ao retomar.
      if (!graph || graph.ctx.state === 'closed' || mix.muted || !mix.sfxEnabled) return;
      CUE_PLAYERS[cue](graph.ctx, graph.sfx);
    },
    dispose: () => {
      stopPad?.();
      stopPad = null;
      void graph?.ctx.close();
      graph = null;
    },
  };
};
