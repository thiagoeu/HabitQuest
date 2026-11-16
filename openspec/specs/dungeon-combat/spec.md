# dungeon-combat Specification

## Purpose
Governa o sistema de expedicoes e cavernas, incluindo monstros por patamar de dificuldade, algoritmo probabilistico de vitoria e recompensas de combate geradas a partir do cumprimento de habitos no mundo real.

## Requirements

### Requirement: Geracao e consumo de pontos de expedicao
O sistema SHALL conceder pontos de expedicao (energia de caverna) a cada habito diario cumprido e exigir o consumo desses pontos para realizar expedicoes ou iniciar batalhas em cavernas.

#### Scenario: Ganho de pontos de expedicao ao cumprir tarefas
- **WHEN** o usuario conclui um habito programado na rotina diaria
- **THEN** o sistema adiciona pontos de expedicao ao saldo do usuario com base na dificuldade da tarefa

#### Scenario: Tentativa de entrar em combate sem pontos suficientes
- **WHEN** o usuario tenta iniciar uma expedicao sem possuir a quantidade minima de pontos de expedicao requerida
- **THEN** o sistema impede o combate e informa que o usuario precisa concluir mais habitos para obter energia de expedicao

### Requirement: Catalogo de cavernas e monstros por dificuldade
O sistema SHALL disponibilizar cavernas tematicas contendo monstros escalonados por patamares de dificuldade (Facil, Medio, Dificil e Chefe) e nivel recomendado.

#### Scenario: Visualizacao de monstros na caverna
- **WHEN** o usuario seleciona uma caverna disponivel
- **THEN** o sistema exibe os monstros disponiveis com seus respectivos nomes, nivel recomendado, dificuldade e recompensa estimada

### Requirement: Algoritmo de calculo de combate probabilistico
O sistema SHALL calcular a chance percentual de vitoria (0% a 100%) antes e durante a batalha, combinando o nivel do jogador, os valores dos atributos pertinentes, os modificadores de classe e os atributos defensivos do monstro.

#### Scenario: Chance de vitoria superior com atributos compativeis
- **WHEN** o usuario enfrenta um monstro com nivel inferior ou atributos compativeis com as forças da sua classe ativa
- **THEN** o sistema calcula uma probabilidade de vitoria proporcionalmente mais alta e a exibe com clareza para o usuario

#### Scenario: Enfrentando monstros de alta dificuldade
- **WHEN** o usuario tenta combater um monstro de dificuldade superior ao seu patamar atual
- **THEN** o sistema indica uma probabilidade de vitoria reduzida e alerta que o aprimoramento de habitos aumentara o sucesso

### Requirement: Resolucao de combate e concessao de recompensas
O sistema SHALL executar a resolucao do confronto de forma transparente, entregando recompensas de XP e moedas de ouro em caso de vitoria, consumindo os pontos de expedicao sem aplicar perdas de atributos em caso de derrota.

#### Scenario: Vitoria contra o monstro
- **WHEN** a rolagem probabilistica de combate resulta em vitoria para o usuario
- **THEN** o sistema concede XP bônus, moedas de ouro, marca o monstro como derrotado e atualiza as estatisticas do perfil

#### Scenario: Derrota em combate
- **WHEN** a rolagem probabilistica resulta em derrota
- **THEN** o sistema deduz os pontos de expedicao investidos, mantem intactos o nivel e os atributos do jogador e exibe dicas motivacionais para os proximos habitos

### Requirement: Registro historico de batalhas e monstros derrotados
O sistema SHALL armazenar um registro historico das expedicoes realizadas, computando vitorias totais, derrotas e o catalogo de especies de monstros ja derrotadas.

#### Scenario: Consulta ao historico de expedicoes
- **WHEN** o usuario abre a guia de expedicoes e consulta seu historico
- **THEN** o sistema exibe o total de batalhas ganhas e a lista com os monstros ja vencidos
