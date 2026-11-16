# Design

## Context

O HabitQuest utiliza React Native com Expo, TypeScript, Zustand para gerenciamento de estado unificado e AsyncStorage para persistencia local. O aplicativo opera atualmente com motor de gamificacao (XP, HP, niveis globais e atributos: Intelecto, Forca e Disciplina).

Para suportar o sistema de classes e batalhas em cavernas, o design amplia o dominio gamificado preservando a arquitetura em camadas limpas (`src/domain/entities`, `src/domain/services`, `src/infrastructure/storage`, `src/ui/screens` e `src/ui/components`). Consulte `proposal.md` para as motivacoes de negocio.

## Goals / Non-Goals

**Goals:**
- Modelar o catalogo de classes RPG: Aprendiz (inicial), Monge (foco em Disciplina), Cavaleiro (foco em Forca), Sabio (foco em Intelecto), Arqueiro (foco em Disciplina e Agilidade) e Exorcista (hibrido Forca e Intelecto).
- Criar conjunto de assets visuais leves e icones tematicos SVG/vetoriais para classes e monstros, garantindo renderizacao nitida e performatica sem sobrecarregar o tamanho do pacote.
- Definir algoritmo balanceado de combate probabilistico baseado em poder efetivo do jogador vs poder do monstro, gerando porcentagens claras de vitoria e resolucao dinamica.
- Implementar catalogo de cavernas e monstros com progresso escalonado por nivel recomendado.
- Vincular o cumprimento de habitos no mundo real a geracao de pontos de expedicao necessarios para entrar em masmorras.
- Disponibilizar interface dedicada de expedicoes (`app/(tabs)/dungeon.tsx`) e modal de escolha/evolucao de classes acessivel no perfil.

**Non-Goals:**
- Implementacao de motores pesados de jogos 2D/3D (jogabilidade orientada a RPG de turnos/simulacao tatica leve).
- Loja completa de itens e inventario nesta etapa (a moeda ouro sera acumulada nas vitorias e servira de base para a loja na proxima iteracao).
- Modos multijogador online ou combate PvP.

## Decisions

### 1. Definicao e Arvore de Classes RPG
- **Decisao**: Todo usuario inicia no nivel 1 como "Aprendiz". Ao atingir o nivel 5 e limiares de atributos especificos, o jogador pode escolher evoluir para uma das cinco classes:
  - **Monge**: Requisito: Disciplina >= 20. Bonus: +25% ganho de Disciplina, +10% resistencia a falhas em combate.
  - **Cavaleiro**: Requisito: Forca >= 20. Bonus: +25% ganho de Forca, +10% dano base de combate.
  - **Sabio**: Requisito: Intelecto >= 20. Bonus: +25% ganho de Intelecto, +15% de XP extra em vitorias de masmorra.
  - **Arqueiro**: Requisito: Disciplina >= 15 e Forca >= 10. Bonus: +15% Disciplina, +15% chance de acerto critico em combate.
  - **Exorcista**: Requisito: Intelecto >= 15 e Forca >= 15. Bonus: +15% Forca, +15% Intelecto, bonus de combate contra monstros sombrios/chefes.
- **Alternativa considerada**: Escolha obrigatoria e irrevogavel de classe no inicio do app. Rejeitada porque novos usuarios ainda estao descobrindo suas rotinas e nao devem ser travados em uma escolha antes de experimentar as categorias de habitos.

### 2. Algoritmo de Combate e Calculo Probabilistico
- **Decisao**: O calculo de chance de vitoria contra um monstro adotara uma formula ponderada de poder efetivo:
  $$\text{PlayerPower} = (\text{Nivel} \times 10) + (\text{Atributos Relevantes} \times 1.5) + \text{BonusDeClasse}$$
  $$\text{MonsterPower} = (\text{NivelMonstro} \times 10) + \text{DificuldadeBase}$$
  $$\text{WinChance} = \text{clamp}\left(50\% + \frac{\text{PlayerPower} - \text{MonsterPower}}{2}, 5\%, 95\%\right)$$
- **Resolucao**: A batalha exibe a chance calculada de forma transparente para o jogador antes do inicio. A resolucao gera um log narrativo rapido com turnos de acao, concedendo ouro e XP em caso de sucesso.
- **Alternativa considerada**: Combate 100% deterministico (se poder > monstro ganha, senao perde). Rejeitada porque elimina a tensao, a probabilidade estrategica e a sensacao de desafio tipica de RPGs.

### 3. Geracao de Pontos de Expedicao via Habitos Diarios
- **Decisao**: Cada conclusao de tarefa diaria premia o jogador com pontos de expedicao:
  - Habito Facil: +5 pontos
  - Habito Medio: +10 pontos
  - Habito Dificil: +20 pontos
  - O custo para entrar em cavernas varia de 10 a 30 pontos conforme a profundidade do andar.
- **Alternativa considerada**: Tempo de recarga passivo por relogio (stamina temporal). Rejeitada porque incentiva a passividade; o objetivo primordial do HabitQuest e motivar o cumprimento de acoes na vida real.

### 4. Conjunto de Assets Visuais em Vetor / SVG
- **Decisao**: Construir componentes de iconografia e ilustracoes vetoriais estilizadas no padrao de arte do HabitQuest (SVG modular) para cada classe e monstro. Isso garante renderizacao ultra-nitida em qualquer resolucao, carregamento instantaneo e zero consumo excessivo de memoria.
- **Alternativa considerada**: Imagens PNG pesadas de alta resolucao. Rejeitada para evitar aumento do APK/bundle e tempos de carregamento em dispositivos modestos.

### 5. Estrutura de Estado e Persistencia
- **Decisao**: Modularizar o estado no Zustand com `useDungeonStore` integrado aos seletores de `useGamificationStore`, gravando no AsyncStorage nas chaves `@habitquest:classes` e `@habitquest:dungeons`. Na carga inicial, perfis legados recebem automaticamente a classe "Aprendiz" e saldo inicial de pontos de expedicao.

## Risks / Trade-offs

- **[Risco] Sentimento de punicao ao perder batalhas em cavernas**:
  - *Mitigacao*: Em caso de derrota, o usuario nao perde HP vital, niveis ou atributos. Apenas os pontos de expedicao da tentativa sao consumidos, e o sistema exibe mensagens de incentivo orientando quais habitos cumprir para fortalecer os atributos necessarios.
- **[Risco] Sobrecarga cognitiva com muitas mecanicas de uma vez**:
  - *Mitigacao*: A tela de cavernas e desbloqueada de forma progressiva e o modal de evolucao de classe so destaca notificacoes quando o usuario atinge o nivel 5.
