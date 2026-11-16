# Proposal

## Why

Atualmente, a criação de metas se restringe à repetição semanal e não permite definir metas temporárias com intervalo de datas no calendário (de uma data inicial até uma data final), além de faltar um aviso prévio (10 minutos antes) para preparação do usuário. Ademais, na experiência do usuário no mobile, a abertura do teclado sobrepõe os campos de horário e ações do formulário, prejudicando a usabilidade.

## What Changes

- Implementação de seleção de intervalo de datas (período de vigência com data de início e data de término opcional) no cadastro e edição de metas.
- Flexibilização do horário de alarme para ser estritamente opcional: o usuário pode criar metas sem horário definido ou com horário específico.
- Implementação de opção de lembrete com aviso prévio de 10 minutos antes do horário agendado, disparando uma notificação preparatória além do alarme no horário exato.
- Atualização do filtro diário de hábitos para considerar se o dia atual está dentro do período de vigência (`startDate` até `endDate`) além dos dias da semana.
- Correção de usabilidade no formulário com `KeyboardAvoidingView` e rolagem automática para que o teclado não oculte os seletores de horário e botões de ação.

## Capabilities

### New Capabilities
<!-- Nenhuma nova capacidade requerida; as capacidades existentes serao evoluidas via delta. -->

### Modified Capabilities
- `habit-management`: Atualizacao dos requisitos de criacao, edicao e listagem diária de habitos para suportar intervalo de vigencia no calendario (`startDate` e `endDate`) e horario de alarme estritamente opcional.
- `motivational-alarms`: Atualizacao do requisito de agendamento de despertador local para contemplar a notificacao de aviso previo de 10 minutos antes da meta.

## Impact

- **Modelo de Dados**: Extensao do tipo `Habit` com `startDate?: string | null`, `endDate?: string | null` e `earlyReminderEnabled?: boolean`.
- **Servico de Notificacoes**: Agendamento duplo em `notificationService` quando o aviso de 10 minutos estiver ativo.
- **Interface e UX**: Reformulacao do `src/app/habit-form.tsx` com selecao de periodo/calendario, campos condicionais de horario e integracao com `KeyboardAvoidingView`.
