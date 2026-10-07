import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { AudioToggleRow } from '@/components/game/AudioToggleRow';
import { Slider } from '@/components/ui/Slider';

const PERCENT = 100;

/** Botão fixo (canto superior direito) com o painel compacto de áudio. */
export const AudioControls = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const settings = useSettingsStore(
    useShallow((state) => ({
      volume: state.volume,
      muted: state.muted,
      musicEnabled: state.musicEnabled,
      sfxEnabled: state.sfxEnabled,
      setVolume: state.setVolume,
      toggleMute: state.toggleMute,
      toggleMusic: state.toggleMusic,
      toggleSfx: state.toggleSfx,
    })),
  );

  useEffect(() => {
    if (!open) return undefined;
    const handlePointer = (event: PointerEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('pointerdown', handlePointer);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('pointerdown', handlePointer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const silent = settings.muted || settings.volume === 0;

  return (
    <div ref={containerRef} className="fixed right-2 top-0 z-40 sm:right-3 sm:top-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Configurações de áudio"
        className="flex h-6 w-9 items-center justify-center border border-t-0 border-ink bg-paper text-xs shadow-paper transition-colors hover:bg-paper-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-navy sm:h-8 sm:w-8 sm:border-t sm:text-sm"
      >
        <span aria-hidden="true">{silent ? '🔇' : '🔊'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Áudio"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 w-64 max-w-[calc(100vw-1rem)] border border-ink border-t-4 bg-paper p-4 shadow-lifted"
          >
            <p className="mb-3 border-b border-ink pb-1 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Áudio</p>
            <div className="space-y-3">
              <AudioToggleRow label="Som ligado" checked={!settings.muted} onToggle={settings.toggleMute} />
              <Slider
                id="audio-volume"
                label={`Volume — ${Math.round(settings.volume * PERCENT)}%`}
                value={Math.round(settings.volume * PERCENT)}
                min={0}
                max={PERCENT}
                onChange={(value) => settings.setVolume(value / PERCENT)}
              />
              <AudioToggleRow label="Música ambiente" checked={settings.musicEnabled} onToggle={settings.toggleMusic} />
              <AudioToggleRow label="Efeitos sonoros" checked={settings.sfxEnabled} onToggle={settings.toggleSfx} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
