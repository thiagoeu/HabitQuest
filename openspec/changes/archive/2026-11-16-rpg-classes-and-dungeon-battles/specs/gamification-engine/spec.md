# Spec Delta

## MODIFIED Requirements

### Requirement: Evolucao de atributos por categoria
O sistema SHALL incrementar os pontos e o nivel do atributo especifico (Intelecto, Forca/Saude ou Disciplina) vinculado a categoria do habito concluido, aplicando multiplicadores de afinidade caso a classe ativa do usuario possua especializacao no atributo correspondente.

#### Scenario: Evolucao de Intelecto ao concluir meta de estudo
- **WHEN** o usuario conclui um habito da categoria "Intelecto"
- **THEN** o sistema incrementa os pontos do atributo "Intelecto" sem alterar os pontos de "Forca/Saude"

#### Scenario: Aplicacao de multiplicador de afinidade por classe
- **WHEN** o usuario possui uma classe especializada (como Sabio para Intelecto) e conclui uma meta correspondente
- **THEN** o sistema aplica o multiplicador de ganho de atributo da classe no saldo concedido

## ADDED Requirements

### Requirement: Concessao de pontos de expedicao ao concluir habitos
O sistema SHALL conceder pontos de expedicao ao usuario a cada conclusao de habito, com volume determinado pela dificuldade da tarefa (Facil, Medio ou Dificil).

#### Scenario: Credito de pontos de expedicao
- **WHEN** o usuario marca como concluido um habito no dia
- **THEN** o sistema credita os pontos de expedicao ao perfil do usuario imediatamente
