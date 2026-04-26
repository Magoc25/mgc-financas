# 💰 MGC Finanças

> **Dashboard financeiro pessoal completo, gratuito e open-source — sem instalação, sem servidor obrigatório.**

Desenvolvido por **Marlon Gomes da Costa (MGC Dev)**

> ⚠️ **Este é um projeto pessoal**, desenvolvido de forma independente pelo autor. Não representa, não é financiado e não tem vínculo institucional com o IFMA ou qualquer outra organização. O autor é professor do IFMA Campus São Raimundo das Mangabeiras, mas o MGC Finanças é uma iniciativa exclusivamente pessoal.

[![Versão](https://img.shields.io/badge/versão-4.0.0-blue)](#changelog)
[![Licença](https://img.shields.io/badge/licença-uso%20pessoal%20livre-green)](#licença)
[![PWA](https://img.shields.io/badge/PWA-instalável-brightgreen)](#instalar-como-app-no-celular)

---

## ✨ O que é

O MGC Finanças é um **arquivo HTML único** que roda direto no navegador — Chrome, Edge, Firefox ou Safari. Não precisa instalar nada, não precisa de servidor e funciona offline. Seus dados ficam no próprio computador.

Quando quiser sincronizar entre computadores ou acessar pelo celular, basta configurar o Supabase (gratuito) e opcionalmente o GitHub Pages.

---

## 🚀 Funcionalidades

### Entradas e Saídas
- Registro de **receitas** e **despesas** com categoria, cartão e mês de referência
- **Filtro por mês** com navegação rápida
- **Modo compacto** para visualização reduzida

### Dívidas e Parcelamentos
- Cadastro de dívidas com valor, credor e status
- Controle de **faturas** com vencimento e situação (paga / em aberto)

### Categorias & Cartões
- Categorias personalizadas com ícone e cor
- Cartões de crédito/débito com nome e bandeira
- Gerenciamento em modal dedicado com abas

### Orçamentos
- Definição de limite mensal por categoria
- Indicador visual de consumo do orçamento

### Gráficos e Análise
- Gráfico de **pizza** — distribuição de despesas por categoria
- Gráfico de **barras** — comparativo mensal de receitas vs despesas
- Gráfico de **linha** — evolução do saldo ao longo dos meses
- Modo claro e escuro nos gráficos

### Segurança e Histórico
- **PIN de acesso** — proteja o dashboard com senha de 4 dígitos
- **Histórico de alterações** — registro das últimas 150 ações (adição, edição, remoção, duplicação)
- Validação visual nos formulários com destaque de campos obrigatórios

### Dados e Backup
- **Exportar backup JSON** — salva todos os dados localmente
- **Importar backup JSON** — restaura com validação de integridade
- **Validação de backup** — verifica estrutura antes de importar

### Interface
- Modo escuro e claro com toggle
- Modo compacto para telas menores
- Tabelas com **ordenação por coluna** (↑↓) e indicadores visuais
- **Duplicar registro** com um clique em qualquer tabela
- Toast de notificações para ações do usuário

### Mobile (PWA)
- **Bottom Navigation Bar** — abas fixas na base (Início, Gráficos, Dados)
- **FAB flutuante (＋)** — novo lançamento com um toque, sempre visível
- **Bottom sheets** — formulário de entrada e menu de mais opções deslizantes
- **Instalável** como app no Android, iOS e desktop
- **Banner de instalação** automático no primeiro acesso
- Funciona offline após instalação

### Sincronização em Nuvem
- **Supabase** — sincronização automática entre dispositivos via nuvem

---

## 📦 Como usar — 3 cenários

### Cenário 1 — Uso local simples _(sem nuvem)_

**Ideal para:** usuário de um único computador que não precisa de acesso remoto.

```
┌─────────────────────────────┐
│  Seu computador             │
│  ┌───────────────────────┐  │
│  │   mgc-financas.html   │  │
│  │    + localStorage     │  │
│  └───────────────────────┘  │
│   Dados ficam no navegador  │
└─────────────────────────────┘
```

**Passos:**
1. Baixe `mgc-financas.html`, `sw.js`, `manifest.json`, `icon-192.png` e `icon-512.png` para a mesma pasta
2. Abra o `mgc-financas.html` no Chrome ou Edge
3. Pronto — use normalmente

**Backup:** clique em 💾 Exportar Backup regularmente e guarde o arquivo.

---

### Cenário 2 — Dois computadores com sincronização _(Supabase, sem GitHub)_

**Ideal para:** quem usa o dashboard em 2 ou mais PCs e quer dados sempre atualizados.

```
┌──────────────┐    ☁️ Supabase    ┌──────────────┐
│   PC Casa    │ ◄──────────────► │  PC Trabalho │
│  .html local │    (privado)     │  .html local │
└──────────────┘                  └──────────────┘
```

**Passos:**
1. Crie conta no Supabase (gratuito) — veja [Configurar Supabase](#configurar-supabase)
2. Copie os arquivos para cada computador (pendrive, e-mail, etc.)
3. Em cada PC, clique em ☁️ → configure as chaves → Salvar e sincronizar
4. Os dados sincronizam automaticamente entre os PCs

---

### Cenário 3 — Acesso de qualquer lugar pela URL _(Supabase + GitHub Pages)_

**Ideal para:** quem quer abrir o dashboard pelo celular, tablet ou qualquer computador sem precisar do arquivo.

```
             ☁️ Supabase (dados)
                    ▲
                    │
 🌐 GitHub Pages ───┤
 https://magoc25.github.io/mgc-financas/
                    │
      ┌─────────────┼─────────────┐
   💻 PC         📱 Celular    💻 Mac
```

**Passos:**
1. Configure o Supabase (Cenário 2)
2. Ative o GitHub Pages — veja [Configurar GitHub Pages](#configurar-github-pages)
3. Acesse pela URL em qualquer dispositivo
4. Em cada dispositivo, configure as chaves Supabase uma única vez

> ⚠️ **Nota sobre repositório público:** o arquivo HTML não contém seus dados nem suas chaves. As chaves ficam salvas no `localStorage` do navegador. Um repositório público expõe apenas o código — seus lançamentos e credenciais são privados.

---

## 🪜 Evolua no seu ritmo

### Nível 1 — Só o arquivo no navegador _(zero configuração)_

**Como começar:** baixe os arquivos e abra `mgc-financas.html` no Chrome ou Edge. É só isso.

| ✅ O que você tem | ❌ O que ainda não tem |
|---|---|
| Dashboard completo com todos os recursos | Acesso pelo celular ou outros computadores |
| Gráficos e análise financeira | Sincronização automática entre dispositivos |
| PIN de segurança e histórico | Instalação como app (requer HTTPS) |
| Backup local (exportar/importar JSON) | — |

**Quando avançar para o Nível 2?** Quando quiser acessar o dashboard pelo celular ou em outro computador.

---

### Nível 2 — Supabase + GitHub Pages _(app no celular, sync automático)_

**O que muda:** seus dados vão para a nuvem (Supabase) e o dashboard fica acessível por uma URL pública do GitHub Pages — de qualquer dispositivo, a qualquer hora.

> 🔒 **Sua agenda financeira não fica visível para ninguém.** A URL pública abre o dashboard vazio para qualquer pessoa que acessar. Seus lançamentos e configurações ficam no `localStorage` do seu navegador e nas suas chaves privadas do Supabase.

| ✅ O que você ganha |
|---|
| URL permanente acessível de qualquer lugar |
| Sync automático entre todos os dispositivos |
| App instalável no celular (Android e iOS) e no desktop |
| Atualizações automáticas ao atualizar o arquivo no GitHub |

#### Instalar como app no celular

Após configurar o GitHub Pages e acessar a URL pelo celular:

**Android (Chrome):**
1. Abra a URL no Chrome
2. O banner de instalação aparece automaticamente após alguns segundos
3. Toque em **Instalar** — ou use Menu (⋮) → **Adicionar à tela inicial**

**iPhone / iPad (Safari):**
1. Abra a URL no Safari *(não funciona no Chrome no iOS)*
2. Toque no botão **Compartilhar** (ícone de seta para cima)
3. Role para baixo → **Adicionar à tela de início**
4. Confirme — o app aparece na tela inicial

**Desktop (Chrome / Edge):**
1. Abra a URL no Chrome ou Edge
2. Aguarde 2–3 segundos — ícone de instalação aparece na barra de endereço
3. Clique no ícone e confirme a instalação

**macOS (Safari — Ventura 13+ ou Sonoma):**
1. Abra a URL no Safari
2. Menu **Arquivo** → **Adicionar ao Dock**

> 💡 Após instalar, o app abre em tela cheia, sem barra de endereços, como um aplicativo nativo.

---

## 🔧 Guias de Configuração

### Configurar Supabase

#### 1. Criar conta e projeto
1. Acesse [supabase.com](https://supabase.com) → **Start your project**
2. Login com GitHub (ou e-mail)
3. Clique em **New Project**
4. Nome: `mgc-financas` · Região: **South America (São Paulo)**
5. Crie uma senha forte para o banco de dados
6. Aguarde ~2 minutos

#### 2. Criar a tabela (SQL Editor)
No menu lateral → **SQL Editor** → **New query** → cole e execute:

```sql
create table finance_data (
  id integer primary key,
  payload jsonb,
  updated_at timestamptz default now()
);

alter table finance_data enable row level security;

create policy "Allow all operations" on finance_data
  for all using (true) with check (true);
```

#### 3. Copiar as chaves
Vá em **Settings → Data API**:
- **Project URL** — `https://xxxx.supabase.co`
- **Publishable key** — começa com `sb_publis...` (aba "Publishable and secret API keys")

> ⚠️ **Nunca use a Secret key no dashboard.** Somente a Publishable key.

#### 4. Configurar no MGC Finanças
1. Abra o dashboard → clique em ☁️ (ícone de nuvem no header)
2. Cole a **Project URL** e a **Publishable key**
3. Clique em **Salvar e sincronizar**
4. Os dados são enviados imediatamente e sincronizados a cada salvamento

---

### Configurar GitHub Pages

#### 1. Criar repositório
1. Acesse [github.com](https://github.com) → **+** → **New repository**
2. Nome: `mgc-financas`
3. Visibilidade: **Public** (necessário para GitHub Pages gratuito)
4. **Não** marque "Add a README file" — deixe o repo vazio
5. Clique em **Create repository**

#### 2. Enviar os arquivos
No terminal (ou usando o Git):
```bash
git init
git add mgc-financas.html manifest.json sw.js icon-192.png icon-512.png index.html
git commit -m "feat: MGC Finanças"
git branch -M main
git remote add origin https://github.com/seunome/mgc-financas.git
git push -u origin main
```

#### 3. Ativar GitHub Pages
1. No repositório → **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** · Pasta: **/ (root)**
4. Clique em **Save** → aguarde ~2 min

#### 4. Sua URL
```
https://seunome.github.io/mgc-financas/
```

---

## 🗂️ Estrutura dos arquivos

| Arquivo | Função |
|---|---|
| `mgc-financas.html` | Arquivo principal — interface, lógica e estilos |
| `sw.js` | Service Worker — cache offline e instalação PWA |
| `manifest.json` | Define o app como PWA (nome, ícones, display mode) |
| `icon-192.png` | Ícone do app para telas iniciais e notificações |
| `icon-512.png` | Ícone de alta resolução para instalação PWA |
| `index.html` | Redirecionamento da raiz para `mgc-financas.html` |

---

## 🔒 Segurança — Perguntas frequentes

### "Meus dados ficam expostos no GitHub?"
**Não.** O GitHub armazena apenas o código HTML. Seus lançamentos financeiros ficam no `localStorage` do seu navegador — ninguém tem acesso a eles a não ser você.

### "As chaves do Supabase ficam no código?"
**Não.** As chaves são inseridas pela interface do dashboard e salvas no `localStorage` do seu navegador. O código HTML no GitHub não contém suas chaves.

### "A Publishable key do Supabase é segura para usar?"
**Sim.** Ela foi projetada para ficar exposta no navegador. A segurança real é garantida pelas **Row Level Security policies** do Supabase. A Secret key (que nunca usamos) é a que não deve ser exposta.

### "E se alguém acessar a URL do meu GitHub Pages?"
A pessoa verá o dashboard vazio, sem nenhum dado. Para ver seus dados, precisaria também das suas chaves do Supabase — que não estão em nenhum lugar público.

### "O que acontece se eu fechar a conta do Supabase?"
Você perde a sincronização em nuvem, mas seus dados continuam locais no `localStorage`. Faça backup JSON regularmente.

### Recomendação por cenário

| Cenário | Nível de segurança | Recomendação |
|---|---|---|
| Só arquivo local | 🟢 Máximo | Ideal para dados sensíveis |
| Local + Supabase | 🟢 Alto | Padrão recomendado |
| GitHub Pages Public | 🟡 Bom | Código exposto, dados não |

---

## 💾 Backup Recomendado

Faça backup mensalmente: **💾 Exportar Backup → JSON**

O arquivo JSON inclui: lançamentos, dívidas, faturas, categorias, cartões, orçamentos e configurações.

Para restaurar: **📂 Importar Backup → selecione o arquivo JSON**

---

## 📄 Licença

Este software é de uso **pessoal e educacional livre**. Uso comercial requer autorização do autor.

---

## 👤 Autor

**Marlon Gomes da Costa**  
Desenvolvedor independente · MGC Dev  

_Profissionalmente, professor do IFMA Campus São Raimundo das Mangabeiras,_  
_mas este projeto é uma iniciativa pessoal, sem vínculo institucional._

---

*© 2026 MGC Dev — Feito com ☕ no Maranhão*
