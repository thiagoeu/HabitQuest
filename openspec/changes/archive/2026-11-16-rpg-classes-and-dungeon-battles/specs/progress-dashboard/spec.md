# Spec Delta

## MODIFIED Requirements

### Requirement: Cabecalho de perfil gamificado
O sistema SHALL exibir o nivel atual do usuario, classe ativa com seu emblema ou asset visual, indicador de prontidao para troca de classe quando disponivel, barra de progresso de XP para o proximo nivel, barra de Energia (HP), saldo de pontos de expedicao, ofensiva global e distribuicao de niveis dos atributos.

#### Scenario: Atualizacao imediata do painel apos cumprir uma meta
- **WHEN** o usuario conclui uma meta do dia
- **THEN** o painel reflete imediatamente o novo saldo de XP, pontos de expedicao, o incremento no atributo correspondente e a porcentagem de conclusao do dia

#### Scenario: Exibicao visual da classe e status de prontidao
- **WHEN** o usuario visualiza o topo da tela de perfil
- **THEN** o sistema exibe o nome e icone/asset da classe atual e destaca o botao de evolucao caso novos requisitos tenham sido atingidos

## ADDED Requirements

### Requirement: Painel de expedicoes e monstros derrotados
O sistema SHALL disponibilizar no perfil ou na aba de superacao uma secao dedicada exibindo o resumo das batalhas em cavernas, monstros derrotados e cavernas concluidas.

#### Scenario: Visualizacao de estatisticas de combate
- **WHEN** o usuario visualiza a secao de conquistas de combate
- **THEN** o sistema exibe a contagem de monstros vencidos e o total de expedicoes bem-sucedidas
