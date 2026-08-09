# Changelog — Margem

Todas as mudanças notáveis neste projeto estão documentadas aqui.  
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [4.18.0] — Agosto 2026

### 🐛 Correções
- **Mexer na renda ou numa despesa fixa não reescreve mais o passado.** Até aqui, renda recorrente e despesa fixa não tinham data nenhuma: o valor era aplicado a **todos** os meses, para trás e para frente. Então, se o seu salário aumentou em agosto, o app passava a mostrar o salário novo também em janeiro — e todo o balanço dos meses anteriores ficava falso. O mesmo valia para incluir ou cortar uma despesa fixa. **Agora cada renda e cada despesa fixa tem uma vigência**, e alterar afeta o presente e o futuro, nunca o histórico.

### 🔧 Melhorado
- **Renda ou despesa fixa nova vale a partir do mês em tela.** Lançou uma nova em agosto? Ela conta de agosto em diante e **não aparece** nos meses anteriores.
- **Cortar uma conta preserva o histórico.** O ✕ em Fontes de Renda e Despesas Fixas passou a ser **Encerrar**: a conta de celular cortada em agosto some de agosto em diante, e julho e os meses anteriores continuam com ela — porque você realmente pagou. Para o caso de lançamento por engano, o mesmo aviso traz **Apagar de vez**, que remove de todo o histórico.
- **Ao editar o valor, você escolhe o alcance.** O modal de edição pergunta se a mudança vale **a partir do mês em tela** (o padrão — encerra o valor antigo e abre o novo, preservando o histórico) ou **em todo o histórico** (para corrigir um valor digitado errado).
- **As tabelas acompanham o mês do filtro.** Fontes de Renda e Despesas Fixas passam a listar o que estava vigente no mês escolhido, com o período ao lado do nome. Em **"Todos os Meses"** aparecem todas, inclusive as encerradas, para você poder editar ou reabrir.
- O backup CSV ganhou as colunas **Início** e **Fim**.

> **Seus lançamentos atuais não mudam.** Renda e despesa fixa que já existiam continuam valendo em todos os meses, exatamente como hoje — a vigência só começa a valer para o que você criar ou alterar daqui em diante.

---

## [4.17.0] — Agosto 2026

### 🆕 Adicionado
- **Dia da compra nos lançamentos de cartão.** O formulário ganhou um campo **Dia** (opcional), ao lado do Mês, e o modal de edição também. **A data escolhida fica guardada até você mudar** — lançar cinco compras do mesmo dia agora custa digitar o dia uma vez só. Há um atalho **hoje** para preencher com a data de hoje. O campo nasce **vazio de propósito**: como dá para lançar em mês passado (v4.14.0), preencher "hoje" sozinho gravaria data errada em silêncio. Quem não lembra o dia deixa em branco, e nada se perde — o dia não muda valor, parcela nem mês.
- **Preencher datas em massa.** As compras lançadas antes desta versão não têm dia, e **não há de onde adivinhar**: o registro do histórico guarda a hora em que você *digitou*, não a da compra. Então, quando houver compras sem data no mês em tela, aparece o botão **📅 Preencher datas** no Detalhamento de Faturas, com a contagem. Ele abre uma lista só daquelas compras — cada uma com um campinho de dia, o nome, o cartão e o valor para você reconhecer — e um **Preencher tudo** para quando o lote foi todo no mesmo dia. Salva de uma vez. O botão **some sozinho** quando o mês fica completo, e o que você não preencher continua lá para depois, sem travar nada.

> Este é o passo que prepara o **gráfico de compras por dia**, que vem a seguir: sem data nos lançamentos, o gráfico mostraria tudo amontoado num dia só e mentiria sobre os seus hábitos.

---

## [4.16.0] — Agosto 2026

### 🔧 Melhorado
- **Botões de ação sempre à vista no Detalhamento de Faturas.** A coluna **Ações** (✎ editar, ⧉ duplicar, ✕ remover) ficava depois de *todas* as colunas de mês — para mexer numa compra era preciso arrastar a barra de rolagem até o fim da tabela e depois voltar. Agora ela fica **presa à borda direita**: role os meses à vontade que os botões continuam no mesmo lugar, na mesma linha. No celular nada muda — lá as colunas da esquerda (Cartão, Categoria, Parcela) já ocupam quase toda a largura da tela, e prender mais uma ponta não deixaria espaço para ver os valores.

---

## [4.15.0] — Agosto 2026

