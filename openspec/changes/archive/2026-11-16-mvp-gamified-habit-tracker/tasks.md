# Tasks

## 1. Inicializacao do Projeto e Estrutura Base

- [x] 1.1 Inicializar o projeto React Native com Expo e TypeScript (`expo-router`, `zustand`, `@react-native-async-storage/async-storage`, `expo-notifications`, `jest`) e verificar que `package.json` e `tsconfig.json` compilam sem erros via `npx tsc --noEmit`.
- [x] 1.2 Criar a estrutura de diretorios (`src/app`, `src/components`, `src/domain`, `src/services`, `src/store`, `src/types`) e definir todas as interfaces de dominio em `src/types/index.ts` (`Habit`, `AttributeCategory`, `Difficulty`, `CheckInRecord`, `UserProfile`, `Achievement`), verificando a checagem de tipos com `npx tsc --noEmit`.

## 2. Motor de Gamificacao e Catalogos de Dominio

- [x] 2.1 Implementar `src/domain/gamificationEngine.ts` com funcoes puras para calculo de XP por dificuldade, subida de nivel global, incremento de atributos (`intellect`, `strength`, `discipline`), calculo de ofensivas (streaks) e sistema de Energia (HP) com penalidade diaria e modo "Segunda Chance", verificando com testes unitarios em `src/domain/__tests__/gamificationEngine.test.ts`.
- [x] 2.2 Implementar `src/domain/achievementsCatalog.ts` e `src/domain/motivationalQuotes.ts` com a avaliacao automatica de conquistas desbloqueaveis (primeira meta, 3, 7 e 30 dias de ofensiva, marcos de atributos) e geracao de mensagens de autoeficacia baseadas no historico real, verificando com testes unitarios em `src/domain/__tests__/achievementsAndQuotes.test.ts`.

## 3. Gerenciamento de Estado Local e Persistencia (Habitos e Check-in)

- [x] 3.1 Implementar a store global persistida em `src/store/useAppStore.ts` (Zustand + AsyncStorage) cobrindo criacao, edicao, exclusao de habitos, filtragem por dia da semana, check-in diario, reversao de check-in no mesmo dia (estornando XP/atributos/HP exatos) e avaliacao de virada de dia, verificando com testes automatizados da store em `src/store/__tests__/useAppStore.test.ts`.

## 4. Servico de Despertadores e Lembretes Motivacionais

- [x] 4.1 Implementar `src/services/notificationService.ts` com `expo-notifications` para solicitar permissoes, configurar canal de alta prioridade no Android, agendar lembretes semanais com frase motivacional e recompensa de XP, cancelar agendamentos ao editar/excluir habito e registrar acoes rapidas de check-in/abertura, verificando com testes unitarios mocando `expo-notifications` em `src/services/__tests__/notificationService.test.ts`.
- [x] 4.2 Integrar os gatilhos de `notificationService` nas acoes de criar, editar, excluir e concluir habito dentro de `useAppStore` e no listener de inicializacao do app, verificando que o agendamento e cancelamento sao acionados corretamente nos testes de integracao da store.

## 5. Interface Principal: Metas do Dia e Cadastro de Habitos

- [x] 5.1 Criar os componentes `src/components/ProfileHeader.tsx` (nivel, barra de XP, barra de HP, ofensiva global e resumo de atributos) e `src/components/HabitCard.tsx` (item de meta diaria com botao de check-in, categoria, dificuldade, streak e horario de alarme), verificando a renderizacao e tipagem sem erros via `npx tsc --noEmit`.
- [x] 5.2 Implementar a tela principal do dia em `src/app/(tabs)/index.tsx` (separando metas pendentes e concluidas, banner motivacional de autoeficacia e feedback de subida de nivel/segunda chance) e o modal/tela `src/app/habit-form.tsx` (criacao, validacao de titulo obrigatorio, edicao e exclusao de habito com configuracao de dias e despertador), verificando o fluxo completo de cadastro e check-in.

## 6. Painel de Superacao e Galeria de Conquistas

- [x] 6.1 Implementar a tela de progresso e superacao em `src/app/(tabs)/progress.tsx` exibindo evolucao detalhada dos atributos (Intelecto, Forca/Saude, Disciplina), total acumulado de metas cumpridas, recorde de ofensiva e mapa visual dos ultimos dias, verificando que os dados refletem imediatamente os check-ins realizados na store.
- [x] 6.2 Implementar a galeria de medalhas em `src/app/(tabs)/achievements.tsx` utilizando o componente `src/components/AchievementBadge.tsx` para listar conquistas desbloqueadas (com data) e bloqueadas (com requisito claro), verificando a compilacao e execucao completa da suite de testes com `npx jest`.
