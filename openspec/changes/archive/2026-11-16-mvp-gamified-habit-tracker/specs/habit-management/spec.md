# Spec Delta

## Purpose

Permite que o usuario cadastre, organize, edite e registre a conclusao diaria de seus habitos e metas pessoais vinculados a categorias de evolucao e dificuldades.

## ADDED Requirements

### Requirement: Criacao de habito personalizado
O sistema SHALL permitir que o usuario crie um novo habito informando titulo, categoria de atributo (Intelecto, Forca/Saude ou Disciplina), nivel de dificuldade (Facil, Medio ou Dificil), dias da semana programados e horario opcional de lembrete.

#### Scenario: Cadastro de habito com dados validos
- **WHEN** o usuario preenche o titulo "Estudar React Native", seleciona a categoria "Intelecto", dificuldade "Medio" e salva
- **THEN** o sistema persiste o habito localmente e o exibe na lista de metas dos dias correspondentes

#### Scenario: Tentativa de cadastro sem titulo
- **WHEN** o usuario tenta salvar um habito com o campo de titulo vazio
- **THEN** o sistema bloqueia a gravacao e informa que o titulo do habito e obrigatorio

### Requirement: Edicao e exclusao de habito
O sistema SHALL permitir que o usuario edite os dados de um habito existente ou o exclua/arquive da rotina ativa sem corromper o historico de XP ja conquistado pelo usuario.

#### Scenario: Alteracao de horario e dificuldade de um habito
- **WHEN** o usuario edita a dificuldade de um habito existente de "Facil" para "Dificil" e confirma
- **THEN** o sistema atualiza os dados do habito para os proximos check-ins mantendo os registros passados intactos

#### Scenario: Exclusao de habito da rotina
- **WHEN** o usuario confirma a exclusao de um habito cadastrado
- **THEN** o sistema remove o habito da lista de metas diarias ativas e cancela quaisquer lembretes vinculados a ele

### Requirement: Registro de conclusao diaria (Check-in)
O sistema SHALL permitir que o usuario marque um habito programado para o dia atual como concluido uma unica vez por dia, registrando a data e hora do cumprimento.

#### Scenario: Conclusao de meta pendente do dia
- **WHEN** o usuario marca um habito pendente na lista do dia como concluido
- **THEN** o sistema altera o estado do habito para concluido no dia atual e aciona o processamento de recompensas daquele habito

#### Scenario: Desfazer conclusao acidental no mesmo dia
- **WHEN** o usuario desmarca um habito que havia sido marcado como concluido no mesmo dia
- **THEN** o sistema reverte o estado do habito para pendente no dia atual e estorna os pontos correspondentes daquele check-in

### Requirement: Listagem de metas do dia
O sistema SHALL apresentar na tela principal os habitos programados para o dia da semana atual, separando visualmente as metas pendentes das metas ja concluidas no dia.

#### Scenario: Visualizacao das metas diarias ao abrir o aplicativo
- **WHEN** o usuario abre o aplicativo em uma segunda-feira
- **THEN** o sistema lista apenas os habitos configurados para segunda-feira (ou todos os dias), indicando quais estao pendentes e quais ja foram cumpridos hoje
