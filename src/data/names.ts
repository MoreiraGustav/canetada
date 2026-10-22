import type { NamePool } from '@/types';

/**
 * Nomes comuns no Brasil para ministros e governadores fictícios. A combinação
 * (nome + dois sobrenomes) é sorteada pela semente do elenco; não representa
 * nenhuma pessoa real.
 */
export const NAME_POOL: NamePool = {
  femaleFirst: [
    'Ana Paula', 'Beatriz', 'Camila', 'Cláudia', 'Daniela', 'Denise', 'Eliane', 'Fernanda', 'Gabriela', 'Helena',
    'Isabela', 'Joana', 'Juliana', 'Larissa', 'Luciana', 'Márcia', 'Mariana', 'Marta', 'Patrícia', 'Raquel',
    'Regina', 'Renata', 'Sandra', 'Simone', 'Sônia', 'Tânia', 'Teresa', 'Vânia', 'Vera', 'Yara',
  ],
  maleFirst: [
    'Antônio', 'Augusto', 'Bruno', 'Carlos Alberto', 'César', 'Daniel', 'Eduardo', 'Fábio', 'Felipe', 'Fernando',
    'Gilberto', 'Gustavo', 'Henrique', 'Jorge', 'José Carlos', 'Leandro', 'Luiz Fernando', 'Marcelo', 'Márcio', 'Mário',
    'Otávio', 'Paulo Roberto', 'Rafael', 'Ricardo', 'Roberto', 'Rodrigo', 'Sérgio', 'Tiago', 'Vinícius', 'Wagner',
  ],
  surnames: [
    'Albuquerque', 'Almeida', 'Amaral', 'Andrade', 'Araújo', 'Assunção', 'Barbosa', 'Barreto', 'Bastos', 'Brandão',
    'Cardoso', 'Carvalho', 'Castro', 'Cavalcanti', 'Correia', 'Coutinho', 'Diniz', 'Duarte', 'Falcão', 'Farias',
    'Figueiredo', 'Fonseca', 'Freitas', 'Gouveia', 'Guimarães', 'Lacerda', 'Leal', 'Lima', 'Lopes', 'Macedo',
    'Magalhães', 'Medeiros', 'Monteiro', 'Moreira', 'Nogueira', 'Novaes', 'Pacheco', 'Peixoto', 'Pimentel', 'Queiroz',
    'Rangel', 'Rezende', 'Ribeiro', 'Sampaio', 'Siqueira', 'Soares', 'Tavares', 'Teixeira', 'Valadares', 'Xavier',
  ],
};