### 🆕 Adicionado
- **Apagar sugestões da Descrição.** O campo **Descrição** de "Adicionar Novo Lançamento" guarda o que você já digitou para completar sozinho — e agora dá para **limpar essa lista**. No próprio campo há o atalho **✎ sugestões**, que abre a aba **Descrições** (dentro de 🏷 Categorias, Cartões & Descrições): busque, remova uma a uma no ✕ ou use **Limpar todas**. Serve para tirar do caminho o que foi digitado errado ou ficou repetido. Remover uma sugestão **não apaga lançamento nenhum** — some só do autocomplete, e a remoção vale em todos os aparelhos. Se você digitar a descrição de novo, ela volta para a lista.

### 🔧 Melhorado
- **Renda extra agora aparece só no mês dela.** No painel **Fontes de Renda**, as entradas de "Renda Extra (mês específico)" apareciam em qualquer mês selecionado lá em cima. Agora acompanham o filtro: uma renda extra lançada para jun/26 só é listada com **Jun/26** escolhido. Em **"Todos os Meses"** todas continuam visíveis, para você conseguir editar ou remover as dos outros meses. As rendas recorrentes seguem aparecendo sempre, como antes.

### 🐛 Correções
- **"Trazer déficit" parava de desmarcar sozinho.** No painel **Planejamento de Quitação**, desmarcar um mês não durava: o check voltava ao mexer no mês vizinho e, ao fechar e reabrir o app, os meses reapareciam marcados. Motivo: desmarcar **apagava** a informação em vez de gravar "desligado", e como a sincronização só sabe **juntar** o que cada aparelho tem, a versão antiga da nuvem remarcava o mês na sincronização seguinte. Agora o desmarcado é gravado como tal e permanece — inclusive no outro aparelho.
- **Limite de categoria apagado voltava sozinho.** Mesma causa do item acima, em 🏷 Categorias: limpar o limite mensal de uma categoria não se mantinha entre aparelhos.
- **Nome com apóstrofo quebrava os botões.** Categoria, cartão ou descrição com `'` no nome (ex.: "Conta d'água") deixava os botões de remover sem reação.

---

## [4.14.0] — Agosto 2026

### 🔧 Melhorado
- **Lançar em mês passado ficou mais rápido.** O campo **Mês** do painel "Adicionar Novo Lançamento" agora acompanha o **Mês** escolhido lá em cima. Se você voltar o filtro para julho para conferir o que faltou, o formulário já abre em julho — sem precisar escolher o mês duas vezes. Depois de salvar, ele **continua** no mês do filtro, então dá para lançar vários esquecidos de uma vez. Em "Todos os Meses", o formulário usa o mês atual. Vale igual no computador e no celular.

---

## [4.13.1] — Agosto 2026

### 🐛 Correções
- **Nome duplicado na barra de título.** Para quem instalou a 4.13.0, a janela do app mostrava "Margem · Finanças pessoais - Margem" — o Windows junta o nome do app com o título da página. Agora aparece só **Margem**.

---

## [4.13.0] — Agosto 2026

### 🆕 Adicionado
- **O app agora se chama Margem.** É só o nome — nada muda no funcionamento, e **nenhum dado seu é afetado**. "Margem" é o que sobra da sua renda depois das despesas, medido contra o que você planejou: é exatamente o número que o app calcula. O novo nome aparece na barra de título da janela, embaixo do ícone no celular e na área de trabalho, e na hora de instalar.

> ℹ️ **Se você já tem o app instalado:** no **Android**, o nome se atualiza sozinho em 1 a 3 dias depois que você abrir o app atualizado — não desinstale. No **Windows**, o atalho do Menu Iniciar se atualiza ao reinstalar, mas um ícone fixado na barra de tarefas continua com o nome antigo até você desafixar e refixar. No **iPhone/iPad**, só remover e re-adicionar à Tela de Início atualiza — **e isso apaga os dados guardados no aparelho**, então sincronize ou exporte um backup antes.

---

## [4.12.1] — Agosto 2026

### 🐛 Correções
- **Versão errada no cabeçalho.** O texto ao lado do título trazia uma versão fixa e antiga (`v4.3.0`) escrita direto na página, sobrescrita pelo app na abertura. Bastava o app demorar um instante para você ver uma versão de nove atualizações atrás. Agora o cabeçalho nasce vazio e só mostra a versão que o app realmente está rodando.

