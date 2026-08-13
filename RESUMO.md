# SEKE — Resumo do Projeto

## Visão geral

**SEKE** (*Seke - Plataforma de Conexões e Oportunidades*) é o frontend de uma plataforma digital angolana que liga **clientes** a **profissionais de serviços**. O objetivo é facilitar a descoberta de profissionais, a publicação de solicitações de serviço, o envio de propostas, agendamentos, mensagens e gestão de perfil — num único ecossistema web.

O repositório contém a aplicação principal em `appseke/`, construída com **Next.js 16** (App Router) e **React 19**.

---

## Stack tecnológica

| Área | Tecnologia |
|------|------------|
| Framework | Next.js 16.1.6 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Componentes | Radix UI, shadcn/ui |
| Ícones | Lucide React |
| Autenticação | NextAuth.js + login por credenciais / Google |
| Linguagem | TypeScript |
| Notificações UI | Sonner |
| Fontes | Inter + Montserrat (fallback do design system) |

---

## Arquitetura

```
SEKE_seke-frontend/
├── appseke/                 # Aplicação Next.js
│   ├── app/                 # Rotas (pages + API routes)
│   ├── components/          # Componentes de UI e funcionalidades
│   ├── lib/                 # Clientes API, helpers, hooks
│   ├── types/               # Tipos TypeScript
│   ├── style/               # Tema e tokens visuais
│   ├── hooks/               # Hooks reutilizáveis
│   └── public/              # Assets estáticos
└── RESUMO.md                # Este documento
```

### Padrão de comunicação com backend

A app funciona como **BFF (Backend for Frontend)**:

- O browser chama rotas internas em `/api/*`
- Essas rotas fazem proxy para a API externa (`NEXT_PUBLIC_URL_API`)
- Autenticação usa token JWT guardado em `sessionStorage`

API externa de referência: `https://api-seke-v1.onrender.com/api`

---

## Tipos de utilizador

A plataforma distingue dois perfis principais:

| Perfil | Descrição |
|--------|-----------|
| **Cliente** | Publica solicitações de serviço, recebe propostas, gere pedidos |
| **Profissional** | Publica posts, envia propostas, gere serviços, agenda e disponibilidade |

O tipo de conta é resolvido em runtime via `profile_type` / `role` no perfil do utilizador.

---

## Funcionalidades principais

### Feed e descoberta
- Feed global com publicações de profissionais e solicitações de clientes
- Filtros: **Todos**, **Clientes**, **Profissionais**
- Explorar conteúdo (painel lateral)
- Pesquisa na plataforma (redireciona para `/conexoes`)
- Navbar responsiva (pesquisa abaixo da barra em mobile)

### Marketplace e serviços
- Categorias de profissionais (`/categoria-profissional`)
- Listagem e perfil de profissionais
- Criação e gestão de serviços do profissional
- Solicitações de serviço (service requests)
- Propostas: enviar, editar, aceitar e rejeitar
- Agendamentos e reservas (bookings)

### Social
- Posts com media (galeria, likes, comentários)
- Seguir / deixar de seguir utilizadores
- Notificações na navbar (contador e lista)

### Comunicação
- Chat entre utilizadores (`/chat`, `/profissional/mensagens`)
- Contacto direto a partir de solicitações no feed

### Perfil e configurações
- Perfil público e edição de dados
- Avatar, localização (províncias de Angola)
- Configurações: privacidade, notificações, segurança, visibilidade, preferências

### Autenticação
- Registo com escolha de tipo de conta (cliente / profissional)
- Login por credenciais
- Login com Google (NextAuth)
- Recuperação de password
- Verificação por OTP / telefone
- Refresh token

---

## Rotas da aplicação

### Públicas / gerais
| Rota | Descrição |
|------|-----------|
| `/` | Página inicial (feed) |
| `/categoria-profissional` | Explorar categorias |
| `/categoria-profissional/[id]` | Profissionais por categoria |
| `/posts/[id]` | Detalhe de publicação |
| `/perfil` | Perfil do utilizador |
| `/detalhesuser` | Detalhes de utilizador |
| `/termos-de-uso` | Termos de uso |
| `/politica-de-privacidade` | Política de privacidade |

### Cliente
| Rota | Descrição |
|------|-----------|
| `/solicitacoes` | Solicitações do cliente |
| `/meus-pedidos` | Pedidos do cliente |
| `/clientes/meus-pedidos` | Variante de pedidos |
| `/agendamentos` | Agendamentos |
| `/chat` | Mensagens |

