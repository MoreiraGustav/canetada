const HIGHLIGHTS: ReadonlyArray<{ title: string; text: string }> = [
  {
    title: 'Governar mês a mês',
    text: 'Decida os rumos da Fazenda, da Saúde, da Educação e de outros seis ministérios a cada turno.',
  },
  {
    title: 'Negociar com o Congresso',
    text: 'Sem base aliada não há reforma. Cargos e emendas compram votos, mas cobram seu preço.',
  },
  {
    title: 'Enfrentar o imprevisto',
    text: 'Crises econômicas, desastres naturais e escândalos testam a firmeza do governo.',
  },
];

/** Matéria principal da primeira página: apresentação do jogo. */
export const MenuLeadStory = () => (
  <article>
    <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Eleições presidenciais</p>
    <h2 className="mt-2 font-display text-3xl font-black leading-[1.05] sm:text-5xl">
      O país escolhe um novo presidente. Desta vez, a caneta está com você.
    </h2>
    <p className="mt-4 font-serif text-lg leading-relaxed text-ink-soft first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:font-black first-letter:leading-[0.8] first-letter:text-ink">
      Escolha um candidato, vença a campanha e assuma o Palácio do Planalto. Inflação, desemprego, dívida pública e câmbio
      reagem a cada decisão — e a opinião pública não perdoa promessas esquecidas. Ao fim do mandato, a história julgará o
      seu legado.
    </p>
    <div className="mt-6 grid gap-4 border-t border-ink pt-4 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-rule">
      {HIGHLIGHTS.map((item) => (
        <section key={item.title} className="sm:px-4 sm:first:pl-0 sm:last:pr-0">
          <h3 className="font-display text-lg font-bold leading-snug">{item.title}</h3>
          <p className="mt-1 font-serif text-sm leading-relaxed text-ink-soft">{item.text}</p>
        </section>
      ))}
    </div>
  </article>
);
