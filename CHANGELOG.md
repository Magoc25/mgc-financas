# Changelog — MGC Finanças

Todas as mudanças notáveis neste projeto estão documentadas aqui.  
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [4.9.2] — Junho 2026

### 🔧 Melhorado
- **Avaliações:** contador de caracteres no campo de comentário (ex.: 31/200)

### 🔒 Segurança
- **Limite das avaliações reforçado:** comentário ≤ 200 e nome ≤ 40 (formulário + constraint no backend reduzida de 1000/60), reduzindo abuso/spam no Supabase compartilhado

---

## [4.9.1] — Junho 2026

### 🔧 Melhorado
- SQL de configuração do Supabase agora inclui os `GRANT`s explícitos (anon/authenticated/service_role), evitando o erro `42501` em projetos Supabase criados recentemente
- README: "Como usar — Opção 2 (cópia local)" simplificado para baixar apenas o `mgc-financas.html`

### 📄 Documentação legal
- `TERMS.md`: ressalva sobre o simulador de investimentos (estimativas educacionais, sem garantia de rendimento, não é recomendação) + versão/data atualizadas
- `DATA_INVENTORY.md` e `PRIVACY.md`: incluem os cenários de investimento e datas atualizadas

---

## [4.9.0] — Junho 2026

### 🆕 Adicionado
- **Modo privacidade (ocultar valores)** — botão de olho ao lado do seletor Contas/Investir que mascara todos os valores como `R$ ••••` e borra os gráficos da aba. **Independente por aba** (ex.: ocultar em Contas e mostrar em Investir) e **salvo no dispositivo**. Ideal para mostrar o app a outras pessoas sem expor seus dados financeiros.

---

## [4.8.0] — Junho 2026

### 🆕 Adicionado
- **Investimentos — Fase 4 (avançado)**:
  - **Rentabilidade real**: mostra o valor líquido em poder de compra de hoje, descontando o IPCA das premissas
  - **Meta**: calcula o aporte mensal necessário para atingir um valor líquido alvo (considerando o IR regressivo), com botão para aplicar no simulador
  - **Exportar CSV** dos cenários salvos (BOM UTF-8)

---

## [4.7.0] — Junho 2026

### 🆕 Adicionado
- **Investimentos — Fase 3 (educacional)**: nova aba **Aprender** no módulo de investimentos
  - **Glossário** de renda fixa (CDI, Selic, IPCA, prefixado × pós-fixado, IR regressivo, Poupança, CDB, LCI/LCA, Tesouro Direto, FGC, liquidez)
  - **Cenários prontos** que pré-preenchem o simulador: reserva de emergência, médio prazo e longo prazo
  - **Ícones de ajuda ⓘ** ao lado de "Produto" e "Taxa" no simulador

---

## [4.6.0] — Junho 2026

### 🆕 Adicionado
- **Investimentos — Fase 2**: expansão do simulador de renda fixa
  - Novos produtos: **LCI/LCA** (isento, % do CDI), **Tesouro Selic** e **Tesouro IPCA+**
  - Tipos de taxa por produto: **% do CDI** (pós-fixado), **IPCA + taxa real** e fixo (Poupança/Selic)
  - **Taxas de referência editáveis** (CDI, Selic, IPCA) salvas no dispositivo, alimentando todos os produtos
  - Comparador ampliado para os 5 produtos (tabela com taxa a.a. + gráfico de barras), com baseline vs Poupança
  - Exibição da taxa efetiva a.a. derivada (ex.: 95% do CDI ≈ 10,21% a.a.)

---

## [4.5.0] — Junho 2026

### 🆕 Adicionado
- **Módulo de Investimentos (MVP — Fase 1)** — nova aba dedicada à simulação de renda fixa
  - Navegação em duas abas no topo: **Contas** ↔ **Investir** (cada contexto com sua própria bottom-nav)
  - Simulador com aporte inicial, aporte mensal, prazo e taxa (Poupança e CDB prefixado)
  - Motor de cálculo de juros compostos com capitalização mensal e IR regressivo (funções puras)
  - Gráfico de evolução do saldo ao longo do tempo (Chart.js)
  - Salvar cenários e comparar **Poupança × CDB** no mesmo cenário
  - Integração: sugere a "sobra do mês" (renda − despesas fixas) como aporte mensal

