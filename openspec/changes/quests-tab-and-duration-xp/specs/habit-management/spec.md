# Spec Delta

## ADDED Requirements

### Requirement: Pre-visualizacao de recompensa por duracao e atalhos inclusivos no formulario
O sistema SHALL disponibilizar atalhos rapidos de vigencia de 7, 14, 30 e 90 dias no formulario de metas calculando intervalos inclusivos exatos de dias corridos, e SHALL exibir em tempo real uma pre-visualizacao do XP diario e do bonus fixo de duracao ou marcos continuos conforme a dificuldade e o periodo selecionados.

#### Scenario: Aplicacao do atalho de 7 dias no formulario
- **WHEN** o usuario aciona o atalho rapido de "7 dias" no formulario de cadastro de meta em "2026-11-19"
- **THEN** o sistema preenche a data inicial como "2026-11-19" e a data final como "2026-11-25" (7 dias inclusivos) e exibe a pre-visualizacao correspondente a faixa semanal

#### Scenario: Atualizacao da pre-visualizacao ao alterar dificuldade ou vigencia
- **WHEN** o usuario altera a dificuldade da meta ou alterna entre periodo delimitado e meta continua no formulario
- **THEN** o sistema atualiza imediatamente os valores exibidos de XP diario, bonus fixo, bonus de Quest Perfeita ou lista de marcos continuos

### Requirement: Feedback visual de bonus de quest ao realizar check-in diario
O sistema SHALL destacar no feedback visual da tela "Hoje" quando a conclusao de uma meta diaria tambem liberar o bonus fixo de encerramento da quest ou um marco de quest continua.

#### Scenario: Exibicao de conquista de bonus no banner de feedback
- **WHEN** o usuario conclui uma meta na aba "Hoje" e esse check-in libera o bonus fixo da quest ou um marco continuo
- **THEN** o banner de feedback informa a conclusao da meta junto com a recompensa adicional de XP da quest conquistada
