# Proposal

## Why

Atualmente, o formulario de criacao e edicao de metas exige que o usuario selecione manualmente a dificuldade (Facil, Medio, Dificil), o que gera inconsistencias na gamificacao: usuarios podem atribuir dificuldade alta para tarefas triviais de 1 ou 2 dias, ou dificuldade baixa para jornadas longas e desafiadoras de varios meses. Alem disso, campos cruciais do formulario (como periodo de calendario e configuracoes de despertador) ficam ocultos sob switches e secoes colapsaveis, dificultando a compreensao visual do compromisso e exigindo digitacao manual em campos de texto no formato de data.

Esta mudanca automatiza o calculo da dificuldade com base na extensao temporal do periodo de vigencia e no volume de dias programados para cumprimento, tornando a gamificacao mais justa (metas menores geram menor dificuldade e menos XP; metas maiores geram maior dificuldade e mais XP). Adicionalmente, o formulario passa a exibir todos os campos abertos por padrao, integrando um mini calendario interativo para selecao direta das datas de inicio e fim sem partes colapsadas.

## What Changes

- Remocao da selecao manual de dificuldade (`difficulty`) pelo usuario no formulario de metas.
- Calculo e inferencia automatica da dificuldade (`facil`, `medio` ou `dificil`) com base na duracao do periodo de vigencia e na contagem de dias programados da meta (metas curtas/pontuais recebem dificuldade facil e menos XP; metas semanais/quinzenais recebem medio; metas mensais e de longa duracao recebem dificil e mais XP).
- Exibicao dinamica e transparente da dificuldade calculada e da respectiva projecao de XP diario e bonus na previa de recompensas da quest.
- Abertura permanente da secao de vigencia e do mini calendario no formulario: a area de selecao de datas vem sempre aberta e visivel por padrao.
- Introducao de um componente de mini calendario interativo com navegacao de meses e selecao por toque da data de inicio e da data de fim, com realce visual do intervalo selecionado.
- Visibilidade total dos campos do formulario: eliminacao de colapsamentos que ocultavam configuracoes como horario de alarme, aviso previo de 10 minutos e atalhos de periodo, mantendo todos os controles acessiveis diretamente na rolagem.

## Capabilities

### New Capabilities

*(Nenhuma nova capacidade necessaria; a mudanca aprimora o gerenciamento de metas ja existente).*

### Modified Capabilities

- `habit-management`: Atualizacao dos requisitos de criacao e edicao de metas para determinar a dificuldade automaticamente via periodo/volume de dias programados no calendario e para exigir interface com campos integralmente visiveis e mini calendario interativo.

## Impact

- `src/app/habit-form.tsx`: Substituicao do seletor manual de dificuldade por indicador computado; remocao de switches que ocultavam containers; adicao de mini calendario interativo integrado ao estado de datas de inicio e fim.
- `src/domain/questProgressService.ts`: Funcao formal de derivacao automatica de dificuldade a partir de datas de vigencia e frequencia de dias programados.
- `src/types/index.ts`: Compatibilidade com o tipo `Difficulty` e `Habit` preservada integralmente.
- Testes unitarios: Criacao e atualizacao de testes cobrindo a inferencia de dificuldade e a integridade do formulario.
