# Tasks

## 1. Regra de Dominio para Derivacao Automatica de Dificuldade

- [x] 1.1 Implementar a funcao `deriveHabitDifficulty` em `src/domain/questProgressService.ts` calculando a dificuldade a partir de datas de vigencia e contagem de dias programados, e exporta-la.
- [x] 1.2 Criar testes unitarios em `__tests__/domain/questProgressService.test.ts` validando cenarios de metas curtas (facil), intermediarias (medio), longas (dificil) e continuas, verificando com `npx jest --testPathPattern=questProgressService`.

## 2. Componente de Mini Calendario Interativo

- [x] 2.1 Criar o componente `src/components/MiniCalendarPicker.tsx` com navegacao entre meses, exibicao dos dias da semana e selecao visual intuitiva de intervalo de inicio e fim.
- [x] 2.2 Criar testes unitarios em `__tests__/components/MiniCalendarPicker.test.tsx` validando renderizacao dos dias, selecao de inicio, selecao de fim e alternancia de mes.

## 3. Reformulacao do Formulario de Metas e Visibilidade Total

- [x] 3.1 Atualizar `src/app/habit-form.tsx` removendo a selecao manual de dificuldade e exibindo a dificuldade e XP calculados dinamicamente em tempo real.
- [x] 3.2 Incorporar o `MiniCalendarPicker` de forma permanentemente aberta na secao de vigencia de `src/app/habit-form.tsx`, preservando atalhos rapidos de periodo.
- [x] 3.3 Tornar os campos de horario de despertador e aviso previo de 10 minutos sempre visiveis diretamente na interface de `src/app/habit-form.tsx`, mantendo o switch de ativacao sem colapsar os controles.
- [x] 3.4 Atualizar os testes unitarios de tela em `__tests__/screens/habit-form.test.tsx` cobrindo o fluxo de criacao com dificuldade inferida e campos visiveis.

## 4. Verificacao Integrada e Aprovacao

- [x] 4.1 Executar a verificacao de tipagem estatica (`npx tsc --noEmit`) e confirmar ausencia de erros TypeScript.
- [x] 4.2 Executar a suite completa de testes (`npx jest --runInBand`) e assegurar 100% de aprovacao em todos os modulos.