### 🔧 Melhorado
- **Instruções do Supabase corrigidas.** O passo a passo mandava clicar num ícone de nuvem e num botão "Salvar e sincronizar" que não existem — o certo é a **engrenagem ⚙** e o botão **"Salvar e conectar"**. A tela de configuração também passou a apontar o caminho atual das chaves no Supabase (*Settings → Data API*) e a aceitar o nome novo da chave (*Publishable key*).

---

## [4.12.0] — Julho 2026

### 🐛 Correções
- **Lançamentos sumiam ao usar dois aparelhos.** Com o app aberto no computador e no celular, o aparelho que ainda não tinha recebido as novidades regravava a nuvem inteira com a própria versão dos dados — e o que havia sido lançado no outro aparelho **desaparecia, sem aviso**. Agora **toda gravação lê a nuvem antes de escrever e junta os dois lados**: nada é mais sobrescrito. Vale também no sentido inverso — o que você lança **sem internet** deixou de ser descartado ao abrir o app da próxima vez.

### 🔧 Melhorado
- **Apagar, editar e desfazer agora valem em todos os aparelhos.** Cada lançamento passou a ter identidade própria e carimbo de hora: item apagado num aparelho não "ressuscita" pelo outro, a edição mais recente vence, e o **Desfazer** restaura o item em todos. Categorias e cartões seguem a mesma regra.
- **Sem internet, o app avisa** ("Sem conexão — salvo só neste aparelho") em vez de dar a entender que sincronizou; tudo sobe assim que a conexão volta.
- **Importar backup** voltou a ser uma restauração de verdade: o backup passa a valer também nos outros aparelhos, em vez de se misturar com o que havia antes.
- Modo escuro: a barra de progresso das metas não fica mais clara demais. No celular, o campo de limite por categoria deixou de provocar zoom ao ser tocado.

### ⚠️ Importante
- **Atualize o app em todos os aparelhos.** Enquanto um deles continuar na versão anterior, ele ainda pode sobrescrever a nuvem — a proteção só fica completa quando todos estão na 4.12.0.

---

## [4.11.3] — Julho 2026

### 🐛 Correções
- **Tabela "Fluxo de Caixa Mensal — Visão Geral" no celular** — a tabela agora **abre já no mês atual**. Antes, no celular, ela abria encostada nos meses mais antigos (à esquerda), onde Faturas e Dívidas ainda são zero — dando a impressão de que só Renda e Despesas Fixas tinham valores. Os valores sempre estiveram lá, nas colunas do mês atual e seguintes; agora aparecem já na abertura.

---

## [4.11.2] — Julho 2026

### 🐛 Correções
- **Tabela "Fluxo de Caixa Mensal — Visão Geral" no celular** — as linhas de **Faturas**, **Dívidas** e **Saldo** voltam a mostrar os valores. No mobile, quando um dos gráficos acima da tabela falhava ao desenhar (Chart.js num canvas de seção ainda oculta), o erro **abortava o restante da renderização** e a tabela ficava só com Renda e Despesas Fixas. Agora cada gráfico/tabela/narrativa é renderizado de forma **isolada** — a falha de um não derruba os demais.

---

## [4.11.1] — Julho 2026

