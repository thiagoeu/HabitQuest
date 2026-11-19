# Spec Delta

## Purpose

Permite que o usuario visualize todas as suas tarefas cadastradas em um catalogo unificado no menu principal e acompanhe a evolucao individual, aderencia e recompensas de cada quest ao longo do tempo.

## ADDED Requirements

### Requirement: Aba Quests no menu principal de navegacao
O sistema SHALL exibir uma aba dedicada chamada "Quests" no menu inferior de navegacao, apresentando todas as tarefas cadastradas pelo usuario independentemente do dia da semana ou periodo de vigencia atual.

#### Scenario: Visualizacao de todas as tarefas na aba Quests
- **WHEN** o usuario acessa a aba "Quests" no menu inferior tendo tarefas agendadas para outros dias, futuras, continuas e ja encerradas
- **THEN** o sistema lista todas as tarefas cadastradas sem restringir a exibicao apenas as metas programadas para o dia atual

#### Scenario: Acesso rapido para criar nova quest a partir da listagem
- **WHEN** o usuario aciona o botao de criacao de nova quest na aba "Quests"
- **THEN** o sistema abre o formulario de cadastro de metas para adicionar uma nova tarefa

### Requirement: Filtros de ciclo de vida e resumo na listagem de Quests
O sistema SHALL agrupar ou filtrar as tarefas na aba "Quests" por estado de ciclo de vida ("Todas", "Ativas", "Continuas", "Futuras" e "Concluidas") e exibir no topo um resumo consolidado das quests e do XP de bonus acumulado.

#### Scenario: Filtragem de quests por estado
- **WHEN** o usuario seleciona o filtro "Ativas" na aba "Quests"
- **THEN** o sistema exibe apenas as quests com prazo definido cuja vigencia abrange a data atual e que ainda nao foram finalizadas

#### Scenario: Exibicao de cartao resumido de evolucao por quest
- **WHEN** a listagem de quests e renderizada com tarefas cadastradas
- **THEN** cada cartao exibe titulo, categoria, dificuldade, badge de estado, faixa de duracao, barra de progresso percentual, dias restantes quando aplicavel e o XP de bonus previsto ou ja conquistado

### Requirement: Pagina dedicada de evolucao detalhada da quest
O sistema SHALL abrir uma pagina dedicada de acompanhamento ao tocar em qualquer tarefa da aba "Quests", apresentando metricas completas de evolucao, calendario visual dos dias, historico de check-ins e situacao do bonus de duracao ou marcos.

#### Scenario: Consulta da evolucao de uma quest com prazo definido
- **WHEN** o usuario toca em uma quest de 1 semana ou 1 mes na listagem de quests
- **THEN** o sistema exibe taxa de aderencia percentual, contagem de dias cumpridos, programados, perdidos e restantes, ofensiva atual e recorde, grade visual dos dias da vigencia, historico de check-ins e situacao do bonus fixo e do bonus de Quest Perfeita

#### Scenario: Consulta da evolucao de uma quest continua
- **WHEN** o usuario toca em uma quest continua sem data final na listagem de quests
- **THEN** o sistema exibe o progresso ate o proximo marco de permanencia (7, 30, 90, 180 ou 365 check-ins), o estado dos marcos ja conquistados e futuros, e a evolucao dos ultimos 30 dias programados

#### Scenario: Acesso a edicao a partir da pagina de evolucao
- **WHEN** o usuario aciona o botao de edicao dentro da pagina de detalhe da quest
- **THEN** o sistema abre o formulario de configuracao preenchido com os dados daquela tarefa
