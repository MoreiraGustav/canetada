import { Button } from '@/components/ui/Button';

interface CareerSetupFooterProps {
  /** Resumo da ficha (null enquanto falta o nome). */
  summary: string | null;
  onBack: () => void;
}

/** Barra fixa do formulário de criação: voltar e começar a carreira (botão de envio). */
export const CareerSetupFooter = ({ summary, onBack }: CareerSetupFooterProps) => (
  <div className="sticky bottom-0 flex flex-col gap-3 border-t border-ink bg-paper/95 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
    <Button variant="ghost" onClick={onBack}>
      ← Voltar
    </Button>
    <p className="font-serif text-sm text-ink-soft sm:text-center">
      {summary ? (
        <>
          Ficha: <strong className="text-ink">{summary}</strong>
        </>
      ) : (
        'Informe o nome para continuar.'
      )}
    </p>
    <Button type="submit" size="lg" disabled={!summary}>
      Começar a carreira
    </Button>
  </div>
);