### 🐛 Correções
- **Formulário "Adicionar Novo Lançamento" no celular** — os campos que dependem do tipo (Categoria/Cartão, Parcelas e Mês) voltam a aparecer/ocultar corretamente ao trocar o **Tipo de Lançamento** na versão mobile. Antes, no celular, o formulário era uma cópia "congelada" e não reagia à troca de tipo — o que impedia, por exemplo, escolher o **Mês** de uma **Renda Extra**/**Dívida** ou informar **Parcelas/Categoria** de um **Cartão**.

### 🔧 Melhorado
- **Formulário unificado entre desktop e celular (fonte única).** O bottom-sheet do celular passou a usar exatamente o mesmo formulário do desktop (em vez de uma cópia), eliminando a duplicação que fazia correções feitas no app não valerem na versão mobile. Daqui pra frente, qualquer ajuste no formulário vale automaticamente para as duas versões.

---

## [4.11.0] — Julho 2026

### 🆕 Adicionado
- **Preenchimento automático no campo Descrição** de "Adicionar Novo Lançamento" (e na edição de itens) — conforme você digita, sugere descrições já usadas, como no navegador. O histórico é **salvo no Supabase**, então as sugestões acompanham você em qualquer dispositivo compartilhado.

### 🔧 Melhorado
- **Editar a categoria de um item nas Faturas de Cartão** — o modal de edição em "Detalhamento Faturas de Cartão" agora deixa trocar a **Categoria** (além de descrição e valor), corrigindo lançamentos feitos na categoria errada sem precisar apagar e recriar. Os campos **Parcelas** e **Mês de início** também voltaram a aparecer na edição.

### 🐛 Correções
- **Categorias e cartões novos agora aparecem no formulário após sincronizar** — antes, ao fechar e reabrir o app (ou em outro aparelho compartilhado), as categorias criadas em "Categorias & Cartões" sumiam do seletor de "Adicionar Novo Lançamento", porque as listas do formulário não eram recarregadas depois do carregamento do Supabase.

---

## [4.10.3] — Julho 2026

### 🔧 Melhorado
- **Controle de Pagamentos inicia recolhido** ao abrir o app (igual ao Planejamento de Quitação), deixando a tela inicial mais enxuta

---

## [4.10.2] — Julho 2026

### 🔧 Melhorado
- **Simulador — "Dívida / déficit acumulado hoje" automático mais intuitivo** — o valor automático agora é igual ao **Saldo Negativo do mês atual** (já com os déficits trazidos via "Trazer déficit"), em vez de somar todos os meses anteriores
- **Déficit trazido entra na "SAÍDA TOTAL" das Faturas de Cartão** — a linha de saída total do mês passa a incluir o déficit do mês anterior

### 🐛 Correções
- **Versão exibida no topo do app** agora usa a mesma fonte única do rodapé (antes o topo podia ficar preso numa versão antiga por cache)

---

## [4.10.1] — Julho 2026

### 🔧 Melhorado
- **"Trazer déficit do mês anterior" agora reflete em todos os gráficos** — ao marcar o check, o déficit trazido aparece como componente no gráfico "Custo de Vida vs Renda", na distribuição de gastos (pizza) e na cascata do mês — além do saldo e do fluxo de caixa (antes só o saldo mudava)
- **Planejamento de Quitação — dívida inicial automática** — o campo "Dívida / déficit acumulado hoje" ganhou um modo **Automático** (soma o déficit dos meses anteriores, já preenchido) e um campo para **somar outro valor** (dívidas fora do app), mostrando o total considerado

---

## [4.10.0] — Julho 2026

### 🆕 Adicionado
- **🎯 Planejamento de Quitação (simulador de déficit)** — novo painel na aba Início que projeta seu saldo mês a mês (renda, renda extra, despesas fixas, faturas e dívidas) e mostra **em que mês você zera o déficit**. Inclui:
  - Campo **"Dívida / déficit acumulado hoje"** editável, com botão para **estimar** a partir dos meses já lançados
  - Controle **"Economizar por mês"** (campo + barra deslizante) que **recalcula ao vivo** o mês de regularização
  - Simulação inversa: escolha o mês-alvo e veja **quanto precisa economizar por mês** para zerar até lá
  - Gráfico do **saldo acumulado** cruzando o zero (vermelho no negativo, verde no positivo)
- **Renda Extra por mês** — novo tipo de lançamento para receitas pontuais (restituição de IR, 13º salário, bônus…), somadas **apenas no mês escolhido**, sem virar renda recorrente. Aparecem na tabela de Rendas com o selo do mês e entram no saldo, no gráfico e no fluxo de caixa.
- **Trazer déficit do mês anterior** — no painel de Planejamento, um **check por mês** soma o déficit do mês anterior às despesas daquele mês (substitui o lançamento manual). Fica salvo por mês e **não aplica em cascata**: só o mês marcado puxa o anterior.

### 🔧 Melhorado
- Narrativa de saúde financeira agora menciona **renda extra** e **déficit trazido**, e aponta para o simulador quando o mês está negativo
- Fluxo de caixa mensal ganhou linhas de **Renda Extra** e **↪ Déficit anterior** quando aplicáveis

---

## [4.9.3] — Junho 2026

### 🆕 Adicionado
- **Botão do GitHub no rodapé** — acesso direto ao repositório (código-fonte) a partir do app

### 🔧 Melhorado
- **Aviso de nova versão mais confiável** — comparação de versões tolerante a formatos diferentes (evita banner indevido ou ausente)
- Versão do app unificada em uma **fonte única** interna, reduzindo risco de divergência entre telas
- Rodapé reorganizado na ordem padrão: GitHub → Apoiar → Avaliações → © versão

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
