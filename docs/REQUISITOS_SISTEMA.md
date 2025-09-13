# Documento de Requisitos do Sistema de Ensino

## 1. Visão Geral

### 1.1 Descrição do Sistema
Sistema de gestão de ensino online que permite a criação e gerenciamento de trilhas de aprendizagem, turmas, encontros virtuais e acompanhamento do progresso dos estudantes. O sistema suporta três tipos de usuários: Administradores, Professores e Alunos.

### 1.2 Objetivos
- Facilitar a criação e gestão de conteúdos educacionais estruturados
- Permitir o acompanhamento detalhado do progresso dos alunos
- Promover interação entre estudantes através de funcionalidades de comunidade
- Oferecer ferramentas de análise e relatórios para educadores
- Suportar encontros virtuais síncronos e assíncronos

### 1.3 Tecnologias Utilizadas
- **Frontend**: React 18.3.1 com TypeScript
- **UI Framework**: Tailwind CSS com Shadcn/UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Roteamento**: React Router DOM 6.30.1
- **Estado Global**: Zustand 5.0.8
- **Formulários**: React Hook Form 7.61.1 com Zod validation
- **Gráficos**: Recharts 2.15.4
- **Build Tool**: Vite

## 2. Requisitos Funcionais

### 2.1 Gerenciamento de Usuários (RF-001 a RF-010)

**RF-001** - O sistema deve permitir autenticação de usuários via email e senha
**RF-002** - O sistema deve suportar três tipos de usuários: Admin, Professor e Aluno
**RF-003** - Administradores devem poder criar, editar e excluir usuários
**RF-004** - Usuários devem poder visualizar e editar seus perfis
**RF-005** - O sistema deve permitir upload de avatar para usuários
**RF-006** - O sistema deve enviar emails de convite para novos usuários
**RF-007** - O sistema deve permitir redefinição de senhas
**RF-008** - O sistema deve manter histórico de atividades dos usuários
**RF-009** - O sistema deve permitir busca e filtros de usuários
**RF-010** - O sistema deve exibir estatísticas de usuários por função

### 2.2 Gerenciamento de Trilhas (RF-011 a RF-020)

**RF-011** - Administradores devem poder criar trilhas de aprendizagem
**RF-012** - Trilhas devem conter múltiplos módulos organizados sequencialmente
**RF-013** - Módulos devem conter conteúdos de diferentes tipos (vídeo, PDF, quiz, live)
**RF-014** - O sistema deve permitir definir pré-requisitos entre conteúdos
**RF-015** - Trilhas devem ter configurações de certificação (trail, module, both)
**RF-016** - O sistema deve permitir bloqueio/desbloqueio de trilhas e módulos
**RF-017** - Conteúdos devem ter ordem definida e controle de progressão
**RF-018** - O sistema deve suportar vídeos do YouTube
**RF-019** - O sistema deve permitir upload de arquivos PDF
**RF-020** - Trilhas devem ter níveis de dificuldade (Iniciante, Intermediário, Avançado)

### 2.3 Sistema de Quiz (RF-021 a RF-025)

**RF-021** - O sistema deve permitir criação de quizzes com múltiplos tipos de questão
**RF-022** - Tipos de questão suportados: múltipla escolha, escolha única, verdadeiro/falso, numérica, texto
**RF-023** - Quizzes devem ter configurações de tempo limite e nota de aprovação
**RF-024** - O sistema deve permitir tentativas múltiplas configuráveis
**RF-025** - O sistema deve exibir explicações das respostas corretas

### 2.4 Gerenciamento de Turmas (RF-026 a RF-030)

**RF-026** - Administradores devem poder criar e gerenciar turmas
**RF-027** - Turmas devem permitir múltiplos professores e trilhas
**RF-028** - O sistema deve permitir matrícula de alunos em turmas
**RF-029** - Turmas devem ter status (ativa, completada, pausada)
**RF-030** - O sistema deve manter histórico de matriculas e progresso

### 2.5 Encontros Virtuais (RF-031 a RF-035)

**RF-031** - Professores devem poder agendar encontros virtuais
**RF-032** - Encontros devem ter data, hora, duração e descrição
**RF-033** - O sistema deve gerar links de acesso aos encontros
**RF-034** - O sistema deve registrar presença automática dos participantes
**RF-035** - Encontros devem ter status (agendado, ao vivo, completado, cancelado)

