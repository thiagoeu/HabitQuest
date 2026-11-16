# Spec Delta

## Purpose

Apresenta ao usuario evidencias visuais da sua capacidade de cumprir metas por meio de um painel de perfil gamificado, historico de superacao e galeria de conquistas.

## ADDED Requirements

### Requirement: Cabecalho de perfil gamificado
O sistema SHALL exibir o nivel atual do usuario, barra de progresso de XP para o proximo nivel, barra de Energia (HP), ofensiva global atual e distribuicao de niveis dos atributos (Intelecto, Forca/Saude e Disciplina).

#### Scenario: Atualizacao imediata do painel apos cumprir uma meta
- **WHEN** o usuario conclui uma meta do dia
- **THEN** o painel reflete imediatamente o novo saldo de XP, o incremento no atributo correspondente e a porcentagem de conclusao do dia

### Requirement: Historico visual de superacao e consistencia
O sistema SHALL apresentar um resumo historico com o total acumulado de metas ja cumpridas, taxa de conclusao dos ultimos dias e indicadores visuais dos dias em que o usuario cumpriu seus objetivos.

#### Scenario: Consulta ao painel de superacao
- **WHEN** o usuario acessa a aba de progresso/superacao
- **THEN** o sistema exibe o contador total de metas vencidas desde o inicio do uso, o recorde de ofensiva e o mapa dos ultimos dias com status de cumprimento

### Requirement: Galeria de medalhas e conquistas
O sistema SHALL exibir todas as conquistas disponiveis no aplicativo, destacando as ja desbloqueadas (com data de obtencao) e mostrando o criterio claro para alcancar as conquistas ainda bloqueadas.

#### Scenario: Visualizacao de conquistas desbloqueadas e pendentes
- **WHEN** o usuario abre a galeria de conquistas
- **THEN** o sistema lista as medalhas conquistadas em destaque e exibe o progresso ou requisito necessario para desbloquear as demais

### Requirement: Mensagens de reforco de autoeficacia
O sistema SHALL exibir mensagens dinamicas baseadas nos dados reais do usuario que reforcem sua capacidade de cumprir metas (por exemplo, citando quantas metas ele ja cumpriu na semana ou seu atributo mais forte).

#### Scenario: Exibicao de mensagem baseada no historico real
- **WHEN** o usuario possui metas concluidas no historico e visualiza a tela inicial ou o painel de progresso
- **THEN** o sistema apresenta um destaque motivacional citando marcos reais ja alcancados pelo proprio usuario
