# Design

## Context

Consulte `proposal.md - Why` para a motivacao. Hoje o HabitQuest armazena metas na entidade `Habit` (`src/types/index.ts`) com `startDate`, `endDate`, `daysOfWeek`, `difficulty` e `category`, e registra conclusoes diarias em `CheckInRecord[]` dentro da store `useAppStore` (`src/store/useAppStore.ts`). A aba inicial (`src/app/(tabs)/index.tsx`) exibe somente os habitos filtrados por `getHabitsForDate(today)`, o menu inferior (`src/app/(tabs)/_layout.tsx`) possui 4 abas (`Hoje`, `Cavernas`, `Status`, `Medalhas`) e o motor de gamificacao (`src/domain/gamificationEngine.ts`) calcula apenas XP diario por check-in e ofensiva.

Alem disso, o formulario de metas (`src/app/habit-form.tsx`) ja oferece atalhos de periodo de 7, 14 e 30 dias, mas `handleApplyQuickRange(daysCount)` soma `start.getDate() + daysCount`, produzindo um intervalo inclusivo de `daysCount + 1` dias (ex.: 7 dias gera 8 dias inclusivos), o que precisa ser ajustado para calculo inclusivo exato (`daysCount - 1`).

## Goals / Non-Goals

**Goals:**
- Implementar uma estrategia de recompensa complementar e transparente baseada na duracao da tarefa (valor fixo por faixa de tempo multiplicado pela dificuldade) e em marcos ciclicos para metas continuas.
- Garantir idempotencia no pagamento de bonus e estorno deterministico quando o check-in disparador for desfeito no mesmo dia.
- Expor a nova aba `Quests` no menu principal listando todas as tarefas com filtros de ciclo de vida e barra de evolucao.
- Disponibilizar uma tela dedicada `/quest-detail` para acompanhamento profundo da evolucao individual de cada tarefa.
- Atualizar `habit-form.tsx` com atalhos inclusivos exatos (7, 14, 30 e 90 dias) e pre-visualizacao dinamica das recompensas.

**Non-Goals:**
- Sincronizacao remota, backend ou exportacao de relatorios em arquivo.
- Edicao manual arbitraria de valores de XP pelo usuario fora das faixas e dificuldades definidas.
- Criacao de novos arquivos de imagem binarios para o icone da aba `Quests` (sera reutilizado o padrao heraldico vetorial/textual de `TabBadgeIcon`).
- Alteracao da formula de XP diario por check-in (`BASE_XP`) ou da contagem de `checkIns.length` usada em `progress.tsx` e `achievementsCatalog.ts`.

## Decisions

### 1. Estrategia de XP por Duracao e Marcos Continuos
- **Decisao**: Adotar modelo **complementar** ao XP diario. Cada check-in diario continua entregando `BASE_XP` (Facil: 15, Medio: 30, Dificil: 50, com +20% a partir de 3 dias de ofensiva), enquanto a constancia ao longo do prazo ou permanencia entrega bonus fixos adicionais.
- **Alternativas consideradas**:
  - Substituir o XP diario pelo valor fixo no final do prazo: descartada porque reduz o reforco positivo imediato no dia a dia.
  - Valor fixo independente da dificuldade: descartada porque tarefas dificeis de 1 mes exigem mais esforco do que tarefas faceis de 1 mes.
- **Tabela de faixas para quests com `endDate` definido** (duracao em dias corridos inclusivos `(endDate - startDate) + 1`):
  - `pontual` (1 a 6 dias): base **50 XP** (Facil 1.0x = 50, Medio 1.5x = 75, Dificil 2.0x = 100)
  - `semanal` (7 a 13 dias): base **150 XP** (Facil = 150, Medio = 225, Dificil = 300)
  - `quinzenal` (14 a 27 dias): base **350 XP** (Facil = 350, Medio = 525, Dificil = 700)
  - `mensal` (28 a 89 dias): base **800 XP** (Facil = 800, Medio = 1200, Dificil = 1600)
  - `trimestral` (90+ dias): base **2200 XP** (Facil = 2200, Medio = 3300, Dificil = 4400)
- **Criterio de liberacao e Quest Perfeita**:
  - `effectiveStartDate = habit.startDate || habit.createdAt.slice(0, 10)` quando apenas `endDate` estiver definido.
  - `scheduledDates`: todas as datas em `[effectiveStartDate, endDate]` compativeis com `habit.daysOfWeek` (ou todos os dias se `daysOfWeek` for vazio).
  - `completedDates`: check-ins distintos de `habit.id` cuja `date` pertence a `scheduledDates`.
  - Meta minima: `scheduledCount <= 3` exige `100%`; `scheduledCount >= 4` exige `>= 80%` (`completedCount / scheduledCount >= 0.8`).
  - **Quest Perfeita**: se `scheduledCount >= 4` e `completedCount === scheduledCount`, aplica `1.2x` (`Math.round(fixedXp * 1.2)`) sobre o bonus fixo.
  - Momento de pagamento: imediato quando `completedCount === scheduledCount` (e `scheduledCount > 0`), ou automaticamente ao encerrar o prazo (`referenceDate > endDate`) com taxa `>= 80%`.
