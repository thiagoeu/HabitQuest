# progress-dashboard Specification

## Purpose
Apresenta ao usuario evidencias visuais da sua capacidade de cumprir metas por meio de um painel de perfil gamificado, historico de superacao e galeria de conquistas.

## Requirements

### Requirement: Cabecalho de perfil gamificado
O sistema SHALL exibir o nivel atual do usuario, classe ativa com seu emblema ou asset visual, indicador de prontidao para troca de classe quando disponivel, barra de progresso de XP para o proximo nivel, barra de Energia (HP), saldo de pontos de expedicao, ofensiva global e distribuicao de niveis dos atributos.

#### Scenario: Atualizacao imediata do painel apos cumprir uma meta
- **WHEN** o usuario conclui uma meta do dia
- **THEN** o painel reflete imediatamente o novo saldo de XP, pontos de expedicao, o incremento no atributo correspondente e a porcentagem de conclusao do dia

#### Scenario: Exibicao visual da classe e status de prontidao
- **WHEN** o usuario visualiza o topo da tela de perfil
- **THEN** o sistema exibe o nome e icone/asset da classe atual e destaca o botao de evolucao caso novos requisitos tenham sido atingidos

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

### Requirement: Painel de expedicoes e monstros derrotados
O sistema SHALL disponibilizar no perfil ou na aba de superacao uma secao dedicada exibindo o resumo das batalhas em cavernas, monstros derrotados e cavernas concluidas.

#### Scenario: Visualizacao de estatisticas de combate
- **WHEN** o usuario visualiza a secao de conquistas de combate
- **THEN** o sistema exibe a contagem de monstros vencidos e o total de expedicoes bem-sucedidas
