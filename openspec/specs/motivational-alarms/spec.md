# motivational-alarms Specification

## Purpose
Gerencia o agendamento, disparo e interacao com despertadores e notificacoes locais contendo mensagens motivacionais e acoes rapidas para execucao das metas.

## Requirements

### Requirement: Agendamento de despertador local por habito
O sistema SHALL agendar notificacoes locais recorrentes nos dias da semana e horarios definidos pelo usuario para cada habito ativo que possua lembrete habilitado, permitindo tambem configurar opcionalmente um aviso previo diario 10 minutos antes do horario programado.

#### Scenario: Agendamento ao salvar habito com horario
- **WHEN** o usuario cria ou edita um habito definindo o horario "07:30" para segunda, quarta e sexta-feira
- **THEN** o sistema solicita permissao de notificacao (se ainda nao concedida) e agenda os disparos locais para os dias e horario configurados

#### Scenario: Agendamento com aviso previo de 10 minutos
- **WHEN** o usuario ativa o lembrete para as "08:00" e marca a opcao de aviso previo de 10 minutos
- **THEN** o sistema agenda uma notificacao preparatoria para as "07:50" e a notificacao principal de alarme para as "08:00" nos dias programados

#### Scenario: Cancelamento automatico ao desativar ou excluir habito
- **WHEN** o usuario desativa o alarme de um habito ou exclui o habito
- **THEN** o sistema cancela imediatamente todos os agendamentos futuros (incluindo avisos previos de 10 minutos) daquele habito no sistema operacional

### Requirement: Conteudo motivacional contextualizado no disparo
O sistema SHALL exibir no disparo do alarme/notificacao o nome do habito, a recompensa de XP/atributo em jogo e uma frase motivacional voltada a capacidade de execucao do usuario.

#### Scenario: Disparo de notificacao no horario programado
- **WHEN** o relogio do dispositivo atinge o horario programado de um habito ainda pendente no dia
- **THEN** o sistema apresenta a notificacao com o titulo da meta, uma frase motivacional contextualizada e o ganho de XP correspondente

### Requirement: Acoes rapidas a partir do lembrete
O sistema SHALL permitir que o usuario interaja com o lembrete para abrir diretamente a tela de foco/execucao da meta ou registrar sua conclusao imediata.

#### Scenario: Toque na notificacao para iniciar ou concluir a meta
- **WHEN** o usuario toca na notificacao ou aciona a acao rapida de conclusao do lembrete
- **THEN** o aplicativo abre destacando o habito correspondente (ou confirma o check-in diretamente) e concede o feedback de progresso ao usuario
