# Política de Segurança — MGC Finanças

**Versão:** 1.0 · **Última atualização:** Maio de 2026

---

## 1. Arquitetura de segurança

O MGC Finanças adota um modelo de **três camadas** que minimiza a exposição de dados do usuário:

- **Camada 1 (desenvolvedor):** código hospedado no GitHub Pages (somente leitura para o usuário); banco de dados compartilhado para avaliações e contagem anônima de dispositivos (Supabase compartilhado)
- **Camada 2 (usuário):** todos os dados financeiros ficam no `localStorage` do dispositivo do próprio usuário — nunca saem do dispositivo sem ação explícita
- **Camada 3 (usuário):** sincronização opcional via Supabase próprio, configurado e controlado exclusivamente pelo usuário

**Consequência prática:** mesmo em caso de comprometimento total da infraestrutura do desenvolvedor (GitHub Pages + Supabase compartilhado), os dados financeiros do usuário permanecem protegidos nas Camadas 2 e 3.

---

## 2. Medidas técnicas implementadas

### 2.1 Proteção contra XSS (Cross-Site Scripting)

- **Função `esc()`** aplicada em todos os campos de entrada do usuário renderizados via `innerHTML` — previne injeção de HTML/JavaScript
- **Content Security Policy (CSP)** no `<head>` — bloqueia carregamento de scripts externos não autorizados e exfiltração de dados. Diretivas ativas:
  - `script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net`
  - `connect-src 'self' https://*.supabase.co`
  - `img-src 'self' data: blob: https://api.qrserver.com https://chart.googleapis.com`
  - `object-src 'none'` · `base-uri 'self'` · `form-action 'self'`
- Avaliações públicas (reviews) passam por escaping antes de renderização — vetor crítico (um-para-muitos) protegido

### 2.2 Backend (Supabase compartilhado — avaliações)

- **Row Level Security (RLS)** habilitada nas tabelas `app_reviews`, `app_config` e `app_pings`
- Restrições SQL (`CHECK constraints`) na tabela `app_reviews`:
  - Limite de tamanho: nome ≤ 60 caracteres, comentário ≤ 1000 caracteres
  - Bloqueio de padrões de injeção HTML (`<script>`, `<iframe>`, `javascript:`)
  - Rate limit: intervalo mínimo entre submissões do mesmo nome

### 2.3 Privacidade por design

- Identificador de dispositivo (`device_id`) é UUID aleatório — sem vínculo com dados pessoais
- Nenhum token OAuth ou credencial do usuário é transmitido ao desenvolvedor
- Chaves do Supabase do usuário ficam somente no `localStorage` local — nunca no código-fonte

### 2.4 Comunicação

- Todo tráfego via **HTTPS** (GitHub Pages + Supabase)
- Código-fonte disponível publicamente para auditoria independente

---

## 3. Responsabilidades do usuário

Conforme o modelo de três camadas, o usuário é responsável por:

- Manter o **dispositivo** (computador, celular) protegido com senha e atualizado
- Configurar adequadamente o **Supabase próprio** (Camada 3), incluindo chaves de acesso
- Realizar **backups periódicos** dos dados exportando o arquivo de backup disponível no app
- **Instalar atualizações** do app quando disponíveis (banner de atualização é exibido automaticamente)

> ⚠️ **Aviso legal:** o não cumprimento dessas responsabilidades pelo usuário pode configurar culpa concorrente nos termos do [Art. 945 do Código Civil](https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm) e do [Art. 12, §3º do CDC](https://www.planalto.gov.br/ccivil_03/leis/l8078compilada.htm), afastando ou reduzindo a responsabilidade do desenvolvedor por eventuais danos.

---

## 4. Canal de reporte de vulnerabilidades

Se você identificar uma vulnerabilidade de segurança:

**E-mail:** marlongc25@protonmail.com
**Assunto:** `[SECURITY] MGC Finanças — [descrição curta]`

Por favor, inclua:
- Descrição da vulnerabilidade
- Passos para reproduzir
- Impacto potencial estimado
- Se possível, prova de conceito (PoC)

Comprometemo-nos a:
- Confirmar o recebimento em até **5 dias úteis**
- Informar sobre o progresso da correção
- Divulgar crédito ao pesquisador, se desejado, após a correção

**Não divulgue publicamente** antes de 90 dias ou do lançamento da correção (responsible disclosure).

---

## 5. Plano de resposta a incidentes (ANPD Res. 15/2024)

Em caso de incidente de segurança que afete dados pessoais tratados pelo desenvolvedor (pings e avaliações — Camada 1):

| Etapa | Ação | Prazo |
|---|---|---|
| **Contenção** | Identificar e isolar o vetor de ataque; desabilitar acesso temporariamente se necessário | Imediato |
| **Avaliação** | Determinar escopo: quais dados, quantos titulares, origem do incidente | Até 24h |
| **Notificação ANPD** | Notificar a Autoridade Nacional de Proteção de Dados se o incidente for de risco ou dano relevante | Até 72h após ciência |
| **Notificação titulares** | Comunicar via banner no app e/ou e-mail (se coletado) quando houver risco real aos direitos | Assim que viável |
| **Correção** | Implementar correção, publicar nova versão, bumpar Service Worker | Conforme severidade |
| **Pós-incidente** | Documentar o ocorrido, causa raiz e melhorias implementadas | Até 30 dias |

Base legal: [LGPD Art. 46-49](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) + [Resolução CD/ANPD nº 15/2024](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd).

---

## 6. Canal de atualização de segurança

Atualizações de segurança são disponibilizadas via **GitHub Pages** automaticamente. O app exibe um banner de atualização quando uma nova versão está disponível.

Para acompanhar mudanças de segurança: consulte [CHANGELOG.md](./CHANGELOG.md) (entradas marcadas com 🔒 Security).

---

## 7. Escopo de proteção

| Item | Protegido por quem |
|---|---|
| Dados financeiros do usuário | Usuário (Camadas 2 e 3) |
| Avaliações e pings | Desenvolvedor (Camada 1) — medidas desta política |
| Supabase do usuário | Usuário — responsabilidade de configuração |
| Dispositivo do usuário | Usuário |

---

*© 2026 MGC Dev — Marlon Gomes da Costa · Projeto pessoal e independente*
*Consulte também: [PRIVACY.md](./PRIVACY.md) · [TERMS.md](./TERMS.md)*