- **Marcos ciclicos para quests continuas (sem `endDate`)**:
  - Baseados no total acumulado de check-ins da quest, multiplicados pela dificuldade (1.0x / 1.5x / 2.0x):
    - `7` check-ins (`1 Semana`): base **150 XP** (150 / 225 / 300)
    - `30` check-ins (`1 Mes`): base **800 XP** (800 / 1200 / 1600)
    - `90` check-ins (`3 Meses`): base **2200 XP** (2200 / 3300 / 4400)
    - `180` check-ins (`6 Meses`): base **4000 XP** (4000 / 6000 / 8000)
    - `365` check-ins (`1 Ano`): base **8000 XP** (8000 / 12000 / 16000)

### 2. Modulo Puro de Dominio para Quests (`src/domain/questProgressService.ts`)
- **Decisao**: Isolar toda a logica de calculo de duracao, datas, aderencia, ciclo de vida e elegibilidade de bonus em um modulo puro sem efeitos colaterais de UI ou store.
- **Assinaturas principais planejadas**:
  - `getInclusiveCalendarDays(startDate: string, endDate: string): number`
  - `getDurationTier(daysCount: number): QuestDurationTierConfig`
  - `calculateDurationFixedXp(daysCount: number, difficulty: Difficulty): { tier: QuestDurationTier; baseXp: number; fixedXp: number; perfectXp: number }`
  - `getScheduledDatesInRange(habit: Habit, startDate: string, endDate: string): string[]`
  - `computeQuestProgress(habit: Habit, checkIns: CheckInRecord[], questRewards: QuestRewardRecord[], referenceDate: string): QuestProgressSummary`
  - `evaluateEligibleQuestRewards(habits: Habit[], checkIns: CheckInRecord[], existingRewards: QuestRewardRecord[], referenceDate: string): PendingQuestReward[]`
- **Aritmetica de datas segura para fuso horario**: Todas as operacoes com strings `YYYY-MM-DD` usam parsing manual (`const [y, m, d] = dateStr.split('-').map(Number); new Date(y, m - 1, d)`) para evitar deslocamentos de 1 dia provocados por `new Date('YYYY-MM-DD')` em UTC.

### 3. Modelo de Dados, Store e Estorno Sincronizado
- **Decisao**: Criar uma colecao dedicada `questRewards: QuestRewardRecord[]` em `AppState` (`src/store/useAppStore.ts`) em vez de inserir registros sinteticos em `checkIns`.
- **Alternativa considerada**: Gravar bonus como `CheckInRecord` especial; descartada porque inflaria `checkIns.length` na tela `Status` ("Metas Vencidas") e nas conquistas de consistencia.
- **Estrutura de `QuestRewardRecord` em `src/types/index.ts`**:
  - `QuestDurationTier = 'pontual' | 'semanal' | 'quinzenal' | 'mensal' | 'trimestral' | 'continua'`
  - `QuestRewardKind = 'period_completion' | 'period_perfect' | 'continuous_milestone'`
  - `QuestLifecycleStatus = 'ativa' | 'continua' | 'futura' | 'concluida' | 'encerrada'`
  - `QuestRewardRecord`: `{ id, habitId, rewardKey, kind, tier, milestoneDays?, xpGained, attributeGained, attributePointsGained, awardedAt, triggerDate }`
- **Integracao na engine (`src/domain/gamificationEngine.ts`) e store**:
  - `applyQuestReward(profile, category, xpGained)` aplica `applyXpGain` no perfil global e credita `Math.round(xpGained * getClassAttributeMultiplier(...))` no atributo da quest.
  - `revertQuestReward(profile, reward)` executa `revertXpGain` e subtrai `reward.attributePointsGained` do atributo correspondente.
  - `completeHabit` e `evaluateDayChange` executam `evaluateEligibleQuestRewards` e aplicam cada novo bonus (`rewardKey` unico: `'period_completion'` para prazo ou `'milestone:<dias>'` para continua). `completeHabit` passa a retornar `{ leveledUp, unlockedAchievements, record, unlockedQuestRewards }`.
  - `uncompleteHabit(habitId, customDate)` identifica recompensas em `questRewards` com `habitId === habitId && triggerDate === dateStr` cujo criterio deixou de ser satisfeito apos remover o check-in (ex.: caiu abaixo de 100% antes do fim do prazo ou caiu abaixo do marco `milestoneDays`), estorna via `revertQuestReward` e remove o registro de `questRewards`.
  - `ensureProfileDefaults()` e inicializacao da store garantem fallback `questRewards: []` para dados legados persistidos no `AsyncStorage`.