---

## [4.4.0] — Junho 2026

### 🆕 Adicionado
- Sistema PIX (modal de apoio com QR Code e cópia de código)
- Sistema de avaliações compartilhadas (Reviews via Supabase)
- Botões ☕ Apoiar e ⭐ Avaliações na aba Início
- Banner de notificação de nova versão via Supabase
- Ping anônimo de dispositivos ativos (app_pings)
- GitHub Action keep-alive para Supabase de reviews
- GitHub Action update-stats para contagem de dispositivos ativos
- Arquivo `.nojekyll` para GitHub Pages
- `TERMS.md` — termos de uso
- `LICENSE.md` — licença de uso não comercial
- `stats.json` — contagem de dispositivos ativos (30 dias)
- Seções "Por que usar?" e "O que são os arquivos?" no README

### 🔧 Melhorado
- `manifest.json`: display_override, lang pt-BR, categories, orientation any
- `<head>` HTML: copyright, link rel="icon", apple-touch-icon com href
- Versão exibida no rodapé via fetch do CHANGELOG.md (dinâmico)
- `TERMS.md`: novas seções 7 (obrigações do usuário sobre atualizações — culpa concorrente), 8 (acessibilidade) e referências cruzadas aos documentos legais
- `README.md`: pg_cron keep-alive corrigido de semanal (`* * 1`) para diário (`* * *`)

### 🔒 Segurança
- **Função `esc()`** adicionada — sanitização HTML de todos os campos de usuário renderizados via innerHTML (19 pontos protegidos: nomes de categorias, cartões, despesas, rendas, metas, dívidas, histórico, notificações)
- **Content Security Policy (CSP)** adicionada ao `<head>` — bloqueia exfiltração de dados e carregamento de scripts não autorizados
- `_escRev` unificado com `esc()` (mais completa: inclui escaping de `"` e `'`)

### 📄 Documentação legal
- `PRIVACY.md` — Aviso de Privacidade (LGPD Art. 9º + Art. 18), adaptado ao modelo de três camadas do app
- `SECURITY.md` — Política de Segurança + plano de resposta a incidentes (LGPD Art. 46-49 + ANPD Res. 15/2024)
- `ACCESSIBILITY.md` — Declaração de Acessibilidade (LBI Art. 63 + WCAG 2.2 + ABNT NBR 17225:2025)
- `DATA_INVENTORY.md` — Inventário de tratamento de dados simplificado (LGPD Art. 37 + ANPD Res. 2/2022)

### 🐛 Corrigido
- **"Dívida Cartões (Futuro)" exibindo valor inflado** — `totalItemDebt` acumulava parcelas dos 12 meses de histórico passado junto com as futuras; corrigido para contar apenas a partir do mês atual (`HISTORY_COUNT`)

---

## [4.3.0] — Maio 2026

### 🔧 Melhorado
- **Filtro de mês** — padrão alterado para o mês atual (antes abria no próximo mês, causando confusão com o campo Mês do formulário)
- **Histórico de Alterações** — coluna "Valor" adicionada; todos os eventos (adicionar, editar, remover, duplicar) registram o valor da compra

---

## [4.2.0] — Maio 2026

### 🔧 Melhorado
- **Controle de Pagamentos** — toggle "Mês atual / Mês anterior" permite marcar despesas do mês anterior como pagas sem sair da view do mês corrente
- **Detalhamento Faturas** — linhas "TOTAL CARTÕES MENSAL" e "SAÍDA TOTAL" ficam fixas na base da tabela ao rolar verticalmente (movidas para `<tfoot>` sticky)

---

## [4.1.0] — Maio 2026

### 🔧 Melhorado
- **Detalhamento Faturas** — colunas Cartão, Categoria e Parcela agora ficam fixas ao rolar horizontalmente
- **Detalhamento Faturas** — tabela abre posicionada no mês atual − 2, facilitando a leitura dos meses relevantes
- **Formulário** — campo "Mês" volta ao mês atual após cada lançamento adicionado

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