### 2.6 Acompanhamento de Progresso (RF-036 a RF-040)

**RF-036** - O sistema deve rastrear progresso individual de cada aluno
**RF-037** - Progresso deve ser calculado por conteúdo, módulo e trilha
**RF-038** - O sistema deve registrar tempo gasto em cada conteúdo
**RF-039** - O sistema deve gerar relatórios de progresso detalhados
**RF-040** - Professores devem visualizar progresso de suas turmas

### 2.7 Sistema de Gamificação (RF-041 a RF-045)

**RF-041** - O sistema deve implementar sistema de pontos por atividades
**RF-042** - Usuários devem poder ganhar badges por conquistas
**RF-043** - O sistema deve exibir rankings de pontuação
**RF-044** - Certificados devem ser gerados automaticamente
**RF-045** - Certificados devem ter QR codes para validação

### 2.8 Comunidade e Interação (RF-046 a RF-050)

**RF-046** - Alunos devem poder criar posts em comunidades de turma
**RF-047** - Sistema deve permitir respostas e threads de discussão
**RF-048** - Posts devem ter sistema de likes
**RF-049** - Moderação de conteúdo deve estar disponível
**RF-050** - Notificações devem ser enviadas para novas interações

### 2.9 Dashboard e Relatórios (RF-051)

**RF-051** - Dashboards personalizados por tipo de usuário com métricas relevantes

## 3. Requisitos Não Funcionais

### 3.1 Performance (RNF-001 a RNF-005)
- **RNF-001**: Tempo de carregamento de páginas inferior a 3 segundos
- **RNF-002**: Suporte a pelo menos 1000 usuários simultâneos
- **RNF-003**: Vídeos devem carregar em menos de 5 segundos
- **RNF-004**: Aplicação deve ser otimizada para dispositivos móveis
- **RNF-005**: Implementação de lazy loading para conteúdos pesados

### 3.2 Segurança (RNF-006 a RNF-010)
- **RNF-006**: Autenticação JWT com refresh tokens
- **RNF-007**: Criptografia de dados sensíveis
- **RNF-008**: Row Level Security (RLS) no banco de dados
- **RNF-009**: Validação de dados no frontend e backend
- **RNF-010**: Logs de auditoria para ações administrativas

### 3.3 Usabilidade (RNF-011 a RNF-015)
- **RNF-011**: Interface responsiva para desktop, tablet e mobile
- **RNF-012**: Suporte a modo escuro/claro
- **RNF-013**: Navegação intuitiva com no máximo 3 cliques
- **RNF-014**: Feedback visual para todas as ações do usuário
- **RNF-015**: Acessibilidade conforme WCAG 2.1 nível AA

### 3.4 Confiabilidade (RNF-016 a RNF-020)
- **RNF-016**: Disponibilidade de 99.9%
- **RNF-017**: Backup automático diário dos dados
- **RNF-018**: Recovery point objective (RPO) de 24 horas
- **RNF-019**: Recovery time objective (RTO) de 4 horas
- **RNF-020**: Monitoramento proativo de erros

## 4. Arquitetura do Sistema

### 4.1 Arquitetura Frontend
```
src/
├── components/          # Componentes reutilizáveis
│   ├── admin/          # Componentes específicos do admin
│   ├── aluno/          # Componentes específicos do aluno
│   ├── professor/      # Componentes específicos do professor
│   ├── auth/           # Componentes de autenticação
│   ├── layout/         # Componentes de layout
│   └── ui/             # Componentes UI base (shadcn)
├── pages/              # Páginas da aplicação
├── hooks/              # Custom hooks
├── store/              # Estado global (Zustand)
├── types/              # Definições TypeScript
├── utils/              # Funções utilitárias
└── integrations/       # Integrações externas
```

### 4.2 Banco de Dados (Supabase)
- **Tabelas Principais**: users, profiles, trails, modules, content, classes, enrollments, meetings, quizzes
- **Autenticação**: Supabase Auth com RLS
- **Storage**: Arquivos PDF, imagens e vídeos
- **Edge Functions**: Lógica de negócio customizada

