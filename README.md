# 💰 MGC Finanças

> **Dashboard financeiro pessoal completo, gratuito e com código-fonte disponível — sem instalação, sem servidor obrigatório.**

Desenvolvido por **Marlon Gomes da Costa (MGC Dev)**

> ⚠️ **Este é um projeto pessoal**, desenvolvido de forma independente pelo autor. Não representa, não é financiado e não tem vínculo institucional com o IFMA ou qualquer outra organização. O autor é professor do IFMA Campus São Raimundo das Mangabeiras, mas o MGC Finanças é uma iniciativa exclusivamente pessoal.

[![Versão](https://img.shields.io/badge/versão-4.8.0-blue)](#changelog)
[![Licença](https://img.shields.io/badge/licença-não%20comercial-orange)](#licença-e-termos-de-uso)
[![PWA](https://img.shields.io/badge/PWA-instalável-brightgreen)](#-abrir-agora--sem-baixar-nada)
[![PIX](https://img.shields.io/badge/apoie-PIX-brightgreen)](#apoiar-o-projeto)
[![Dispositivos ativos](https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/Magoc25/mgc-financas/main/stats.json&query=$.active_30d&label=dispositivos%20ativos%20(30d)&color=blue&suffix=%20dispositivos)](./stats.json)

---

## ▶ Abrir agora — sem baixar nada

O app já está publicado online. Clique e use:

**[▶ Abrir o MGC Finanças](https://magoc25.github.io/mgc-financas/)**

Funciona em qualquer navegador moderno (Chrome, Edge, Firefox, Safari) — no celular, tablet ou computador. **Não precisa de cadastro, login, conta GitHub ou download de arquivos.** Após o primeiro acesso, o app funciona **offline**. Seus dados ficam **somente no seu dispositivo** (no armazenamento do próprio navegador).

### 📱 Instalar como app no seu dispositivo

Depois de abrir a URL acima, você pode instalar como aplicativo nativo, com ícone na tela inicial / área de trabalho:

| Plataforma | Como instalar |
|---|---|
| **Chrome / Edge no PC** | Clique no ícone de instalação (☐ com seta) na barra de endereços → Instalar |
| **Android (Chrome)** | Menu (⋮) → "Instalar app" ou "Adicionar à tela inicial" |
| **iPhone / iPad (Safari)** | Compartilhar (□↑) → "Adicionar à Tela de Início" |

---

## 🤔 Por que usar o MGC Finanças?

Se você está avaliando este app, provavelmente já viu opções na Play Store ou App Store. Antes de decidir, considere:

- **Seus dados são seus** — nenhuma empresa, servidor externo ou desenvolvedor acessa seus dados. Eles ficam no seu dispositivo ou no seu próprio banco de dados, sob seu controle total.
- **Sem propagandas** — apps "gratuitos" nas lojas se sustentam exibindo anúncios. Este não.
- **Sem prazo de expiração** — muitos apps oferecem período de teste e depois bloqueiam funcionalidades ou cobram assinatura. Este é gratuito para sempre, sem limitações.
- **Funciona sem internet** — abre e funciona normalmente mesmo sem conexão. Sincroniza quando a internet voltar, se você quiser.
- **Sem cadastro em lugar nenhum — nem para sincronizar** — muitos apps financeiros "gratuitos" exigem e-mail ou conta mesmo para o uso básico. O MGC Finanças abre direto no navegador, sem cadastro, sem login, sem verificação — e sincroniza entre dispositivos usando o seu próprio banco de dados Supabase, não o de uma empresa terceira.
- **Finanças + investimentos juntos** — além do controle de despesas mês a mês, tem um módulo de **simulação de renda fixa** (Poupança, CDB, LCI/LCA, Tesouro) com foco em educação financeira.

O único "custo" honesto: a instalação é um pouco mais manual do que clicar em "Instalar" na loja — mas você faz uma única vez e leva menos de 5 minutos.

---

## 📂 O que são todos esses arquivos?

Se você veio aqui só para **usar o app**, pode ignorar a grande maioria dos arquivos deste repositório — eles são documentação técnica e configuração voltadas para o desenvolvedor.

Para você, basta clicar na URL pública da seção [▶ Abrir agora](#-abrir-agora--sem-baixar-nada). Tudo o que importa é:

| Arquivo principal | URL para usar |
|---|---|
| `mgc-financas.html` | [magoc25.github.io/mgc-financas](https://magoc25.github.io/mgc-financas/) |

---

## ✨ O que é

O MGC Finanças é um **arquivo HTML único** que roda direto no navegador — Chrome, Edge, Firefox ou Safari. Não precisa instalar nada, não precisa de servidor e funciona offline. Seus dados ficam no próprio dispositivo.

Quando quiser sincronizar entre computadores ou acessar pelo celular, basta configurar o Supabase (gratuito) — opcional.

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

### 📈 Investimentos (renda fixa)
- **Simulador** de Poupança, CDB, LCI/LCA, Tesouro Selic e Tesouro IPCA+ com juros compostos, aportes mensais e **IR regressivo**
- **Taxas de referência editáveis** (CDI, Selic, IPCA) e cálculo da rentabilidade **real** (descontando a inflação)
- **Comparador** dos produtos lado a lado (tabela + gráfico de barras)
- **Aprender** — glossário de renda fixa e cenários prontos
- **Meta** — calcula quanto poupar por mês para um objetivo; **exportação CSV** dos cenários

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
- **Duas abas no topo** (Contas e Investir), cada uma com sua barra de navegação inferior
- **FAB flutuante (＋)** — novo lançamento com um toque, sempre visível
- **Bottom sheets** — formulário de entrada e menu de mais opções deslizantes
- **Instalável** como app no Android, iOS e desktop
- **Banner de instalação** automático no primeiro acesso
- Funciona offline após instalação

### Sincronização em Nuvem
- **Supabase** — sincronização automática entre dispositivos via nuvem

---

## 📦 Como usar

### Opção 1 — Online _(recomendado)_

Use a URL pública da seção [▶ Abrir agora](#-abrir-agora--sem-baixar-nada). É a forma mais simples — sem instalação, sem cadastro, sem download. Funciona em qualquer dispositivo com navegador.

Seus dados ficam salvos **no próprio navegador**, apenas no seu dispositivo. Para fazer backup ou levar para outro computador, exporte pelo botão **💾 Exportar Backup** dentro do app.

### Opção 2 — Cópia local _(opcional)_

Se quiser uma cópia totalmente independente — útil para arquivamento ou para usar sem conexão garantida:

1. No repositório, clique no botão verde **Code** → **Download ZIP**
2. Extraia o ZIP em uma pasta no seu computador
3. Dê duplo clique em `mgc-financas.html`

Funciona exatamente igual à versão online, mas sem nenhuma dependência da internet ou do GitHub.

### Opção 3 — Sincronizar entre dois ou mais dispositivos _(opcional)_

Se quiser que os dados apareçam tanto no PC quanto no celular automaticamente, configure uma conta gratuita no Supabase (instruções em [Configurar Supabase](#-configurar-supabase-opcional)). É opcional — você pode usar o app perfeitamente sem isso.

---

## 🔧 Configurar Supabase _(opcional — só para sincronizar entre dispositivos)_

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

#### Bloco extra — Evitar suspensão por inatividade (recomendado)

O Supabase pode suspender projetos gratuitos sem atividade por 7 dias consecutivos. Para evitar isso:

1. Vá em **Database → Extensions** → busque `pg_cron` → ative o toggle
2. No **SQL Editor**, rode uma vez:

```sql
SELECT cron.schedule(
  'mgc-financas-keep-alive',
  '0 8 * * *',
  $$SELECT COUNT(*) FROM public.finance_data$$
);
```

> Agenda uma consulta todos os dias às 5h Brasília — funciona de forma autônoma a partir daí.
> Para confirmar que foi criado: `SELECT * FROM cron.job;`

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

### "E se alguém acessar a URL pública do app?"
A pessoa verá o dashboard vazio, sem nenhum dado. Para ver seus dados, precisaria também das suas chaves do Supabase — que não estão em nenhum lugar público.

### "O que acontece se eu fechar a conta do Supabase?"
Você perde a sincronização em nuvem, mas seus dados continuam locais no `localStorage`. Faça backup JSON regularmente.

---

## 💾 Backup Recomendado

Faça backup mensalmente: **💾 Exportar Backup → JSON**

O arquivo JSON inclui: lançamentos, dívidas, faturas, categorias, cartões, orçamentos, cenários de investimento e configurações.

Para restaurar: **📂 Importar Backup → selecione o arquivo JSON**

---

## ☕ Apoiar o Projeto

O projeto é gratuito e possui **código-fonte disponível**. Se foi útil, considere apoiar:

Clique em **☕ Apoiar** no rodapé do app para contribuir via PIX.

**Chave PIX:** `4c6086a2-4bb8-474b-a4cf-ced8c8d82189` · MGC Dev

### ⭐ Avaliações compartilhadas

Após apoiar, deixe uma avaliação com estrelas e comentário. As avaliações são **compartilhadas entre todos os usuários** do app.

### 👑 Badges de apoiador

| Badge | Meses de apoio |
|---|---|
| ☕ Apoiador | 1 mês |
| ⭐ Fã | 2–3 meses |
| 🔥 Dedicado | 4–6 meses |
| 👑 Patrono | 7+ meses |

---

## 📄 Licença e termos de uso

Este projeto possui **código-fonte disponível** para estudo, uso pessoal, familiar, educacional, acadêmico e avaliação técnica.

**Não é uma licença open source permissiva tradicional.** O uso comercial, a redistribuição comercial, o white-label, a revenda e a exploração econômica de versões derivadas dependem de autorização prévia e por escrito do autor.

Consulte os arquivos:

- [LICENSE.md](./LICENSE.md)
- [TERMS.md](./TERMS.md)
- [CHANGELOG.md](./CHANGELOG.md)

---

## 👤 Autor

**Marlon Gomes da Costa**  
Desenvolvedor independente · MGC Dev  

_Profissionalmente, professor do IFMA Campus São Raimundo das Mangabeiras,_  
_mas este projeto é uma iniciativa pessoal, sem vínculo institucional._

---

*© 2026 MGC Dev — Feito com ☕ no Maranhão*
