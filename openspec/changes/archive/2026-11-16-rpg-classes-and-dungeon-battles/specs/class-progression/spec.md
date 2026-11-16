# Spec Delta

## Purpose

Governa o ciclo de vida e a progressao de classes de RPG do usuario, gerenciando a transicao de Aprendiz para classes avancadas, pre-requisitos de desbloqueio e bonus passivos.

## ADDED Requirements

### Requirement: Inicializacao como Aprendiz e arvore de classes
O sistema SHALL atribuir a classe "Aprendiz" como classe inicial padrao para todo perfil de usuario e disponibilizar as especializacoes "Monge", "Cavaleiro", "Sabio", "Arqueiro" e "Exorcista" na arvore de evolucao.

#### Scenario: Novo usuario inicia como Aprendiz
- **WHEN** o perfil do usuario e criado ou carregado sem classe definida
- **THEN** o sistema define a classe ativa como "Aprendiz" com todas as estatisticas base neutras

#### Scenario: Visualizacao de classes disponiveis na arvore
- **WHEN** o usuario acessa a tela de evolucao de classe
- **THEN** o sistema lista as cinco classes avancadas com seus respectivos requisitos de nivel, atributos e bonus passivos

### Requirement: Pre-requisitos e selecao de evolucao de classe
O sistema SHALL permitir que o usuario escolha e evolua para uma classe avancada assim que atingir o nivel global minimo estipulado (nivel 5) e os requisitos especificos de atributos da classe escolhida.

#### Scenario: Usuario atinge o nivel minimo e escolhe uma classe valida
- **WHEN** o usuario atinge o nivel 5 de conta e seleciona uma classe cujos pre-requisitos de atributos foram satisfeitos
- **THEN** o sistema promove o usuario para a nova classe, atualiza o perfil e desbloqueia permanentemente a classe na lista de classes adquiridas

#### Scenario: Tentativa de evolucao sem satisfazer os pre-requisitos
- **WHEN** o usuario tenta selecionar uma classe avancada sem ter o nivel ou atributos necessarios
- **THEN** o sistema mantem o usuario na classe atual e exibe os requisitos pendentes para a evolucao

### Requirement: Aplicacao de afinidades e bonus passivos de classe
O sistema SHALL aplicar os multiplicadores e vantagens passivas da classe ativa sobre o ganho de atributos especificos e sobre as taxas de combate do usuario.

#### Scenario: Bonus passivo de classe em ganho de atributo
- **WHEN** um usuario com a classe "Cavaleiro" conclui um habito associado ao atributo Forca
- **THEN** o sistema concede um bonus percentual adicional de ganho no atributo Forca devido a afinidade passiva da classe

### Requirement: Flexibilidade de alternancia entre classes desbloqueadas
O sistema SHALL permitir que o usuario alterne a qualquer momento entre as classes que ja foram desbloqueadas em seu perfil sem penalidades de XP ou reducao de nivel.

#### Scenario: Troca entre classes previamente conquistadas
- **WHEN** um usuario que ja desbloqueou "Monge" e "Sabio" decide alternar sua classe ativa de "Monge" para "Sabio"
- **THEN** o sistema atualiza a classe ativa para "Sabio", ativa os bonus correspondentes e preserva integralmente o nivel e atributos acumulados
