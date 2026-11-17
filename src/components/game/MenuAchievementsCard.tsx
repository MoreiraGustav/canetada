import { useState } from 'react';
import { useAchievementGallery } from '@/stores/selectors';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AchievementGrid } from './AchievementGrid';

const PERCENT = 100;

/** Galeria de conquistas no menu: progresso e a lista completa num modal. */
export const MenuAchievementsCard = () => {
  const gallery = useAchievementGallery();
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">🏆 Conquistas</p>
      <p className="mt-2 font-serif text-sm text-ink-soft">
        {gallery.unlocked} de {gallery.total} conquistadas no modo carreira.
      </p>
      <ProgressBar value={(gallery.unlocked / Math.max(1, gallery.total)) * PERCENT} tone="neutral" height="xs" label="Conquistas" className="mt-2" />
      <Button variant="ghost" size="sm" fullWidth className="mt-3" onClick={() => setOpen(true)}>
        Ver a galeria
      </Button>
      <Modal open={open} title={`Conquistas · ${gallery.unlocked}/${gallery.total}`} onClose={() => setOpen(false)}>
        <AchievementGrid items={gallery.items} compact className="max-h-[60vh] overflow-y-auto pr-1" />
      </Modal>
    </Card>
  );
};
