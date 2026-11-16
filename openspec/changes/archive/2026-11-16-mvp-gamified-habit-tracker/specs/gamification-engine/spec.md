# Spec Delta

## Purpose

Governa as regras de progressao gamificada do usuario, incluindo calculo de XP, niveis, atributos por categoria, ofensivas (streaks), pontos de energia (HP) e desbloqueio de conquistas.

## ADDED Requirements

### Requirement: Ganho de XP e progressao de nivel global
O sistema SHALL conceder pontos de experiencia (XP) ao usuario sempre que um habito for concluido, variando conforme a dificuldade do habito (Facil, Medio ou Dificil), e incrementar o nivel global quando o limiar de XP do nivel atual for atingido.

#### Scenario: Conclusao de habito gera XP proporcional a dificuldade
- **WHEN** o usuario conclui um habito classificado como "Dificil"
- **THEN** o sistema adiciona uma quantidade de XP superior a de um habito "Facil" ou "Medio" ao saldo do usuario

#### Scenario: Subida de nivel ao atingir meta de XP
- **WHEN** o XP acumulado pelo usuario alcanca ou ultrapassa o valor necessario para o proximo nivel
- **THEN** o sistema incrementa o nivel do usuario em 1, mantem o XP excedente para o novo nivel e exibe um feedback de subida de nivel

### Requirement: Evolucao de atributos por categoria
O sistema SHALL incrementar os pontos e o nivel do atributo especifico (Intelecto, Forca/Saude ou Disciplina) vinculado a categoria do habito concluido.

#### Scenario: Evolucao de Intelecto ao concluir meta de estudo
- **WHEN** o usuario conclui um habito da categoria "Intelecto"
- **THEN** o sistema incrementa os pontos do atributo "Intelecto" sem alterar os pontos de "Forca/Saude"

### Requirement: Contagem de ofensivas (Streaks)
O sistema SHALL contabilizar a sequencia de dias consecutivos em que cada habito programado foi cumprido, bem como a ofensiva global de dias ativos do usuario, registrando tambem o recorde historico de ofensiva.

#### Scenario: Incremento de ofensiva em dias programados seguidos
- **WHEN** o usuario cumpre um habito no dia programado imediatamente apos ter cumprido na ocorrencia programada anterior
- **THEN** o sistema incrementa a ofensiva daquele habito em 1 e atualiza o recorde caso o valor atual supere o maior valor ja registrado

#### Scenario: Quebra de ofensiva por ausencia de conclusao
- **WHEN** um dia programado para um habito encerra sem registro de conclusao
- **THEN** o sistema reinicia a ofensiva atual daquele habito para zero preservando o recorde historico anterior

### Requirement: Sistema de Energia (HP) com penalidade e recuperacao
O sistema SHALL manter uma barra de Energia (HP) do usuario (maximo de 100 pontos), aplicando uma perda leve de HP ao virar o dia com metas programadas nao cumpridas e permitindo recuperar HP ao cumprir metas nos dias seguintes.

#### Scenario: Perda de HP por metas nao cumpridas no dia anterior
- **WHEN** o usuario inicia um novo dia tendo deixado habitos programados sem concluir no dia anterior
- **THEN** o sistema reduz o HP atual proporcionalmente as falhas e exibe uma mensagem de encorajamento focada em retomada

#### Scenario: Recuperacao e protecao contra bloqueio punitivo
- **WHEN** o HP do usuario chega a zero apos falhas consecutivas
- **THEN** o sistema ativa um estado de "Segunda Chance" que restaura parte do HP ao concluir a primeira meta do dia, sem apagar niveis, conquistas ou atributos ja alcancados

### Requirement: Desbloqueio de medalhas e conquistas de consistencia
O sistema SHALL avaliar marcos de progresso (primeira meta concluida, ofensivas de 3, 7 e 30 dias, total de metas cumpridas e niveis de atributo) e desbloquear medalhas correspondentes de forma permanente.

#### Scenario: Desbloqueio de conquista de 7 dias de ofensiva
- **WHEN** o usuario atinge 7 dias consecutivos de ofensiva
- **THEN** o sistema marca a conquista de 7 dias como desbloqueada com a data da conquista e notifica o usuario na interface
