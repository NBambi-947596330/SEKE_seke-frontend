# Tarefas concluídas — SEKE Frontend
**Sprint:** 10 a 17 de Agosto de 2026  
**Lista Trello:** Concluído  
**Etiqueta:** Frontend

Copiar cada bloco abaixo para um cartão. O **Título** vai no nome do cartão; o resto vai na descrição.

---

## Lista rápida (criar cartões)

1. Publicação de posts de profissionais (texto e hashtags)
2. Posts com galeria de imagens
3. Posts com vídeos (galeria tipo reels)
4. Edição de publicações (PUT)
5. Upload de capa e foto de perfil
6. Card de perfil na home autenticada
7. Visualização das publicações no perfil do utilizador
8. Página de detalhe do post com sidebar
9. Responsividade mobile (home, perfil, agendamentos, propostas)
10. Seleção de perfil em uso (cliente / profissional)
11. Partilha de publicações nas redes sociais
12. Pesquisa de posts por hashtag
13. Gosto de publicações via interações

---

## Cartão 1

**Título:** `[FEITO] Publicação de posts de profissionais (texto e hashtags)`

```
Status: Concluído
Área: Feed / Profissional

O profissional consegue criar publicações de texto no feed.

O que foi feito:
- Fluxo de criação de post no feed
- Hashtags destacadas no conteúdo (#tag)
- Texto longo expansível nos cartões

Como validar:
- Login como profissional
- Criar um post com texto e #hashtag
- Confirmar que aparece no feed com a hashtag destacada
```

---

## Cartão 2

**Título:** `[FEITO] Posts com galeria de imagens`

```
Status: Concluído
Área: Feed / Média

Publicações passam a aceitar e mostrar imagens.

O que foi feito:
- Upload de imagens no create de post
- Galeria de imagens na visualização do post

Como validar:
- Criar um post com uma ou várias imagens
- Confirmar que a galeria abre e mostra as fotos
```

---

## Cartão 3

**Título:** `[FEITO] Posts com vídeos (galeria tipo reels)`

```
Status: Concluído
Área: Feed / Vídeo

Publicações passam a aceitar vídeos, com galeria tipo reels.

O que foi feito:
- Create de post com média de vídeo
- Galeria de vídeos nas publicações
- Feed global de vídeos

Como validar:
- Criar um post com vídeo
- Abrir a galeria e reproduzir o vídeo no feed
```

---

## Cartão 4

**Título:** `[FEITO] Edição de publicações (PUT /posts/:id)`

```
Status: Concluído
Área: Feed / CRUD

O profissional consegue editar uma publicação já criada.

O que foi feito:
- Proxy PUT /api/posts/:id
- Modal de edição (texto + média nova ou URLs existentes)

Como validar:
- Abrir editar num post próprio
- Alterar texto e/ou média
- Guardar e confirmar a actualização no feed
```

---

## Cartão 5

**Título:** `[FEITO] Upload de capa e foto de perfil`

```
Status: Concluído
Área: Perfil

Actualização de capa e foto de perfil no cadastro/perfil.

O que foi feito:
- Upload de capa
- Upload de foto de perfil (proxy de avatar)

Como validar:
- Ir ao perfil
- Alterar capa e foto
- Recarregar e confirmar que as imagens ficam gravadas
```

---

## Cartão 6

**Título:** `[FEITO] Card de perfil na home autenticada`

```
Status: Concluído
Área: Home

Na home autenticada aparece o cartão do utilizador logado.

O que foi feito:
- Cartão com foto e nome
- Clique abre /perfil
- Posicionado antes de “Preciso de um Profissional”
- Incluído também no painel lateral móvel

Como validar:
- Login e abrir a home
- Ver o cartão com o próprio nome/foto
- Clicar e ir para o perfil
```

---

## Cartão 7

**Título:** `[FEITO] Visualização das publicações no perfil do utilizador`

