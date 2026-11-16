# Tasks

## 1. Modelo de Tipos e Servico de Notificacoes

- [x] 1.1 Atualizar `src/types/index.ts` adicionando `startDate`, `endDate` e `earlyReminderEnabled` a interface `Habit`, verificando a checagem de tipos com `npx tsc --noEmit`.
- [x] 1.2 Atualizar `src/services/notificationService.ts` com a funcao utilitaria `calculateEarlyReminderTime` e agendamento do aviso previo de 10 minutos antes da meta, verificando com testes unitarios em `src/services/__tests__/notificationService.test.ts`.

## 2. Logica de Filtragem e Persistencia na Store

- [x] 2.1 Atualizar `getHabitsForDate` em `src/store/useAppStore.ts` para validar se a data consultada esta contida no intervalo de datas (`startDate` ate `endDate`) alem dos dias da semana, e permitir habitos sem horario de despertador, verificando com testes em `src/store/__tests__/useAppStore.test.ts`.

## 3. Interface, Seletor de Datas e Tratamento de Teclado

- [x] 3.1 Refatorar `src/app/habit-form.tsx` implementando seletores de periodo de calendario (data inicial e data final opcional), horario estritamente opcional, switch para aviso previo de 10 minutos e `KeyboardAvoidingView` com `ScrollView` para que o teclado nao encubra campos de entrada nem botoes, verificando com `npx tsc --noEmit`.
- [x] 3.2 Atualizar `src/components/HabitCard.tsx` e `src/app/(tabs)/index.tsx` para exibir badges de periodo de vigencia e aviso previo de 10 minutos quando ativos, verificando a suite completa de testes com `npm test`.