### 4. Arquitetura de Navegacao, Aba Quests e Tela de Detalhes
- **Menu inferior (`src/app/(tabs)/_layout.tsx` e `src/components/TabBadgeIcon.tsx`)**:
  - Inserir a aba `quests` (`title: 'Quests'`, `headerTitle: 'Quests e Evolução'`) logo apos `index` (`Hoje`), mantendo 5 abas equilibradas: `Hoje`, `Quests`, `Cavernas`, `Status`, `Medalhas`.
  - Adicionar `'quests'` ao union `TabType` em `TabBadgeIcon.tsx`, renderizando um badge heraldico dedicado (`QST` em paleta indigo/violeta, alinhado ao estilo existente de `MED`).
- **Aba `src/app/(tabs)/quests.tsx`**:
  - Cabecalho resumido (total de quests, ativas, concluidas e XP total de bonus conquistados) + botao `+ Nova Quest` para `/habit-form`.
  - Barra horizontal de filtros: `Todas`, `Ativas`, `Continuas`, `Futuras`, `Concluidas` (o filtro `Concluidas` exibe tanto quests com meta cumprida quanto encerradas para acesso ao historico).
  - Cartao de quest com titulo, badges de categoria/dificuldade/estado, faixa de duracao, barra de progresso (`cumpridos/programados` ou `cumpridos/proximo marco`), dias restantes e XP fixo/marco previsto ou resgatado. Tocar no cartao navega para `/quest-detail?id=<habitId>`.
- **Tela `src/app/quest-detail.tsx` e rota em `src/app/_layout.tsx`**:
  - Registrada no `Stack` de `src/app/_layout.tsx` com titulo `'Evolução da Quest'`.
  - Exibe cabecalho da tarefa com atalho `Editar`, bloco de metricas (aderencia %, cumpridos, programados, perdidos, restantes, ofensiva atual e recorde, XP diario + XP de bonus), painel da estrategia de recompensa (faixa, meta minima, valor fixo, valor Perfeita ou lista de marcos 7/30/90/180/365), grade visual de evolucao dos dias (todos os dias programados do periodo ou ultimos 30 dias programados nas continuas) e historico cronologico de check-ins e bonus resgatados.
- **Formulario `src/app/habit-form.tsx` e feedback em `src/app/(tabs)/index.tsx`**:
  - Corrigir `handleApplyQuickRange(daysCount)` para `end.setDate(start.getDate() + (daysCount - 1))` e adicionar botao de atalho `90 dias` junto a `7`, `14` e `30` dias.
  - Renderizar card de pre-visualizacao dinamica calculando em tempo real o XP diario e o bonus fixo/Perfeita ou marcos continuos conforme `difficulty`, `hasDateRange`, `startDate` e `endDate`.
  - Em `(tabs)/index.tsx`, exibir no banner de feedback o titulo/valor do bonus quando `unlockedQuestRewards.length > 0`.

## Risks / Trade-offs

- **[Dados legados no AsyncStorage sem o campo `questRewards`]** -> Mitigacao: inicializar `questRewards: []` como valor padrao na store, garantir `questRewards: state.questRewards || []` nas acoes e em `ensureProfileDefaults`, e tratar arrays possivelmente indefinidos com fallback seguro.
- **[Desvio de 1 dia por fuso horario ao converter `YYYY-MM-DD`]** -> Mitigacao: proibir `new Date(dateStr)` direto; utilizar parser local `parseLocalDate(dateStr)` e formatador `getTodayDateString` em todas as funcoes de `questProgressService.ts` e cobrir com testes unitarios.
- **[Edicao de vigencia em quest que ja recebeu `period_completion`]** -> Mitigacao: manter `rewardKey = 'period_completion'` idempotente por `habitId`, garantindo que o bonus de conclusao do periodo seja creditado no maximo uma vez por quest.
- **[Intervalo de calendario sem nenhum dia programado (ex.: vigencia de 2 dias sab/dom para meta configurada so de seg-sex)]** -> Mitigacao: tratar explicitamente `scheduledCount === 0` retornando `completionRate = 0`, `status = 'encerrada'` apos o fim e nao concedendo bonus.
- **[Mudanca na contagem inclusiva dos atalhos de prazo em `habit-form.tsx`]** -> Mitigacao: `daysCount - 1` alinha exatamente "7 dias" com 7 dias de calendario inclusivos (1 semana), resolvendo a inconsistencia anterior onde 7 dias gerava 8 dias corridos.
