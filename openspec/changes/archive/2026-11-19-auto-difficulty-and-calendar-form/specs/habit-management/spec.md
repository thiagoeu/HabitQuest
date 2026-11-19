# Spec Delta

## MODIFIED Requirements

### Requirement: Criacao de habito personalizado
O sistema SHALL permitir que o usuario crie um novo habito informando titulo, categoria de atributo (Intelecto, Forca ou Disciplina), dias da semana programados, periodo de vigencia no calendario e horario opcional de despertador, com a dificuldade calculada e atribuida automaticamente pelo sistema.

#### Scenario: Cadastro de habito com dados validos
- **WHEN** o usuario preenche o titulo "Estudar React Native", seleciona a categoria "Intelecto" e salva
- **THEN** o sistema persiste o habito localmente com a dificuldade calculada automaticamente e o exibe na lista de metas dos dias correspondentes

#### Scenario: Cadastro de habito com periodo delimitado de calendario
- **WHEN** o usuario define uma meta com data de inicio "2026-11-20" e data de fim "2026-11-30"
- **THEN** o sistema persiste o intervalo e ativa a meta apenas dentro dessas datas nos dias da semana escolhidos

#### Scenario: Cadastro de habito sem definir horario
- **WHEN** o usuario cria uma meta deixando o horario de despertador desativado
- **THEN** o sistema salva o habito normalmente sem exigir informacao de horario

#### Scenario: Tentativa de cadastro sem titulo
- **WHEN** o usuario tenta salvar um habito com o campo de titulo vazio
- **THEN** o sistema bloqueia a gravacao e informa que o titulo do habito e obrigatorio

## ADDED Requirements

### Requirement: Inferencia automatica de dificuldade e ganho de XP
O sistema SHALL calcular automaticamente o nivel de dificuldade da meta e a respectiva recompensa de XP diario e bonus com base na extensao temporal do periodo de vigencia e no volume de dias programados para cumprimento.

#### Scenario: Cadastro de meta curta com dificuldade facil calculada
- **WHEN** o usuario cadastra uma meta com vigencia de 1 a 6 dias (curta/pontual)
- **THEN** o sistema calcula e salva a meta automaticamente com dificuldade "facil", atribuindo o XP diario base correspondente e menor recompensa de quest

#### Scenario: Cadastro de meta semanal ou quinzenal com dificuldade medio calculada
- **WHEN** o usuario cadastra uma meta com vigencia entre 7 e 27 dias
- **THEN** o sistema calcula e salva a meta automaticamente com dificuldade "medio", atribuindo o XP diario intermediario correspondente

#### Scenario: Cadastro de meta longa ou continua com dificuldade dificil calculada
- **WHEN** o usuario cadastra uma meta com vigencia de 28 dias ou mais (ou modo continuo de longo prazo)
- **THEN** o sistema calcula e salva a meta automaticamente com dificuldade "dificil", atribuindo o XP diario de alta recompensa e maiores bonus de conclusao

### Requirement: Mini calendario interativo e visibilidade de campos no formulario
O sistema SHALL exibir no formulario de criacao e edicao de metas um mini calendario visual sempre aberto por padrao para selecao direta por toque das datas de inicio e termino, mantendo todos os campos de configuracao, dias da semana, horarios de alarme e previa da dificuldade/XP visiveis simultaneamente sem secoes colapsadas.

#### Scenario: Selecao de datas de inicio e fim no mini calendario
- **WHEN** o usuario toca em um dia no mini calendario para definir o inicio e posteriormente em outro dia posterior para definir o fim
- **THEN** o sistema preenche as datas correspondentes no formulario e destaca visualmente o intervalo selecionado no mini calendario

#### Scenario: Atualizacao dinamica da dificuldade calculada ao alterar datas
- **WHEN** o usuario altera as datas no mini calendario ou adiciona/remove dias da semana
- **THEN** o sistema recalcula imediatamente a dificuldade resultante e atualiza a previa de recompensas em tempo real na tela

#### Scenario: Visibilidade permanente dos campos de horario e avisos
- **WHEN** o usuario visualiza a tela do formulario
- **THEN** os campos de horario do alarme e opcao de aviso previo de 10 minutos permanecem visiveis diretamente na interface, permitindo habilitar ou desabilitar o alarme sem esconder os controles