```
Status: Concluído
Área: Perfil / Posts

O profissional vê as suas publicações no perfil e abre cada uma.

O que foi feito:
- Proxy GET /api/posts/user/:id
- Cartão “Publicações” no perfil (profissional)
- Lista de posts do utilizador
- Navegação para o detalhe de cada post

Como validar:
- Abrir perfil de profissional com posts
- Ver o cartão Publicações
- Abrir um post da lista
```

---

## Cartão 8

**Título:** `[FEITO] Página de detalhe do post com sidebar`

```
Status: Concluído
Área: Posts / Layout

Página /posts/[id] com o post e a sidebar (perfil, agendamentos, propostas).

O que foi feito:
- Shell do detalhe do post
- Sidebar alinhada com o resto da app
- Em mobile a sidebar fica acima do post

Como validar:
- Abrir um post a partir do perfil ou do feed
- Desktop: sidebar ao lado
- Mobile: sidebar acima do conteúdo
```

---

## Cartão 9

**Título:** `[FEITO] Responsividade mobile (home, perfil, agendamentos, propostas)`

```
Status: Concluído
Área: UI / Mobile

Ajustes de breakpoints e margens para ficar alinhado com a navbar.

O que foi feito:
- Margens alinhadas (home, perfil, agendamentos, agenda, propostas)
- Laterais da home sticky, sem scrollbar extra
- Filtros da home em mobile: ícone + contagem
- Métricas de propostas em grelha 2x2 no mobile
- Capa/avatar do perfil mais compactos no telemóvel

Como validar:
- Abrir home, perfil, agendamentos e propostas no telemóvel
- Confirmar alinhamento com a navbar e ausência de scroll extra nas laterais
```

---

## Cartão 10

**Título:** `[FEITO] Seleção de perfil em uso (cliente / profissional)`

```
Status: Concluído
Área: Configurações / Conta

O utilizador escolhe se está a usar a conta como cliente ou profissional.

O que foi feito:
- Nova secção em Configurações → Preferências: “Perfil em uso”
- Select com os papéis da API (client / professional)
- A escolha altera menus, home e propostas
- Preferência gravada e recuperada no login
- Se só existir um perfil, o select fica desactivado

Como validar:
- Conta com os dois papéis: alternar Cliente / Profissional
- Confirmar que a home e os menus mudam
- Sair e entrar de novo: o perfil escolhido mantém-se
```

---

## Cartão 11

**Título:** `[FEITO] Partilha de publicações nas redes sociais`

```
Status: Concluído
Área: Feed / Partilha

O utilizador partilha um post e o backend regista a partilha.

O que foi feito:
- Modal Partilhar (LinkedIn, Facebook, WhatsApp, X, Telegram, copiar link)
- POST /posts/:id/share com { id, platform }
- Integrado no feed, no detalhe do post e na galeria de vídeo
- Z-index corrigido para o modal e o menu Sair não ficarem por baixo

Como validar:
- Clicar em Partilhar num post
- Escolher uma plataforma
- Confirmar o pedido POST /posts/:id/share
```

---

## Cartão 12

**Título:** `[FEITO] Pesquisa de posts por hashtag`

```
Status: Concluído
Área: Pesquisa / Navbar

A barra de pesquisa da navbar pesquisa posts por hashtag.

O que foi feito:
- Navbar pesquisa e abre /pesquisa?hashtag=...
- GET /posts/search/hashtag/{hashtag}?page=1&limit=20
- Lista de resultados na página de pesquisa
- Hashtags no texto do post são clicáveis
- Cartão “Total encontrado” no lado esquerdo, alinhado com os resultados

Como validar:
- Pesquisar #programar na navbar
- Ver resultados e o total no cartão esquerdo
- Clicar numa hashtag dentro de um post e cair na mesma pesquisa
```

---

## Cartão 13

**Título:** `[FEITO] Gosto de publicações via interações`

```
Status: Concluído
Área: Feed / Interações

O gosto do post passou a usar a rota de interações.

O que foi feito:
- POST /interactions/posts/:postId/like com { postId }
- Proxy no frontend
- Integrado no feed, no detalhe do post e na galeria de vídeo

Como validar:
- Login
- Gostar de um post
- Confirmar o pedido POST /interactions/posts/:postId/like
```