### 4.3 Fluxo de Dados
1. Frontend React consome API Supabase
2. Estado global gerenciado por Zustand
3. Validação com React Hook Form + Zod
4. Persistência automática via Supabase client

## 5. Casos de Uso Principais

### 5.1 Administrador
1. **Gerenciar Usuários**: Criar, editar, visualizar usuários
2. **Gerenciar Trilhas**: Criar trilhas com módulos e conteúdos
3. **Gerenciar Turmas**: Criar turmas e matricular alunos
4. **Visualizar Relatórios**: Acompanhar métricas gerais do sistema

### 5.2 Professor
1. **Agendar Encontros**: Criar reuniões virtuais para turmas
2. **Acompanhar Progresso**: Visualizar progresso dos alunos
3. **Gerenciar Conteúdo**: Adicionar e editar conteúdos das trilhas
4. **Interagir com Alunos**: Responder dúvidas na comunidade

### 5.3 Aluno
1. **Consumir Conteúdo**: Assistir vídeos, ler PDFs, fazer quizzes
2. **Participar de Encontros**: Entrar em reuniões virtuais
3. **Interagir na Comunidade**: Fazer posts e comentários
4. **Acompanhar Progresso**: Visualizar seu progresso individual

## 6. Integrações

### 6.1 APIs Externas
- **YouTube API**: Para reprodução de vídeos
- **Supabase APIs**: Database, Auth, Storage, Edge Functions

### 6.2 Serviços de Email
- **Edge Function**: Envio de emails de convite via Supabase

### 6.3 Storage
- **Supabase Storage**: Upload de PDFs, imagens e outros arquivos

## 7. Considerações de Implementação

### 7.1 Estado Global
- Zustand para gerenciamento de estado
- Store centralizado em `useAppStore`
- Dados sincronizados com Supabase

### 7.2 Componentes UI
- Shadcn/UI como base
- Tailwind CSS para estilização
- Design system consistente

### 7.3 Validação
- Zod schemas para validação de dados
- React Hook Form para formulários
- Validação tanto no frontend quanto backend

### 7.4 Roteamento
- React Router DOM com proteção de rotas
- Redirecionamento baseado em roles
- Rotas privadas e públicas

### 7.5 Performance
- Lazy loading de componentes
- Otimização de imagens
- Memoização de componentes pesados

## 8. Cronograma de Desenvolvimento

### Fase 1 - Core (4 semanas)
- Autenticação e autorização
- CRUD básico de usuários
- Estrutura básica de trilhas

### Fase 2 - Conteúdo (3 semanas)
- Player de vídeo
- Sistema de quizzes
- Upload de arquivos

### Fase 3 - Interação (3 semanas)
- Sistema de encontros
- Comunidade
- Notificações

### Fase 4 - Analytics (2 semanas)
- Dashboards
- Relatórios
- Métricas

### Fase 5 - Polimento (2 semanas)
- Testes
- Otimizações
- Deploy

## 9. Critérios de Aceitação

### 9.1 Funcionalidade
- Todos os requisitos funcionais implementados
- Fluxos principais testados e funcionando
- Integração completa entre módulos

### 9.2 Performance
- Tempos de resposta dentro dos limites estabelecidos
- Aplicação estável sob carga
- Interface responsiva em todos os dispositivos

### 9.3 Segurança
- Autenticação robusta implementada
- Dados protegidos adequadamente
- Vulnerabilidades conhecidas mitigadas

### 9.4 Usabilidade
- Interface intuitiva e fácil de usar
- Feedback adequado para o usuário
- Acessibilidade implementada

## 10. Glossário

- **Trilha**: Sequência estruturada de módulos de aprendizagem
- **Módulo**: Conjunto de conteúdos relacionados dentro de uma trilha
- **Conteúdo**: Unidade básica de aprendizagem (vídeo, PDF, quiz, etc.)
- **Turma**: Grupo de alunos matriculados em trilhas específicas
- **Encontro**: Sessão síncrona virtual entre professores e alunos
- **Quiz**: Avaliação interativa com questões de múltiplos tipos
- **RLS**: Row Level Security - segurança a nível de linha no banco
- **Edge Function**: Função serverless executada na borda da rede

---

**Versão**: 1.0  
**Data**: Dezembro 2024  
**Autor**: Sistema de Documentação Automática