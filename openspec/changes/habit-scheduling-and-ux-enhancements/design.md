# Design

## Context

Consulte `proposal.md - Why`. A versão anterior do aplicativo implementou a criação de hábitos com base em dias da semana e alarme obrigatório quando os lembretes estavam ativos. Agora estendemos o modelo para suportar períodos de calendário (data de início e fim), tornamos o horário estritamente opcional, adicionamos aviso de 10 minutos antes e solucionamos a sobreposição visual causada pelo teclado virtual no formulário.

## Goals / Non-Goals

**Goals:**
- Estender a entidade `Habit` com campos de calendário (`startDate`, `endDate`) e aviso antecipado (`earlyReminderEnabled`).
- Permitir que o usuário crie metas sem horário de alarme fixo ou com horário e aviso prévio.
- Atualizar a lógica de busca diária na store (`getHabitsForDate`) para filtrar por vigência de calendário além dos dias da semana.
- Agendar notificação dupla quando o aviso prévio de 10 minutos estiver ativo, limpando todos os IDs ao editar ou excluir.
- Garantir com `KeyboardAvoidingView` e `ScrollView` que o teclado nunca esconda campos de formulário, switches ou botões de salvar.

**Non-Goals:**
- Sincronização externa com calendários de terceiros (Google Calendar, Apple iCal).
- Múltiplos avisos prévios configuráveis (ex: 5 min, 15 min, 30 min); manteremos 10 minutos fixo como solicitado para manter o MVP simples e direto.

## Decisions

### 1. Modelo de Dados e Filtro de Calendário
- **Decisão**: Adicionar os campos opcionais no tipo `Habit`:
  - `startDate?: string | null` (formato YYYY-MM-DD)
  - `endDate?: string | null` (formato YYYY-MM-DD)
  - `earlyReminderEnabled?: boolean`
- **Lógica de Filtragem (`getHabitsForDate`)**:
  Uma meta só é apresentada no dia `targetDate` se:
  1. `!h.archived`
  2. `!h.startDate || h.startDate <= targetDate`
  3. `!h.endDate || h.endDate >= targetDate`
  4. `h.daysOfWeek.length === 0 || h.daysOfWeek.includes(dayOfWeek)`

### 2. Notificação Prévia de 10 Minutos no `notificationService`
- **Decisão**: Ao agendar os lembretes semanais:
  - Sempre que `reminderEnabled && reminderTime`, agenda o alarme no horário exato (`${hour}:${minute}`).
  - Se `earlyReminderEnabled === true`, calcula o horário de 10 minutos antes (`earlyHour`, `earlyMinute`, ajustando o dia caso cruze a meia-noite).
  - Dispara a notificação de aviso com título `"Aviso: 10 minutos para sua meta"` e corpo com frase preparatória.
  - Todos os identificadores de notificações gerados são armazenados no array `notificationIds` do hábito, garantindo cancelamento completo unificado.

### 3. Tratamento de Teclado e Rolagem no Formulário
- **Decisão**: Em `src/app/habit-form.tsx`:
  - Envolver todo o conteúdo em `KeyboardAvoidingView` com `behavior={Platform.OS === 'ios' ? 'padding' : undefined}`.
  - Utilizar `ScrollView` com `keyboardShouldPersistTaps="handled"` e `contentContainerStyle={{ paddingBottom: 120 }}`.
  - Implementar seletores visuais amigáveis para datas inicial e final com opção de meta contínua (sem data final).

## Risks / Trade-offs

- **[Subtração de 10 minutos ao cruzar a meia-noite (ex: 00:05 vira 23:55 do dia anterior)]** → Mitigação: Criar função utilitária pura `calculateEarlyReminderTime(hour, minute, offsetMinutes)` com testes unitários cobrindo transição de dia e horário.
- **[Compatibilidade com hábitos existentes salvos no AsyncStorage sem datas]** → Mitigação: A função de filtro trata `startDate` e `endDate` como opcionais; se não existirem, o hábito é exibido normalmente em seus dias da semana.
