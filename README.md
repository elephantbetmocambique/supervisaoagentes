# Sistema de Supervisão de Agentes

Sistema web de gestão e auditoria de agentes de vendas em campo.

## Tecnologias
- **Frontend**: HTML5, CSS3, JavaScript puro (sem frameworks)
- **Base de Dados**: Supabase (PostgreSQL + Auth + Storage)
- **Hospedagem**: GitHub Pages (ficheiros estáticos)
- **Fontes**: Inter + Roboto (Google Fonts)

---

## Estrutura de Ficheiros

```
agentes-supervisao/
├── index.html                    ← Página de login
├── css/
│   └── style.css                 ← Estilos globais
├── js/
│   ├── config.js                 ← Credenciais Supabase ← EDITAR
│   ├── auth.js                   ← Módulo de autenticação
│   ├── ui.js                     ← Utilitários UI
│   └── layout.js                 ← Barra lateral / nav
├── pages/
│   ├── dashboard.html            ← Admin: painel geral
│   ├── agentes.html              ← Lista de agentes
│   ├── agente-detalhe.html       ← Perfil + histórico agente
│   ├── auditorias.html           ← Lista + nova auditoria
│   ├── auditoria-detalhe.html    ← Detalhe auditoria
│   ├── supervisores.html         ← Gestão supervisores (admin)
│   ├── fotos.html                ← Galeria de fotos
│   └── relatorios.html           ← Relatórios e gráficos
└── supabase-schema.sql           ← Schema SQL completo
```

---

## Configuração Supabase

### 1. Criar projeto Supabase
1. Aceda a [supabase.com](https://supabase.com) e crie um projeto
2. Anote o **Project URL** e a **anon public key**

### 2. Executar o Schema SQL
1. No painel Supabase → SQL Editor
2. Cole o conteúdo de `supabase-schema.sql` e execute

### 3. Configurar Storage
1. Supabase → Storage → New Bucket
2. Nome: `fotos`, Tipo: **Public**

### 4. Configurar as credenciais
Edite `js/config.js`:
```javascript
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY';
```

### 5. Criar o primeiro Administrador
1. Supabase → Authentication → Add User
2. Email + password do admin
3. No SQL Editor:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@seuemail.com';
```

---

## Publicar no GitHub Pages

```bash
# 1. Criar repositório GitHub (público)
git init
git add .
git commit -m "Sistema Supervisão Agentes v1.0"
git remote add origin https://github.com/SEU_USER/supervisao-agentes.git
git push -u origin main

# 2. Ativar GitHub Pages
# Settings → Pages → Source: Deploy from branch → main → / (root)
```

URL final: `https://SEU_USER.github.io/supervisao-agentes/`

---

## Níveis de Acesso

| Funcionalidade | Admin | Supervisor |
|---|---|---|
| Dashboard geral | ✓ | — |
| Ver todos agentes | ✓ | Só os seus |
| Criar/editar agentes | ✓ | — |
| Criar supervisores | ✓ | — |
| Realizar auditorias | ✓ | ✓ |
| Ver todas auditorias | ✓ | Só as suas |
| Aprovar auditorias | ✓ | — |
| Galeria de fotos | Todas | Só as suas |
| Relatórios | ✓ | — |
| Exportar CSV | ✓ | — |

---

## Tabelas Supabase

| Tabela | Descrição |
|---|---|
| `profiles` | Utilizadores (admins + supervisores) |
| `agentes` | Agentes de vendas |
| `auditorias` | Visitas com checklist + fotos |

---

## Criar Supervisores

Como a criação de utilizadores requer a **service role key** (que não deve estar no frontend), recomenda-se:

**Opção A — Supabase Dashboard**:
1. Authentication → Add User → email + password
2. SQL: `UPDATE profiles SET role='supervisor', full_name='Nome' WHERE email='...';`

**Opção B — Supabase Edge Function** (produção):
Criar uma edge function com a service role para criar utilizadores com segurança.

---

## Suporte

Sistema desenvolvido por **Social Connect MZ** para gestão de agentes em campo.
Cores de marca: `#1f3c90` (azul) · `#e82e81` (rosa)
