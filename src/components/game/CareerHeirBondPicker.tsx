import type { HeirBond } from '@/types';

interface CareerHeirBondPickerProps {
  value: HeirBond;
  parentName: string;
  onChange: (bond: HeirBond) => void;
}

const BONDS: ReadonlyArray<{ id: HeirBond; icon: string; title: string; description: string }> = [
  { id: 'filho', icon: '👪', title: 'Filho(a)', description: 'Herda o sobrenome: popularidade e base, e também a fama, boa ou ruim.' },
  { id: 'afilhado', icon: '🎩', title: 'Afilhado(a) político(a)', description: 'Herda a rede no partido: mais influência, menos sobrenome.' },
];

/** Laço com quem passa o bastão: filho(a) ou afilhado(a). */
export const CareerHeirBondPicker = ({ value, parentName, onChange }: CareerHeirBondPickerProps) => (
  <div role="radiogroup" aria-label={`Laço com ${parentName}`} className="grid gap-3 sm:grid-cols-2">
    {BONDS.map((bond) => (
      <button
        key={bond.id}
        type="button"
        role="radio"
        aria-checked={value === bond.id}
        onClick={() => onChange(bond.id)}
        className={`flex flex-col gap-1 border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
          value === bond.id ? 'border-ink bg-paper-dark ring-1 ring-ink' : 'border-rule bg-paper hover:border-ink'
        }`}
      >
        <span className="font-serif text-base font-semibold text-ink">
          <span aria-hidden="true">{bond.icon}</span> {bond.title} de {parentName}
        </span>
        <span className="font-serif text-sm leading-snug text-ink-soft">{bond.description}</span>
      </button>
    ))}
  </div>
);
