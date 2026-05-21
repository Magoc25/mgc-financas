# Declaração de Acessibilidade — MGC Finanças

**Versão:** 1.0 · **Última atualização:** Maio de 2026

---

## 1. Compromisso

O MGC Finanças é desenvolvido por um único desenvolvedor independente (ATPP) com esforço contínuo para tornar o aplicativo acessível ao maior número possível de pessoas, independentemente de suas capacidades.

Este documento é publicado em conformidade com a [Lei 13.146/2015 (Lei Brasileira de Inclusão — Estatuto da Pessoa com Deficiência)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm), Art. 63, e com o nível de esforço proporcional ao porte do agente (ATPP conforme [Resolução CD/ANPD nº 2/2022](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022)).

---

## 2. Padrões de referência

- **[WCAG 2.2](https://www.w3.org/TR/WCAG22/)** (Web Content Accessibility Guidelines) — W3C
- **[ABNT NBR 17225:2025](https://www.abnt.org.br/)** — Acessibilidade em comunicação na Web
- **[Lei 13.146/2015](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm)** — Estatuto da Pessoa com Deficiência, Art. 63

---

## 3. Status de conformidade

**Status atual:** Parcialmente conforme com WCAG 2.2 Nível A

O app não passou por auditoria de acessibilidade formal. As funcionalidades listadas na Seção 4 foram implementadas com base nas diretrizes, mas podem conter lacunas não identificadas.

---

## 4. Recursos de acessibilidade implementados

| Recurso | Descrição |
|---|---|
| **Modo escuro** | Alternância de tema claro/escuro para redução de contraste luminoso |
| **Textos responsivos** | Layout adaptado para diferentes tamanhos de tela (mobile, tablet, desktop) |
| **Navegação por teclado** | Elementos interativos principais acessíveis via Tab/Enter |
| **Atributos `title`** | Botões de ação possuem atributo `title` descritivo |
| **Atributo `lang`** | Documento declarado em `lang="pt-BR"` para leitores de tela |
| **Sem conteúdo piscante** | Nenhum elemento pisca na frequência que pode causar crises epilépticas (WCAG 2.3.1) |
| **Textos alternativos estruturais** | Ícones puramente decorativos não interferem na leitura semântica |

---

## 5. Limitações conhecidas

As seguintes limitações foram identificadas ou podem estar presentes:

| Limitação | WCAG | Impacto |
|---|---|---|
| Gráficos (Chart.js) sem descrição textual alternativa | 1.1.1 Conteúdo não textual | Usuários de leitores de tela não têm acesso ao conteúdo dos gráficos |
| Contraste de cores não auditado formalmente | 1.4.3 Contraste | Pode não atingir proporção mínima de 4,5:1 em todos os elementos |
| ARIA roles não implementados sistematicamente | 4.1.2 Nome, função, valor | Alguns componentes dinâmicos podem não comunicar estado ao leitor de tela |
| Foco visual não customizado em todos os elementos | 2.4.7 Foco visível | Indicador de foco pode ser insuficiente em alguns botões |
| Formulários sem `<label>` associado em todos os campos | 1.3.1 Info e relacionamentos | Campos sem label explícito dependem do `placeholder` |

---

## 6. Tecnologias assistivas testadas

Não foram realizados testes formais com tecnologias assistivas. O app foi desenvolvido e testado manualmente em Chrome/Edge (desktop) e Chrome/Safari (mobile).

---

## 7. Como relatar problemas de acessibilidade

Se você encontrar uma barreira de acessibilidade:

**E-mail:** marlongc25@protonmail.com
**Assunto:** `[ACESSIBILIDADE] MGC Finanças — [descrição do problema]`

Por favor, descreva:
- O que tentou fazer
- Qual tecnologia assistiva está usando (se aplicável)
- O que aconteceu
- O que esperava que acontecesse

Comprometemo-nos a avaliar o relato e responder em até **15 dias úteis**.

---

## 8. Histórico de revisões

| Data | Versão | Mudança |
|---|---|---|
| Maio/2026 | 1.0 | Criação inicial da declaração |

**Próxima revisão prevista:** Maio de 2027

---

*© 2026 MGC Dev — Marlon Gomes da Costa · Projeto pessoal e independente*
*Consulte também: [PRIVACY.md](./PRIVACY.md) · [SECURITY.md](./SECURITY.md)*
