# 🏮 Sakaland — Sistema Gamificado para Evento Corporativo

Sistema web completo para o evento corporativo **Sakaland**, da **Lubrax**. Participantes cumprem metas, acumulam a moeda oficial do evento — **Sakalekas** — e trocam por brindes em uma loja gamificada, com ranking, painel administrativo completo e notificações automáticas.

![Stack](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green) ![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38bdf8)

---

## ✨ Funcionalidades

### Participantes
- Dashboard com saldo de Sakalekas, metas ativas e histórico
- Ranking Top 10 com sistema de medalhas (ouro/prata/bronze)
- Loja de brindes com resgate em tempo real (bloqueio automático por saldo/estoque, selo "ESGOTADO")
- Perfil editável, troca de senha, histórico de atividades e resgates

### Administradores
- Dashboard com estatísticas gerais, gráfico de uso (7 dias) e atividade recente
- CRUD completo de usuários (criar, editar, excluir, bloquear/desbloquear, resetar senha, permissões)
- Gestão de Sakalekas: conceder, remover, distribuição em massa, histórico completo
- CRUD de metas + marcação de conclusão por participante (crédito automático)
- CRUD da loja de brindes (estoque, preço, categoria, destaque) + gestão de status dos resgates
- Relatórios exportáveis em **Excel (.xlsx)** e **PDF**
- Logs de auditoria de todas as ações administrativas
- Configurações gerais do evento (nome, datas, moeda, mensagens automáticas, features on/off)

### Notificações automáticas
Sempre que um participante resgata um brinde, o sistema:
1. Registra a compra e debita o saldo
2. Atualiza o estoque automaticamente
3. Envia e-mail para os administradores (via SMTP/Nodemailer)
4. Envia mensagem de WhatsApp para os administradores (via API da Twilio)
5. Cria uma notificação in-app para os administradores

> E-mail e WhatsApp são **opcionais**: se as variáveis de ambiente não forem configuradas, o sistema apenas registra um aviso no console e segue funcionando normalmente (a compra é processada normalmente).

---

## 🧱 Stack técnica

| Camada          | Tecnologia                                  |
|-----------------|----------------------------------------------|
| Front-end       | Next.js 14 (App Router) + TypeScript          |
| Estilo          | Tailwind CSS (tema customizado Lubrax)      |
| Banco de dados  | MongoDB + Mongoose                            |
| Autenticação    | JWT (cookies httpOnly) + bcrypt               |
| Server Actions  | Usadas na maior parte das mutações            |
| API REST        | Rotas dedicadas para sessão e exportação      |
| Gráficos        | Recharts                                      |
| Notificações    | Nodemailer (e-mail) + Twilio (WhatsApp)       |
| Exportação      | ExcelJS (.xlsx) e PDFKit (.pdf)               |
| Hospedagem      | Vercel                                        |

---

## 📁 Estrutura do projeto

```
sakaland/
├── app/
│   ├── (auth)/            # login, register, forgot/reset password
│   ├── (participant)/     # dashboard, ranking, store (área do participante)
│   ├── admin/             # painel administrativo completo
│   ├── api/                # rotas REST (sessão, exportação de relatórios)
│   ├── profile/            # perfil (compartilhado entre papéis)
│   ├── layout.tsx / globals.css
│   └── page.tsx            # redireciona conforme sessão
├── components/
│   ├── ui/                 # componentes de UI reutilizáveis
│   ├── layout/              # shell, sidebar, topbar, nav mobile
│   ├── admin/                # componentes específicos do painel admin
│   ├── store/                 # RewardCard (loja do participante)
│   └── profile/                # formulários de perfil
├── actions/                 # Server Actions (auth, users, goals, rewards...)
├── models/                  # Schemas Mongoose (User, Reward, Transaction...)
├── lib/                      # mongodb, auth (JWT), audit, utils, validation (zod)
├── services/                 # notificações (e-mail, WhatsApp, in-app)
├── scripts/seed.ts            # popula o banco com dados de teste
└── middleware.ts               # proteção de rotas + RBAC
```

---

## 🚀 Como rodar localmente

