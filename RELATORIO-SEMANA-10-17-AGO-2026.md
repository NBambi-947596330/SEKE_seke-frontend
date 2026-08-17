# Relatório semanal — SEKE Frontend

**Período:** 10 a 17 de Agosto de 2026  
**Repositório:** `SEKE_seke-frontend`  
**Âmbito:** implementação no `appseke/` (Next.js)

---

## Resumo

Nesta semana o frontend avançou sobretudo na **publicação de conteúdo**, na **home autenticada**, no **perfil**, na **pesquisa por hashtag** e no **controlo do tipo de conta** (cliente vs profissional). Foram **11 commits** no Git, mais trabalho local de **gosto de posts** ainda por commitar.

| Dia | Commits | Foco |
|-----|---------|------|
| 13 Ago | 5 | Posts de profissionais (texto, imagens, vídeos, edição, capa/foto) |
| 14 Ago | 3 | Card de perfil na home, posts do utilizador, detalhe do post |
| 17 Ago | 3 | Responsividade, seleção de perfil, pesquisa por hashtag e partilha |

---

## 1. Publicações de profissionais

### Criação de posts
- Fluxo de postagem do profissional no feed.
- Texto com **hashtags destacadas** no conteúdo (`#tag`).
- Conteúdo longo expansível nos cartões.
- Galeria de **imagens** no create e na visualização.

### Vídeos
- Galeria de vídeos nas publicações (formato tipo reels).
- Feed global de vídeos (`VideoFeedGalleryProvider`).
- Ajustes no create de post para enviar média de vídeo.

### Edição e actualização
- `PUT /posts/:id` via proxy (`/api/posts/:id`).
- Modal de edição com texto e média (ficheiros novos ou URLs existentes).
- Actualização de capa e foto de perfil (proxy de avatar).

**Rotas / ficheiros-chave**
- `app/api/posts/route.ts`
- `app/api/posts/[id]/route.ts`
- `components/itempostcriar/`
- `components/post-edit-modal/`
- `components/post-video-gallery/`
- `components/post-media-gallery/`

---

## 2. Home e perfil

### Card de perfil na home
- Cartão com foto e nome do utilizador autenticado, a abrir `/perfil`.
- Posicionado antes de “Preciso de um Profissional”.
- Painel lateral móvel da home passa a incluir o mesmo cartão.

### Publicações do próprio perfil
- Proxy `GET /api/posts/user/:id`.
- Cartão **Publicações** no perfil (visível para profissionais).
- Lista das publicações do utilizador e navegação para o detalhe.

### Página de detalhe do post (`/posts/[id]`)
- Shell com sidebar (perfil, agendamentos, propostas, idiomas).
- Em mobile a sidebar fica acima do post.
- Ajustes de responsividade no visualizador.

---

## 3. Responsividade e layout

- Alinhamento das margens da home, perfil, agendamentos, agenda e propostas com a navbar (`AppShell`).
- Home em desktop: colunas laterais `sticky`, sem scrollbar extra nos painéis de perfil, agendamentos, propostas, disponibilidade, profissionais recomendados e solicitações.
- Filtros da home em mobile: clientes/profissionais mostram **ícone + contagem** (nomes a partir de `md`).
- Métricas de propostas em grelha 2×2 no mobile.
- Capa/avatar do perfil mais compactos em mobile.
- Breakpoints da página de perfil, agendamentos e marketplace.

---

## 4. Tipo de conta (cliente / profissional)

Nova secção em **Configurações → Preferências**: **Perfil em uso**.

- Select com os papéis reais da API (`roles`: `client`, `professional`).
- A escolha altera menus, home e propostas.
- Preferência gravada em `sessionStorage` e `localStorage`, recuperada no login.
- Se a conta só tiver um perfil, o select fica desactivado.

**Ficheiros**
- `components/settings/account-role-settings.tsx`
- `lib/account-role.ts`
- `lib/use-account-role.ts`

---

## 5. Partilha de publicações

Menu **Partilhar** nos posts (feed, detalhe e galeria de vídeo).

- Abre um **modal** (não um dropdown) com plataformas:
  LinkedIn, Facebook, WhatsApp, X (Twitter), Telegram, copiar link.
- Registo na API:

```
POST /posts/:id/share
{
  "id": "<uuid do post>",
  "platform": "Linkdin"
}
```

- `z-index` alto no modal e no menu do navbar (Sair / Terminar sessão), para não ficar por baixo de outros elementos.

**Ficheiros**
- `app/api/posts/[id]/share/route.ts`
- `components/post-share-menu/post-share-menu.tsx`

---

## 6. Pesquisa por hashtag

A barra da navbar deixa de ir para `/conexoes` e passa a pesquisar posts.

- URL da API: `GET /posts/search/hashtag/{hashtag}?page=1&limit=20`  
  Ex.: [programar](https://api-seke-v1.onrender.com/api/posts/search/hashtag/programar?limit=20&page=1)
- Página `/pesquisa?hashtag=...` com lista de resultados.
- Hashtags no texto do post são clicáveis e abrem a mesma pesquisa.
- Cartão **Total encontrado** (`pagination.total`) no **lado esquerdo**, alinhado com a lista de resultados (layout tipo home).

**Ficheiros**
- `app/api/posts/search/hashtag/[hashtag]/route.ts`
- `app/pesquisa/page.tsx`
- `lib/feed-client.ts` (`searchPostsByHashtag`)

---

## 7. Trabalho ainda não commitado (17 Ago)

Gosto de publicações passou a usar a rota de interacções:

```
POST /interactions/posts/:postId/like
{
  "postId": "<uuid>"
}
```

- Proxy: `app/api/interactions/posts/[postId]/like/route.ts`
- Cliente: `lib/likes-client.ts` (`likePost`)
- Feed, detalhe do post e galeria de vídeo já usam este fluxo.

---

## Commits da semana

| Data | Commit | Mensagem |
|------|--------|----------|
| 13 Ago | `bdf2824` | Implementação de postagem dos profissionais |
| 13 Ago | `4046a40` | Posts com imagens |
| 13 Ago | `2862699` | Posts com vídeos |
| 13 Ago | `c8b6921` | PUT para actualizar posts |
| 13 Ago | `f83d5df` | Capa e foto de perfil |
| 14 Ago | `8f20a22` | Card de perfil na home |
| 14 Ago | `aac3414` | Visualização dos posts do utilizador |
| 14 Ago | `606bb03` | Responsividade do visualizador de post |
| 17 Ago | `7e9311b` | Breakpoints em dispositivos móveis |
| 17 Ago | `df55a3b` | Escolha de perfil (cliente/profissional) |
| 17 Ago | `1b19787` | Busca por hashtag (+ partilha de posts) |

---

## Como validar rapidamente

1. **Postar** texto, imagens e vídeo como profissional; editar a publicação.
2. **Home autenticada:** cartão de perfil, laterais sem scrollbar extra, filtros em mobile.
3. **Perfil:** cartão Publicações (profissional) e abrir um post.
4. **Configurações → Preferências:** alternar Cliente / Profissional.
5. **Partilhar** um post pelo modal e confirmar o pedido a `/posts/:id/share`.
6. **Pesquisar** `#programar` na navbar e ver o total no cartão esquerdo.
7. **Gostar** de um post autenticado e confirmar `POST /interactions/posts/:postId/like`.
