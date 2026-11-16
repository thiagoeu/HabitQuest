# Proposal

## Why

O HabitQuest comprovou a eficacia do acompanhamento diario de habitos com gamificacao basica (XP, niveis e atributos), mas necessita de um objetivo de longo prazo e um laco de engajamento intrinseco que recompense o esforco real do usuario. Introduzir um sistema de progressao de classes RPG (Aprendiz evoluindo para Monge, Cavaleiro, Sabio, Arqueiro ou Exorcista) aliado a exploracao de cavernas e batalhas estrategicas contra monstros transforma cada tarefa cumprida na vida real em energia e preparacao para desafios epicos, elevando substancialmente a motivacao e a retencao do usuario.

## What Changes

- Introducao do sistema de classes RPG: o usuario inicia como Aprendiz e, ao atingir requisitos de nivel e atributos, escolhe sua especializacao entre Monge, Cavaleiro, Sabio, Arqueiro e Exorcista.
- Cada classe possui afinidades e bonus unicos em atributos especificos e na probabilidade de combate.
- Criacao de um conjunto inicial de assets visuais leves e iconografia para representar o Aprendiz, as 5 classes evoluidas e os monstros das cavernas.
- Sistema de expedicoes e cavernas (Dungeon Exploration): cada tarefa cumprida no dia gera pontos de expedicao (stamina/chaves de caverna) que liberam o acesso a andares de cavernas e monstros tematicos.
- Algoritmo de calculo de combate probabilistico: calcula a chance percentual de vitoria considerando o nivel do jogador, os atributos predominantes, a classe e a dificuldade do monstro, resolvendo o combate com feedback dinamico e recompensas (XP extra e ouro para a futura loja).
- Painel de visualizacao de classe no perfil com indicacao visual de prontidao para troca de classe, historico de monstros derrotados e cavernas concluidas.

## Capabilities

### New Capabilities
- `class-progression`: Define o ciclo de vida e a arvore de classes (Aprendiz, Monge, Cavaleiro, Sabio, Arqueiro, Exorcista), seus requisitos de nivel e atributos, troca de especializacao e aplicacao de bonus passivos de classe.
- `dungeon-combat`: Governa o sistema de cavernas e monstros, a conversao de habitos concluidos em pontos de expedicao, o algoritmo ponderado de probabilidade de vitoria e a resolucao de batalhas com recompensas.

### Modified Capabilities
- `gamification-engine`: Adiciona o vinculo da classe ao perfil do jogador, multiplica os ganhos de XP e atributos conforme as afinidades da classe ativa e gera pontos de expedicao ao concluir habitos.
- `progress-dashboard`: Atualiza o cabecalho de perfil com o emblema/asset da classe atual, indicador de prontidao para evolucao de classe e secao com estatisticas de cavernas e monstros derrotados.

## Impact

- Modelos de dados e tipos: extensao de `UserProfile` com `currentClass`, `unlockedClasses`, `expeditionPoints` e `dungeonHistory`.
- Novos servicos de dominio: `ClassProgressionService` e `DungeonCombatService`.
- Armazenamento local: novos esquemas de persistencia no AsyncStorage para estado de cavernas e historico de combate.
- Interface do usuario: nova tela ou aba dedicada para Cavernas/Batalhas (`/dungeon`), modal interativo de Evolucao de Classe e novos componentes visuais com assets tematicos.
- Dependencias: mantem compatibilidade total com React Native / Expo sem introduzir bibliotecas pesadas de jogos, utilizando animacoes fluidas e iconografia vetorial/SVG integrada.
