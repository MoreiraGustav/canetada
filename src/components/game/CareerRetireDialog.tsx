import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface CareerRetireDialogProps {
  open: boolean;
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Confirmação antes de encerrar a carreira por vontade própria. */
export const CareerRetireDialog = ({ open, name, onCancel, onConfirm }: CareerRetireDialogProps) => (
  <Modal
    open={open}
    title="Encerrar a carreira?"
    onClose={onCancel}
    footer={
      <>
        <Button variant="ghost" onClick={onCancel}>
          Continuar na política
        </Button>
        <Button variant="accent" onClick={onConfirm}>
          Aposentar-se
        </Button>
      </>
    }
  >
    <p className="font-serif leading-relaxed text-ink-soft">
      <strong className="text-ink">{name}</strong> deixa a vida pública agora. A trajetória vira legado e não dá para voltar atrás.
    </p>
  </Modal>
);
