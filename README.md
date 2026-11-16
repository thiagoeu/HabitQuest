# HabitQuest

HabitQuest e um aplicativo mobile de rastreamento de habitos gamificado desenvolvido em **React Native** com **Expo** e **TypeScript**, voltado ao reforco de autoeficacia e consistencia no cumprimento de objetivos pessoais (como estudos, academia e rotinas).

---

## Principais Funcionalidades

- **Mecanicas de Gamificacao**:
  - Ganho de XP e subida de nivel global a cada meta concluida.
  - Atributos especificos por categoria: **Intelecto** (estudos), **Forca** (saude e academia) e **Disciplina** (rotina e foco).
  - Contagem de ofensivas diarias (*streaks*) por habito e sequencia global com recorde historico.
  - Sistema de Energia (*HP*) com modo *Segunda Chance* para retomada de foco sem bloqueios punitivos.
  - Galeria de medalhas e conquistas desbloqueaveis com base em marcos de consistencia e nivel.
- **Gerenciamento Flexivel de Metas**:
  - Periodo de vigencia no calendario: possibilidade de definir intervalo de datas (data inicial e data final) ou metas continuas.
  - Selecao personalizada de dias da semana.
  - Horario de despertador/alarme opcional.
  - Opcao de **aviso previo diario 10 minutos antes** do horario programado alem do alarme no horario exato com notificacoes locais de alta prioridade.
- **Painel de Superacao**:
  - Estatisticas consolidadas de metas vencidas e taxa de conclusao.
  - Mapa visual de consistencia dos ultimos 7 dias.
  - Historico detalhado de metas cumpridas e evolucao de atributos.
- **Offline-First**:
  - Armazenamento 100% local com **Zustand** e **AsyncStorage**, garantindo privacidade e funcionamento offline sem necessidade de servidores.

---

## Tecnologias Utilizadas

- **Framework**: React Native com Expo (SDK 58) e Expo Router
- **Linguagem**: TypeScript
- **Gerenciamento de Estado**: Zustand com persistencia via AsyncStorage
- **Notificacoes Locais**: Expo Notifications
- **Testes**: Jest (32 testes automatizados unitarios e de integracao)
- **Especificacao**: OpenSpec (Spec-Driven Development)

---

## Como Executar o Projeto

### Pre-requisitos
- Node.js (v18+) e npm instalados.
- Aplicativo **Expo Go** instalado no seu celular (Android ou iOS).

### Instalacao
```bash
# Clone o repositorio
git clone https://github.com/thiagoeu/HabitQuest.git
cd HabitQuest

# Instale as dependencias
npm install
```

### Execucao
```bash
# Iniciar o servidor de desenvolvimento Expo
npx expo start

# Executar na versao web
npx expo start --web
```

### Executar Testes
```bash
npm test
```
