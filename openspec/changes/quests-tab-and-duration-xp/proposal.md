# Proposal

## Why

Atualmente, a tela inicial (`Hoje`) exibe apenas as metas filtradas para o dia atual, o que impede o usuário de visualizar todas as tarefas cadastradas em um só lugar ou acompanhar a evolução individual de cada meta ao longo do tempo. Além disso, o sistema de gamificação recompensa apenas o check-in diário e a ofensiva, sem diferenciar o comprometimento exigido por tarefas de durações distintas (como 1 semana, 2 semanas, 1 mês ou metas contínuas de longo prazo).

## What Changes

- Adição da aba `Quests` no menu inferior principal para listar todas as tarefas cadastradas (independentemente do dia da semana ou vigência atual), com filtros por ciclo de vida, barra de evolução visual e resumo geral.
- Criação da página dedicada de acompanhamento de evolução individual da quest (`/quest-detail`), exibindo taxa de aderência, dias cumpridos/perdidos/restantes, grade visual dos dias, histórico de check-ins daquela tarefa e progresso até o bônus ou próximo marco.
- Implementação de estratégia complementar de XP baseada na duração da tarefa: mantém o XP diário por check-in e concede bônus fixos por faixa de tempo (`pontual`, `semanal`, `quinzenal`, `mensal`, `trimestral`) ajustados pela dificuldade (1.0x / 1.5x / 2.0x), condicionados a um critério mínimo de consistência (80% para 4+ dias programados, 100% para até 3 dias) e com +20% para Quest Perfeita (100% em 4+ dias).
- Implementação de marcos cíclicos de XP para quests contínuas (sem data final) ao atingir 7, 30, 90, 180 e 365 check-ins acumulados, mantendo persistência idempotente e estorno seguro ao desfazer check-in no mesmo dia.
- Atualização do formulário de criação/edição de metas para corrigir os atalhos de período inclusivo (7, 14, 30 e 90 dias) e exibir em tempo real uma pré-visualização da recompensa de XP diário, bônus fixo ou marcos contínuos.
- Atualização do feedback visual na aba `Hoje` para notificar imediatamente quando um check-in liberar um bônus de conclusão de quest ou marco contínuo.

## Capabilities

### New Capabilities
- `quest-tracking`: Listagem completa de todas as quests no menu principal (aba Quests), filtros por estado de ciclo de vida e página dedicada de acompanhamento detalhado da evolução de cada tarefa.

### Modified Capabilities
- `gamification-engine`: Adição da estratégia de bônus fixo de XP por duração para quests com prazo delimitado, marcos cíclicos para quests contínuas, idempotência de recompensas e estorno ao desfazer no mesmo dia.
- `habit-management`: Correção dos atalhos de período de vigência para cálculo inclusivo de dias e inclusão de pré-visualização dinâmica de recompensas por duração no formulário de metas.

## Impact

- **Modelos de Dados**: Extensão de `src/types/index.ts` com `QuestDurationTier`, `QuestRewardKind`, `QuestLifecycleStatus` e `QuestRewardRecord`.
- **Domínio e Gamificação**: Novo serviço puro `src/domain/questProgressService.ts` e novas funções puras `applyQuestReward` / `revertQuestReward` em `src/domain/gamificationEngine.ts`.
- **Estado e Persistência**: Atualização de `src/store/useAppStore.ts` para armazenar `questRewards`, processar concessões em `completeHabit` e `evaluateDayChange` e tratar estornos em `uncompleteHabit` mantendo retrocompatibilidade com o `AsyncStorage`.
- **Navegação e Interface**: Atualização de `src/app/(tabs)/_layout.tsx`, `src/app/_layout.tsx`, `src/components/TabBadgeIcon.tsx`, `src/app/habit-form.tsx` e `src/app/(tabs)/index.tsx`; criação de `src/app/(tabs)/quests.tsx` e `src/app/quest-detail.tsx`.
- **Testes**: Ampliação dos testes unitários e de integração em `src/domain/__tests__/` e `src/store/__tests__/`.
