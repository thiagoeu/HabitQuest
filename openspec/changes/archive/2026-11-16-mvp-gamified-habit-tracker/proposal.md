# Proposal

## Why

Manter a consistencia em objetivos pessoais como estudar ou ir a academia e dificil quando ferramentas tradicionais funcionam apenas como listas frias de tarefas sem reforco positivo imediato. Este MVP resolve a falta de engajamento diario unindo rastreamento de habitos, despertadores motivacionais e mecanicas completas de gamificacao (XP, atributos, conquistas e historico visual de superacao) em um aplicativo React Native (Expo) 100% local, provando visualmente ao usuario que ele e capaz de cumprir suas metas.

## What Changes

- Inicializacao do aplicativo mobile em React Native utilizando Expo (Managed Workflow) com TypeScript e persistencia 100% local no dispositivo.
- Implementacao do gerenciamento de habitos e objetivos diarios categorizados (ex.: Estudos, Academia/Saude, Rotina/Foco), permitindo configurar frequencia, nivel de dificuldade e horarios de execucao.
- Implementacao do motor de gamificacao contendo:
  - Ganho de XP e subida de nivel global ao cumprir metas.
  - Evolucao de atributos especificos por categoria de habito (Intelecto para estudos, Forca/Vitalidade para academia e saude, Disciplina para foco e rotina).
  - Contagem de ofensivas (streaks) por habito e global.
  - Sistema de Energia/HP com penalidade leve ao falhar em metas obrigatorias do dia e mecanica de recuperacao para evitar desmotivacao.
  - Sistema de conquistas e medalhas desbloqueaveis por marcos de consistencia (ex.: primeira meta cumprida, 3, 7 e 30 dias seguidos).
- Implementacao de despertadores e lembretes motivacionais locais agendados por habito, exibindo frases de incentivo e acoes rapidas para iniciar ou concluir a meta diretamente.
- Implementacao de um painel e historico visual de superacao que evidencia taxas de conclusao, total de metas batidas e evolucao pessoal ao longo do tempo.

## Capabilities

### New Capabilities
- `habit-management`: Cadastro, edicao, exclusao, categorizacao por atributo e registro diario de conclusao (check-in) de habitos e metas pessoais.
- `gamification-engine`: Calculo e persistencia de XP, niveis, atributos por categoria, ofensivas (streaks), pontos de vida/energia (HP) com penalidade/recuperacao e desbloqueio de medalhas de consistencia.
- `motivational-alarms`: Agendamento, cancelamento e disparo de notificacoes/despertadores locais com mensagens motivacionais contextualizadas e acoes rapidas de compromisso/check-in.
- `progress-dashboard`: Visualizacao consolidada do perfil gamificado, estatisticas de superacao, linha do tempo de metas cumpridas e galeria de conquistas para reforco de autoeficacia.

### Modified Capabilities
<!-- Nenhuma capacidade existente foi modificada (projeto greenfield). -->

## Impact

- **Codigo e Arquitetura**: Criacao da estrutura base do projeto React Native (Expo Router ou React Navigation), camada de banco de dados/armazenamento local (`expo-sqlite` ou `AsyncStorage`/`zustand`), servico de notificacoes (`expo-notifications`) e componentes visuais da interface.
- **Dependencias**: Adicao do ecossistema Expo (`expo`, `react-native`, `expo-notifications`, armazenamento local, biblioteca de icones e animacoes leves).
- **Sistemas Externos**: Nenhum servico externo ou backend em nuvem sera necessario neste MVP; toda a operacao e offline-first no dispositivo do usuario.
