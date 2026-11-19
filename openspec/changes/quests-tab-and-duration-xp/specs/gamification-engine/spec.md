# Spec Delta

## ADDED Requirements

### Requirement: Bonus fixo de XP por faixa de duracao e dificuldade
O sistema SHALL manter o XP diario por check-in e conceder um bonus fixo adicional para quests com prazo delimitado conforme a duracao em dias corridos inclusivos (Pontual 1-6d: 50 XP; Semanal 7-13d: 150 XP; Quinzenal 14-27d: 350 XP; Mensal 28-89d: 800 XP; Trimestral 90+d: 2200 XP), multiplicado pela dificuldade (Facil 1,0x; Medio 1,5x; Dificil 2,0x).

#### Scenario: Calculo do bonus fixo para quest semanal media
- **WHEN** uma quest de dificuldade "Medio" possui vigencia inclusiva de 7 dias
- **THEN** o sistema define o bonus fixo da quest em 225 XP (150 XP base multiplicados por 1,5), mantendo intacto o XP diario de cada check-in

#### Scenario: Calculo do bonus fixo para quest mensal dificil
- **WHEN** uma quest de dificuldade "Dificil" possui vigencia inclusiva de 30 dias
- **THEN** o sistema define o bonus fixo da quest em 1600 XP (800 XP base multiplicados por 2,0)

### Requirement: Criterio de liberacao e bonus de Quest Perfeita
O sistema SHALL liberar o bonus fixo de duracao quando o usuario cumprir pelo menos 80% dos dias programados no periodo (ou 100% em quests com ate 3 dias programados), concedendo +20% de bonus de Quest Perfeita ao atingir 100% em quests com 4 ou mais dias programados, e creditando o XP no perfil global e no atributo da quest com afinidade de classe.

#### Scenario: Liberacao imediata com bonus de Quest Perfeita ao fechar 100%
- **WHEN** o usuario conclui todos os 7 dias programados de uma quest semanal de dificuldade "Medio"
- **THEN** o sistema concede imediatamente 270 XP (225 XP com +20% de Quest Perfeita) e os pontos equivalentes no atributo da quest com afinidade de classe

#### Scenario: Liberacao ao encerrar o prazo com pelo menos 80% de aderencia
- **WHEN** a data final de uma quest de 10 dias programados e ultrapassada tendo o usuario concluido 8 dias (80%)
- **THEN** o sistema concede automaticamente o bonus fixo padrao da quest na avaliacao de virada do dia

#### Scenario: Nao concessao quando a aderencia fica abaixo da meta minima
- **WHEN** a data final de uma quest de 10 dias programados e ultrapassada tendo o usuario concluido apenas 7 dias (70%)
- **THEN** o sistema encerra o periodo da quest sem conceder o bonus fixo de duracao

### Requirement: Marcos ciclicos de XP para quests continuas
O sistema SHALL conceder bonus fixos progressivos para quests continuas (sem data final) sempre que o acumulado de check-ins concluidos naquela quest atingir os marcos de 7 (150 XP base), 30 (800 XP base), 90 (2200 XP base), 180 (4000 XP base) e 365 check-ins (8000 XP base), ajustados pelo multiplicador de dificuldade.

#### Scenario: Conquista de marco de 7 check-ins em quest continua
- **WHEN** o usuario registra o setimo check-in acumulado em uma quest continua de dificuldade "Medio"
- **THEN** o sistema concede o bonus do marco de 1 semana equivalente a 225 XP, alem do XP diario do check-in

### Requirement: Idempotencia e estorno de bonus de quest
O sistema SHALL garantir que cada bonus de conclusao de periodo ou marco de quest seja pago no maximo uma vez e SHALL estornar o XP global e os pontos de atributo caso o usuario desmarque no mesmo dia o check-in que disparou a concessao.

#### Scenario: Estorno de bonus ao desfazer check-in no mesmo dia
- **WHEN** o usuario conclui o setimo check-in de uma quest continua recebendo o bonus de 7 dias e desmarca esse mesmo check-in ainda no mesmo dia
- **THEN** o sistema remove o registro do bonus e estorna o XP global e os pontos de atributo concedidos por aquele marco

#### Scenario: Prevencao de pagamento duplicado do mesmo marco ou periodo
- **WHEN** um bonus de periodo ou marco ja foi concedido para uma quest
- **THEN** novas avaliacoes de check-in ou de virada de dia nao creditam o mesmo bonus novamente