### Profissional
| Rota | Descrição |
|------|-----------|
| `/profissional` | Dashboard profissional |
| `/profissional/mensagens` | Mensagens |
| `/profissional/agenda` | Agenda |
| `/propostas` | Propostas enviadas/recebidas |

### Autenticação
| Rota | Descrição |
|------|-----------|
| `/auth/login` | Login |
| `/auth/register` | Registo |
| `/auth/register/tipo-conta` | Escolha cliente/profissional |
| `/auth/forgotpassword` | Recuperar password |
| `/auth/sendotpcode` | Código OTP |
| `/auth/sendphone` | Verificação telefone |
| `/optionregister` | Fluxo alternativo de registo |

### Configurações
| Rota | Descrição |
|------|-----------|
| `/configuracoes` | Hub de configurações |
| `/configuracoes/privacidade` | Privacidade |
| `/configuracoes/notificacoes` | Notificações |
| `/configuracoes/acesso-seguranca` | Segurança |
| `/configuracoes/visibilidade` | Visibilidade |
| `/configuracoes/preferencias` | Preferências |
| `/configuracoes/ajuda` | Ajuda |

---

## API interna (proxy)

Principais grupos de endpoints em `app/api/`:

- **Auth:** login, registo, logout, refresh, perfil, forgot-password
- **Feed:** global, explore
- **Posts:** CRUD, likes
- **Users:** perfil, followers, following, posts
- **Follow:** seguir utilizadores
- **Marketplace:** categorias, serviços, propostas, service-requests, bookings
- **Professionals:** listagem, perfil, disponibilidade, verificação
- **Notifications:** listar, marcar como lidas, contador unread
- **Upload:** envio de ficheiros/media

---

## Estrutura de componentes (principais)

| Pasta | Função |
|-------|--------|
| `itemnavbar/` | Navbar global, menu utilizador |
| `home/` | Sidebar, métricas, disponibilidade, skeletons do feed |
| `itempostprofissional/` | Card de post de profissional |
| `itempostclients/` | Card de solicitação de cliente |
| `itemsolicitacaocriar/` | Criar solicitação |
| `itempostcriar/` | Criar publicação |
| `itempropostaenviar/` | Enviar proposta |
| `itempropostasgerir/` | Gerir propostas recebidas |
| `itemChatPage/` | Interface de chat |
| `itemcardprofissionallistcategoria/` | Lista e perfil de profissionais |
| `settings/` | Páginas de configurações |
| `ui/` | Componentes base (Button, Input, Dialog, etc.) |
| `layout/` | App shell (padding, container) |

---

## Variáveis de ambiente

| Variável | Uso |
|----------|-----|
| `NEXT_PUBLIC_URL_API` | URL base da API externa |
| `NEXTAUTH_SECRET` | Segredo NextAuth |
| `GOOGLE_CLIENT_ID` | OAuth Google |
| `GOOGLE_CLIENT_SECRET` | OAuth Google |
| `NEXT_PUBLIC_UPLOAD_API` | API de upload (opcional) |
| `API_USERS_BY_ID_PREFIX` | Prefixo de rotas de utilizadores |
| `API_PROFILES_ME_PATH` | Caminho do perfil autenticado |

---

## Design system

- Tema definido em `appseke/style/light.ts`
- Cor primária: `#0064e0`
- Documentação de design em `appseke/DESIGN.md` (tokens Meta-inspired)
- Layout responsivo com breakpoints Tailwind (`sm`, `md`, `lg`)
- Navbar fixa no topo; conteúdo com offset via `AppShell`

---

## Como executar

```bash
cd appseke
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

### Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |

---

## Estado atual

- Projeto em fase **alpha / foundation**
- Frontend funcional com integração à API externa
- Fluxos principais implementados: auth, feed, marketplace, propostas, chat, perfil
- README raiz ainda minimalista; documentação de design parcialmente definida

---

## Resumo executivo

O **SEKE Frontend** é uma SPA/SSR moderna que serve como interface da plataforma angolana de serviços profissionais. Combina elementos de rede social (feed, posts, follows, likes) com marketplace (solicitações, propostas, agendamentos), orientada a dois públicos — clientes e profissionais — com experiência responsiva e autenticação completa.
