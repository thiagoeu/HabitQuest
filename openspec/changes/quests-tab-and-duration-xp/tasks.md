# Tasks

## 1. Tipos e Servico de Dominio de Quests

- [x] 1.1 Estender `src/types/index.ts` com `QuestDurationTier`, `QuestRewardKind`, `QuestLifecycleStatus` e `QuestRewardRecord`, verificando a checagem de tipos com `npx tsc --noEmit`.
- [x] 1.2 Criar `src/domain/questProgressService.ts` com as tabelas de faixas de duracao e marcos continuos, calculo inclusivo de dias corridos, contagem de dias programados com parsing local de datas, calculo de XP fixo e Quest Perfeita (+20%), classificacao de ciclo de vida, linha do tempo de evolucao e avaliacao de recompensas elegiveis (`evaluateEligibleQuestRewards`), verificando a compilacao com `npx tsc --noEmit`.
- [x] 1.3 Criar testes unitarios em `src/domain/__tests__/questProgressService.test.ts` cobrindo todas as faixas de duracao (`pontual`, `semanal`, `quinzenal`, `mensal`, `trimestral`), multiplicadores de dificuldade (1.0x / 1.5x / 2.0x), regra de 80% vs 100% (<= 3 dias), bonus Quest Perfeita +20%, marcos continuos (7, 30, 90, 180 e 365), intervalo com zero dias programados e consistencia de fuso horario, executando `npx jest src/domain/__tests__/questProgressService.test.ts`.

## 2. Integracao com Engine de Gamificacao e Store

- [x] 2.1 Adicionar as funcoes puras `applyQuestReward` e `revertQuestReward` em `src/domain/gamificationEngine.ts` (aplicando XP global, afinidade de classe no atributo da quest e retorno de `leveledUp`) e adicionar testes correspondentes em `src/domain/__tests__/gamificationEngine.test.ts`, verificando com `npx jest src/domain/__tests__/gamificationEngine.test.ts`.
- [x] 2.2 Atualizar `src/store/useAppStore.ts` para persistir `questRewards: QuestRewardRecord[]` (com fallback retrocompativel em `ensureProfileDefaults` e limpeza em `resetStore`), avaliar e conceder recompensas elegiveis em `completeHabit` (retornando `unlockedQuestRewards`) e `evaluateDayChange`, e estornar recompensas disparadas no mesmo dia em `uncompleteHabit` quando o criterio deixar de ser atendido; cobrir os cenarios de concessao, idempotencia, virada de dia e estorno em `src/store/__tests__/useAppStore.test.ts`, executando `npx jest src/store/__tests__/useAppStore.test.ts`.

## 3. Navegacao, Aba Quests e Pagina de Evolucao

- [x] 3.1 Atualizar `src/components/TabBadgeIcon.tsx`, `src/app/(tabs)/_layout.tsx` e `src/app/_layout.tsx` para adicionar a aba `Quests` com badge heraldico proprio no menu inferior e registrar a rota `quest-detail` no `Stack`, verificando a compilacao com `npx tsc --noEmit`.
- [x] 3.2 Criar `src/app/(tabs)/quests.tsx` listando todas as tarefas cadastradas com resumo superior (total, ativas, concluidas e XP de bonus acumulado), botao `+ Nova Quest` para `/habit-form`, filtros (`Todas`, `Ativas`, `Continuas`, `Futuras`, `Concluidas`), cartoes com barra de evolucao, faixa de duracao, dias restantes, XP previsto/conquistado e navegacao para `/quest-detail?id=<habitId>`, verificando com `npx tsc --noEmit`.
- [x] 3.3 Criar `src/app/quest-detail.tsx` com painel completo de evolucao da quest selecionada: cabecalho com atalho para editar, metricas de aderencia, dias cumpridos/programados/perdidos/restantes, ofensiva atual e recorde, XP diario e bonus de duracao, status do bonus fixo ou trilha de marcos continuos, grade visual dos dias e historico de check-ins da quest, verificando com `npx tsc --noEmit`.

## 4. Formulario, Feedback na Aba Hoje e Verificacao Integrada

- [x] 4.1 Atualizar `src/app/habit-form.tsx` corrigindo `handleApplyQuickRange` para calculo inclusivo (`daysCount - 1`), adicionando o atalho de `90 dias` e exibindo o painel dinamico de pre-visualizacao da estrategia de XP por duracao ou marcos continuos, verificando com `npx tsc --noEmit`.
- [x] 4.2 Atualizar `src/app/(tabs)/index.tsx` para destacar no banner de feedback quando `completeHabit` conceder um bonus fixo de quest ou marco continuo, verificando com `npx tsc --noEmit`.
- [x] 4.3 Executar a checagem completa de tipos e a suite integrada de testes do projeto (`npx tsc --noEmit` e `npm test`), confirmando que todos os testes passam sem erros.
