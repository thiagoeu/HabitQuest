# Tasks

## 1. Modelagem de Dominio e Servicos de Classes e Expedicoes

- [x] 1.1 Criar tipos e entidades de classes RPG (`CharacterClassId`, `CharacterClass`, `ClassPerk`) e catalogo inicial (Aprendiz, Monge, Cavaleiro, Sabio, Arqueiro, Exorcista) com verificacao via testes unitarios em `ClassProgressionService.test.ts`
- [x] 1.2 Implementar `ClassProgressionService` com regras de validacao de pre-requisitos de nivel/atributos, troca de classe e aplicacao de bonus passivos, verificando com 100% de cobertura nos testes
- [x] 1.3 Criar entidades de Cavernas e Monstros (`Dungeon`, `Monster`, `BattleResult`) e catalogo inicial escalonado por dificuldade, verificando a consistencia das estruturas via testes unitarios
- [x] 1.4 Implementar `DungeonCombatService` contendo a formula de probabilidade ponderada de vitoria, geracao de log narrativo e concessao de recompensas (XP e moedas de ouro), verificando os limites probabilisticos (clamp entre 5% e 95%) via testes unitarios em `DungeonCombatService.test.ts`

## 2. Integracao ao Motor de Gamificacao e Persistencia

- [x] 2.1 Atualizar `UserProfile` e `useGamificationStore` para incluir `currentClass`, `unlockedClasses`, `expeditionPoints` e `goldBalance`, garantindo fallback seguro para perfis legados e verificando os testes da store com `npm test`
- [x] 2.2 Integrar concessao de pontos de expedicao na conclusao de habitos no `HabitService` e `GamificationService`, validando que habitos faceis (+5), medios (+10) e dificeis (+20) concedem pontos com sucesso via testes
- [x] 2.3 Criar `useDungeonStore` e camada de persistencia AsyncStorage (`@habitquest:dungeons`) para armazenar historico de batalhas e progresso de cavernas, verificando o ciclo de vida de persistencia com testes unitarios

## 3. Conjunto de Assets Visuais e Componentes de RPG

- [x] 3.1 Criar conjunto modular de componentes vetoriais para iconografia das 6 classes (Aprendiz, Monge, Cavaleiro, Sabio, Arqueiro e Exorcista) em `src/ui/components/rpg/ClassIcon.tsx`, verificando renderizacao estavel
- [x] 3.2 Criar componentes visuais e icones vetoriais para os monstros das cavernas e badges de patamar de dificuldade em `src/ui/components/rpg/MonsterIcon.tsx`, verificando renderizacao de cada tipo
- [x] 3.3 Desenvolver o componente modal interativo `ClassProgressionModal.tsx` para selecao e evolucao de classes, exibindo status de pre-requisitos, bonus passivos e acao de desbloqueio/troca, verificando o comportamento na interface

## 4. Telas de Cavernas, Batalha e Atualizacao de Perfil

- [x] 4.1 Implementar a tela dedicada de exploracao de cavernas `app/(tabs)/dungeon.tsx` exibindo saldo de pontos de expedicao, selecao de cavernas/monstros, probabilidade calculada de vitoria e acao de iniciar expedicao, verificando navegacao e layout
- [x] 4.2 Implementar modal interativo de batalha com exibicao de turnos narrativos, resultado (vitoria com XP/ouro ou derrota com encorajamento) e historico de combate, verificando o fluxo completo de interacao
- [x] 4.3 Atualizar o cabecalho de perfil em `src/ui/screens/ProfileScreen.tsx` e `DashboardHeader.tsx` para exibir a classe ativa com asset tematico, barra de pontos de expedicao, saldo de ouro e atalho para evolucao de classes, verificando atualizacoes reativas

## 5. Verificacao de Integracao e Suite de Testes

- [x] 5.1 Executar a suite completa de testes com `npm test` garantindo que todos os testes existentes e novos passem sem regressoes
- [x] 5.2 Executar verificacao estatica de tipos com `npx tsc --noEmit` garantindo conformidade estrita de tipagem TypeScript