### 1. Pré-requisitos
- Node.js 18.17+
- Uma instância MongoDB (local, Docker, ou [MongoDB Atlas](https://www.mongodb.com/atlas) gratuito)

### 2. Instalar dependências
```bash
cd sakaland
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env.local
```
Edite `.env.local` e preencha, no mínimo:
- `MONGODB_URI` — string de conexão do MongoDB
- `JWT_SECRET` e `JWT_RESET_SECRET` — strings aleatórias longas (ex: `openssl rand -base64 32`)

As variáveis de SMTP e Twilio são **opcionais** — sem elas, o sistema funciona normalmente e apenas pula o envio de e-mail/WhatsApp.

### 4. Popular o banco com dados de teste
```bash
npm run seed
```
Isso cria:
- 1 administrador: `admin@sakaland.com` / `Admin@123`
- 7 participantes de exemplo: `participante1@sakaland.com` a `participante7@sakaland.com` / `Participante@123`
- Metas, brindes da loja e configurações gerais de exemplo

> **Nota:** o primeiro usuário criado via tela de cadastro (`/register`) também vira administrador automaticamente, caso a coleção de usuários esteja vazia e você prefira não rodar o seed.

### 5. Rodar em desenvolvimento
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000).

---

## ☁️ Deploy na Vercel

1. Suba o projeto para um repositório Git (GitHub/GitLab/Bitbucket).
2. Importe o repositório na [Vercel](https://vercel.com/new).
3. Configure as variáveis de ambiente do `.env.example` no painel do projeto (Settings → Environment Variables).
4. Use uma instância MongoDB acessível pela internet (ex: MongoDB Atlas — libere o IP `0.0.0.0/0` ou use Vercel's IP ranges).
5. Deploy. O build padrão (`next build`) já está configurado em `package.json`.
6. Após o primeiro deploy, rode `npm run seed` localmente apontando para o `MONGODB_URI` de produção (ou crie o primeiro usuário via `/register`, que vira admin automaticamente).

---

## 🔐 Segurança implementada

- Senhas com hash `bcrypt` (12 rounds)
- Sessão via JWT em cookie `httpOnly`, `secure` em produção, `sameSite=lax`
- Middleware de proteção de rotas com RBAC (admin vs. participante)
- Tokens de redefinição de senha com secret separado e expiração de 1h
- Nenhuma revelação de existência de e-mail no fluxo de "esqueci minha senha"
- Logs de auditoria para todas as ações administrativas sensíveis

---

## 🎨 Identidade visual

Paleta extraída da logo oficial da Lubrax: verde de marca (`#0E8A3E`, com o verde profundo `#004415` do logotipo como tom de destaque/hover) e preto sobre uma base quase-preta (`#080D0B`), com azul (`#2F80ED`) reservado para detalhes — saldo, preços, medalha de 1º lugar. Cores de perigo/exclusão usam vermelho semântico dedicado, independente da marca. Tipografia combina **Archivo** (títulos, geométrica e forte) com **IBM Plex Sans** (corpo de texto) e **IBM Plex Mono** para todo valor numérico. O logotipo é renderizado sobre uma placa clara para garantir contraste. O sistema opera somente em modo noturno — não há alternância de tema.

---

## 🛠️ O que pode ser estendido

Este projeto entrega um sistema **funcional e completo** conforme o escopo solicitado. Alguns pontos ficam prontos para configuração/expansão conforme a necessidade real do evento:

- **Upload de imagens**: atualmente brindes e avatares usam URLs de imagem diretas. Para upload de arquivos, integre um provedor como Cloudinary (variáveis já reservadas no `.env.example`).
- **WhatsApp**: usa a API da Twilio (sandbox gratuito para testes). Para produção, é necessário um número aprovado pela Meta/WhatsApp Business.
- **Paginação server-side**: as listagens administrativas (usuários, transações, logs) usam limites fixos; para bases muito grandes, adicione paginação com `skip`/`limit` nos endpoints correspondentes em `actions/`.
- **Testes automatizados**: não incluídos neste escopo — recomenda-se adicionar testes com Vitest/Playwright antes de um uso em produção crítica.

---

## 📄 Licença

Projeto desenvolvido sob demanda para o evento corporativo Sakaland (Lubrax). Uso interno.
