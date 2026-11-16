# Design

## Context

O projeto parte de um repositorio greenfield (vazio) para construir um MVP mobile em React Native voltado a motivacao e cumprimento de metas pessoais (consulte `proposal.md - Why`). Toda a operacao deve funcionar 100% offline no dispositivo do usuario, sem necessidade de autenticacao ou backend remoto neste primeiro ciclo.

## Goals / Non-Goals

**Goals:**
- Estruturar uma arquitetura React Native (Expo) modular, tipada em TypeScript e de facil manutencao.
- Garantir persistencia local confiavel e reativa para habitos, registros diarios de conclusao (check-ins), perfil de gamificacao e conquistas.
- Centralizar a logica do motor de gamificacao (XP, niveis, atributos, streaks, HP e medalhas) em funcoes puras e testaveis, desacopladas da camada visual.
- Integrar notificacoes locais agendadas com suporte a categorias de acao rapida e navegacao direta para a meta.

**Non-Goals:**
- Sincronizacao em nuvem, autenticacao de usuarios ou ranking social/multiplayer.
- Despertadores nativos em nivel de kernel que substituam o aplicativo de relogio do sistema operacional com sobreposicao de tela bloqueada customizada (utilizaremos notificacoes locais de alta prioridade via `expo-notifications`).
- Loja complexa de itens cosmeticos ou economia virtual com moedas multiplas neste MVP.

## Decisions

### 1. Framework e Navegacao: Expo (Managed Workflow) + Expo Router
- **Escolha**: Utilizar Expo SDK com TypeScript e `expo-router` (navegacao baseada em arquivos com abas inferiores: Hoje/Metas, Progresso/Superacao e Conquistas/Perfil).
- **Racional**: Acelera a configuracao inicial, fornece acesso direto a APIs nativas essenciais (`expo-notifications`, armazenamento local) sem necessidade de gerenciar codigo nativo manualmente no MVP, e mantem a estrutura de rotas previsivel.
- **Alternativas consideradas**:
  - *React Native CLI (Bare)*: Descartado pelo maior custo de configuracao de ambiente nativo para um MVP rapido.
  - *React Navigation manual sem Expo Router*: Viavel, porem o `expo-router` reduz boilerplate e facilita deep linking ao tocar em notificacoes de lembretes.

### 2. Gerenciamento de Estado e Persistencia Local: Zustand + AsyncStorage
- **Escolha**: Utilizar `zustand` com middleware `persist` apoiado por `@react-native-async-storage/async-storage`.
- **Racional**: O volume de dados de um usuario individual (dezenas de habitos, historico diario de check-ins e estado do perfil gamificado) cabe confortavelmente em estruturas JSON serializadas. O par Zustand + AsyncStorage oferece reatividade imediata na UI ao concluir uma meta, simplicidade de implementacao e zero sobrecarga de migracoes SQL no MVP.
- **Alternativas consideradas**:
  - *expo-sqlite / WatermelonDB*: Excelentes para grandes volumes relacionais, mas adicionam complexidade de schema e queries assincronas desnecessarias para o escopo enxuto do MVP.

### 3. Motor de Gamificacao Deterministico (Pure Domain Functions)
- **Escolha**: Isolar todas as formulas de progressao em um modulo `src/domain/gamificationEngine.ts`:
  - **XP por Dificuldade**: Facil = 15 XP, Medio = 30 XP, Dificil = 50 XP (com bonus de +20% quando a ofensiva do habito for maior ou igual a 3 dias).
  - **Curva de Nivel Global**: $\text{XP Necessario}(\text{nivel}) = 100 \times \text{nivel}$ (progressao linear suave para manter senso constante de conquista no inicio).
  - **Atributos (`intellect`, `strength`, `discipline`)**: Cada check-in adiciona os mesmos pontos de XP base ao atributo correspondente da categoria do habito, com nivel de atributo calculado a cada 150 pontos.
  - **Energia (HP) e Segunda Chance**: O usuario inicia com 100 HP. Na virada do dia (verificada ao abrir o app comparando `lastEvaluatedDate` com a data atual), cada habito programado para o dia anterior e nao concluido reduz 10 HP (limite minimo de 0 HP). Se o HP chegar a 0, o modo "Segunda Chance" e ativado: o usuario nao perde niveis nem conquistas, e ao concluir a primeira meta do dia recupera 30 HP. Cada meta concluida normalmente recupera +5 HP (ate o teto de 100 HP).
- **Racional**: Funcoes puras permitem validar facilmente todos os cenarios das specs com testes unitarios e evitam bugs de estado inconsistente quando o usuario marca ou desmarca uma tarefa no mesmo dia.

### 4. Despertadores e Lembretes Motivacionais: `expo-notifications`
- **Escolha**: Utilizar agendamentos semanais/diarios do `expo-notifications` vinculados ao ID do habito (`notificationIds: string[]` salvos no proprio objeto do habito), registrando uma categoria de notificacao (`HABIT_REMINDER`) com acoes rapidas ("Concluir meta" e "Abrir agora") e um banco local de frases motivacionais orientadas a autoeficacia.
- **Racional**: Permite agendar multiplos dias da semana mesmo com o app fechado ou sem internet, cancelar facilmente os alarmes antigos ao editar/excluir o habito e reagir ao toque do usuario para abrir ou concluir a meta.

### 5. Arquitetura de Pastas
```text
src/
  app/                  # Rotas Expo Router ((tabs)/index.tsx, progress.tsx, achievements.tsx, habit-form.tsx)
  components/           # Componentes visuais (ProfileHeader, HabitCard, SuperationSummary, AchievementBadge)
  domain/               # Regras de negocio puras (gamificationEngine.ts, motivationalQuotes.ts, achievementsCatalog.ts)
  services/             # Integracao com notificacoes locais (notificationService.ts)
  store/                # Estado global persistido com Zustand (useAppStore.ts)
  types/                # Interfaces TypeScript (Habit, UserProfile, CheckInRecord, Achievement)
```

## Risks / Trade-offs

- **[Restricoes de notificacao em background no Android/iOS]** → Mitigacao: Solicitar explicitamente as permissoes no primeiro agendamento, configurar canal de notificacao Android com importancia maxima (`AndroidImportance.MAX`), som e vibracao habilitados, e informar claramente o usuario caso a permissao esteja negada.
- **[Desfazer check-in no mesmo dia pode gerar inconsistencia no XP/Atributos]** → Mitigacao: Registrar no `CheckInRecord` exatamente quanto de XP, pontos de atributo e HP aquela conclusao concedeu, garantindo que a reversao no mesmo dia subtraia exatamente os valores originais.
- **[Avaliacao de penalidade de HP em dias sem abrir o aplicativo]** → Mitigacao: Ao abrir o aplicativo, avaliar apenas o ultimo dia ativo ou limitar a perda maxima acumulada de uma unica vez para que o usuario que ficou alguns dias ausente seja recebido com incentivo de retomada ("Segunda Chance") em vez de punicao excessiva.
