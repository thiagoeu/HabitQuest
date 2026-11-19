# Design

## Context

Atualmente o formulario de metas (`src/app/habit-form.tsx`) possui botoes manuais para o usuario escolher a dificuldade (`facil`, `medio`, `dificil`), o que gera arbitrarieadade nas recompensas de XP. Alem disso, os blocos de vigencia e despertador ficam colapsados por switches (`hasDateRange` e `reminderEnabled`), e as datas precisam ser digitadas manualmente em formato textual.

Para maiores detalhes sobre a motivacao e escopo, veja `proposal.md` e `specs/habit-management/spec.md`.

## Goals / Non-Goals

**Goals:**
- Prover uma funcao pura no dominio (`src/domain/questProgressService.ts`) que infere a dificuldade do habito a partir do periodo de vigencia e volume de metas programadas.
- Criar um componente de mini calendario interativo (`src/components/MiniCalendarPicker.tsx` ou integrado) em React Native puro, exibindo dias do mes, navegacao de meses e selecao visual de intervalo de datas (inicio e fim).
- Exibir todas as secoes do formulario abertas por padrao: periodo de vigencia, mini calendario, dias da semana, alarme de horario e aviso previo de 10 minutos, sem switches que ocultem componentes da tela.
- Atualizar a previa de XP em tempo real refletindo a dificuldade inferida e as recompensas correspondentes.

**Non-Goals:**
- Instalar bibliotecas externas pesadas de calendario (ex: react-native-calendars); a solucao usara componentes nativos leves e compativeis com Expo e React Native.
- Alterar o contrato de persistencia ou os tipos do modelo `Habit` (o campo `difficulty` permanece como `'facil' | 'medio' | 'dificil'`).

## Decisions

### Decisão 1: Componente de Mini Calendario Nativo em React Native Puro
- **Opcao escolhida**: Desenvolver um componente modular de mini calendario utilizando exclusivamente componentes fundamentais do React Native (`View`, `Text`, `TouchableOpacity`).
- **Motivo**: Garante integracao visual perfeita com o tema dark/RPG do app, zero adicao de dependencias pesadas propensas a conflitos de versoes no Expo, suporte completo a selecao de data de inicio e fim, e facilidade de manutencao e testes.
- **Alternativa considerada**: `react-native-calendars` ou date pickers nativos de modal. Rejeitado pois adicionam dependencias desnecessarias, quebram a visibilidade continua requerida na tela e dificultam selecao de intervalo integrado inline.

### Decisão 2: Regra de Derivacao Automatica da Dificuldade
- **Opcao escolhida**: Criar a funcao `deriveHabitDifficulty(params: { startDate?: string | null; endDate?: string | null; daysOfWeek: number[] }): Difficulty` em `src/domain/questProgressService.ts`:
  - Se a meta possui intervalo delimitado (`startDate` e `endDate` validos):
    - Intervalo de 1 a 6 dias corridos (ou ate 4 dias programados): `'facil'` (15 XP diario).
    - Intervalo de 7 a 27 dias corridos (ou de 5 a 19 dias programados): `'medio'` (30 XP diario).
    - Intervalo de 28 dias corridos ou mais (ou 20+ dias programados): `'dificil'` (50 XP diario).
  - Se a meta e continua (sem data final definida):
    - Se programada para 1 ou 2 dias por semana: `'medio'`.
    - Se programada para 3 ou mais dias por semana: `'dificil'` (hábito permanente de alta frequencia com marcos cumulativos de 7, 30, 90, 180 e 365 dias).
- **Motivo**: Alinha a dificuldade com os patamares de duracao ja introduzidos no sistema de Quests (`pontual`, `semanal`, `quinzenal`, `mensal`, `trimestral`), premiando o compromisso com maiores recompensas.

### Decisão 3: Visibilidade Total dos Elementos do Formulario
- **Opcao escolhida**: Remover o colapsamento condicional de renderizacao. A area de vigencia no calendario fica sempre aberta com o mini calendario exibido diretamente. A area de despertador permanece sempre aberta mostrando o campo de horario (HH:mm) e o switch de aviso previo de 10 min, mantendo apenas o switch de ativacao do alarme (ligado/desligado) sem fazer os inputs sumirem.
- **Motivo**: Atende expressamente ao requisito do usuario de enxergar todos os parametros de uma so vez, evitando controles ocultos.

## Risks / Trade-offs

- **[Risco]** Navegacao acidental de meses no mini calendario.
  - *Mitigacao*: Botao rapido de "Voltar para o mes atual" e manutencao dos atalhos rapidos (7, 14, 30, 90 dias) para preenchimento com um unico toque.
- **[Risco]** Selecao de datas invertidas pelo usuario no toque.
  - *Mitigacao*: Logica inteligente no mini calendario: se o usuario ja tem uma data de inicio e toca em um dia anterior a ela, essa nova data vira automaticamente a data de inicio e reseta o fim. Se toca em data posterior, define como data final. Um toque na propria data de inicio selecionada desmarca o fim, permitindo modo continuo.
