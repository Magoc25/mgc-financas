# Changelog — MGC Finanças

Todas as mudanças notáveis neste projeto estão documentadas aqui.  
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [4.0.0] — Abril 2026

### 📱 Mobile e PWA

#### 🆕 Adicionado
- **Progressive Web App (PWA)** — instalável no Android, iOS, desktop e macOS
- **Web App Manifest** com nome "MGC Finanças", ícones PNG (192×192 e 512×512) e modo standalone
- **Service Worker** com cache offline e atualização automática
- **Bottom Navigation Bar** — abas fixas na base (Início, Gráficos, Dados)
- **FAB flutuante (＋)** — botão de novo lançamento sempre visível no mobile
- **Bottom sheet de formulário** — formulário de entrada desliza de baixo em mobile
- **Bottom sheet de mais opções** — ações secundárias acessíveis pelo menu ⋯
- **Banner de instalação** automático com detecção de `beforeinstallprompt`
- **Hint para iOS** — toast orientando o fluxo "Compartilhar → Adicionar à tela de início" no Safari
- Suporte a `viewport-fit=cover`, `theme-color` e meta tags Apple para experiência nativa
- Ícone minimalista SVG — gráfico de barras com linha de tendência e marca MGC
- Ícones PNG gerados via GDI+ para compatibilidade total com Chrome PWA

#### 🔧 Melhorado
- Banner de instalação suprimido via `@media (display-mode: standalone)` — não aparece no app instalado
- Flag `pwaInstalled` em localStorage — banner não reaparece após instalação ou fechamento manual

### 🔐 Segurança — Bloco 4

#### 🆕 Adicionado
- **PIN de acesso** — bloqueio do dashboard com senha de 4 dígitos
- Overlay de bloqueio com campo de PIN e botão de verificação
- Modal de configuração de PIN (ativar, alterar, remover)
- Botão 🔒/🔓 no header para bloquear manualmente e acessar configurações
- **Histórico de alterações** — registro das últimas 150 ações com timestamp
- Modal de histórico com tipo de ação, categoria de dado e nome do item
- Botão 📋 no header para abrir o histórico
- `logHistorico()` instrumentado em todas as operações de adição, edição, remoção e duplicação
- **Validação visual de formulários** — campos obrigatórios destacados com borda vermelha
- `setFieldError()` e `clearFieldError()` para feedback inline nos formulários

### 📊 Tabelas e UX — Bloco 2

#### 🆕 Adicionado
- **Cabeçalhos ordenáveis** em todas as tabelas (Entradas, Saídas, Dívidas, Faturas) com indicadores ↑↓
- **Botão de duplicar** em cada linha das tabelas — cria cópia do registro com um clique
- `aplicarSort()` — função de ordenação com preservação de índice original via `_i`
- `_sortStates` — estado de ordenação por tabela e coluna (neutro → crescente → decrescente → neutro)

### 🛠 Código e Dados — Bloco 5

#### 🆕 Adicionado
- Constantes nomeadas para chaves de localStorage (`STORAGE_KEY`, `COMPACT_KEY`, `DARK_KEY`)
- `validarBackup(obj)` — valida estrutura e tipos antes de importar backup JSON
- Importação com mensagem de erro descritiva quando o arquivo é inválido

#### 🐛 Corrigido
- **Bug crítico TDZ** — `const DARK_KEY = DARK_KEY` (autorreferencial) causava falha completa do script; corrigido para `const DARK_KEY = 'finDark'`
- Botão "Categorias & Cartões" não respondia por consequência do bug TDZ acima

### ☁️ Infraestrutura

#### 🆕 Adicionado
- Repositório no GitHub (`Magoc25/mgc-financas`)
- Deploy via **GitHub Pages** — `https://magoc25.github.io/mgc-financas/`
- `index.html` de redirecionamento da raiz para `mgc-financas.html`
- `.gitignore` configurado (excluindo versões antigas, screenshots e pasta `.claude`)
- `sw.js` com cache `mgc-v2`, estratégia network-first com fallback offline
- `manifest.json` com caminhos relativos compatíveis com GitHub Pages

---

## [3.0.0] — Março 2026

### 🆕 Adicionado
- **Orçamentos por categoria** com limite mensal e indicador de consumo
- **Gráfico de pizza** — distribuição de despesas por categoria
- **Gráfico de linha** — evolução do saldo mensal
- Filtro de mês com seletor rápido e navegação ←/→
- Suporte a **modo escuro** com toggle e persistência em localStorage
- **Modo compacto** com toggle e persistência

### 🔧 Melhorado
- Gráficos adaptados para modo claro e escuro
- Tabelas com layout responsivo para telas menores

---

## [2.0.0] — Janeiro 2026

### 🆕 Adicionado
- **Faturas** — controle de vencimento e situação por cartão
- **Dívidas** — cadastro com credor, valor total e status
- **Cartões** — cadastro de cartões de crédito/débito com nome e bandeira
- **Categorias personalizadas** com ícone e cor
- Modal unificado "Categorias & Cartões" com abas de navegação
- **Sincronização Supabase** — botão ☁️, auto-sync ao abrir, debounce e offline-first

### 🔧 Melhorado
- Formulário de lançamentos com seletor de cartão integrado
- Backup JSON expandido para incluir dívidas, faturas, cartões e categorias

---

## [1.0.0] — Outubro 2025

### 🚀 Lançamento inicial
- Registro de **receitas e despesas** com categoria, descrição e data
- **Gráfico de barras** — comparativo mensal receitas vs despesas
- Armazenamento em `localStorage`
- Exportar e importar backup JSON
- Interface em português brasileiro
- Suporte a Chrome, Edge, Firefox e Safari

---

*© 2026 MGC Dev — Marlon Gomes da Costa · Projeto pessoal e independente*
