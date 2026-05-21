# Inventário de Tratamento de Dados — MGC Finanças

**Agente:** Marlon Gomes da Costa · **Porte:** ATPP · **Atualizado em:** Maio de 2026

> Documento elaborado conforme [LGPD Art. 37](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm#art37) e [Resolução CD/ANPD nº 2/2022, Art. 7º](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022) (simplificado para ATPP).

---

## Arquitetura de tratamento — visão geral

O MGC Finanças opera em três camadas. **Este inventário cobre apenas o tratamento realizado pelo desenvolvedor (Camada 1).** As Camadas 2 e 3 são controladas exclusivamente pelo usuário.

| Camada | Controlador | O que contém |
|---|---|---|
| Camada 1 (desenvolvedor) | Marlon Gomes da Costa | Pings anônimos de dispositivo; avaliações públicas do app |
| Camada 2 (usuário) | O próprio usuário | Dados financeiros no `localStorage` do dispositivo |
| Camada 3 (usuário) | O próprio usuário | Banco Supabase próprio (opcional, configurado pelo usuário) |

---

## Registros de tratamento (Camada 1)

| # | Dado | Categoria LGPD | Origem | Finalidade | Base legal | Operadores | Retenção | Medidas de segurança |
|---|---|---|---|---|---|---|---|---|
| 1 | `device_id` (UUID aleatório) | Não pessoal (pseudônimo não vinculável) | Gerado automaticamente no dispositivo | Contagem anônima de dispositivos ativos (badge no README) | Legítimo interesse (Art. 7º, IX) | Supabase Inc. (EUA) | Indefinido; excluível por solicitação | RLS no banco, HTTPS, sem dados identificáveis |
| 2 | `app_name`, `version`, `ping_date` | Não pessoal | Gerado pelo app | Estatística de uso por versão | Legítimo interesse (Art. 7º, IX) | Supabase Inc. (EUA) | Junto com `device_id` | HTTPS |
| 3 | Nome (avaliação) | Pessoal — identificação | Fornecido voluntariamente pelo titular | Exibição pública na lista de avaliações do app | Consentimento (Art. 7º, I) | Supabase Inc. (EUA) | Indefinido enquanto o app estiver ativo; excluível por solicitação | RLS, constraints SQL, esc() no frontend, HTTPS |
| 4 | Comentário (avaliação) | Pessoal — opinião | Fornecido voluntariamente pelo titular | Exibição pública na lista de avaliações do app | Consentimento (Art. 7º, I) | Supabase Inc. (EUA) | Junto com o nome | RLS, constraints SQL, esc() no frontend |
| 5 | Pontuação em estrelas (avaliação) | Não pessoal | Fornecido voluntariamente | Exibição pública | Consentimento (Art. 7º, I) | Supabase Inc. (EUA) | Junto com o nome | RLS, HTTPS |

---

## Dados NÃO tratados pelo desenvolvedor

Os itens abaixo ficam **exclusivamente** no dispositivo/infraestrutura do usuário e **nunca chegam** ao desenvolvedor:

- Dados financeiros (rendas, faturas, despesas fixas, dívidas, metas)
- Histórico de transações
- Chaves de acesso ao Supabase do usuário
- Pagamentos e controle de status

---

## Operadores de dados (Camada 1)

| Operador | País | Papel | Instrumento de adequação |
|---|---|---|---|
| Supabase Inc. | EUA | Hospedagem do banco de dados (avaliações, pings) | Cláusulas contratuais padrão (SCCs) |
| GitHub Inc. | EUA | Hospedagem do código-fonte e GitHub Pages | Cláusulas contratuais padrão (SCCs) |

---

## Canal de direitos dos titulares

**E-mail:** marlongc25@protonmail.com
**Prazo de resposta:** até 15 dias úteis

Direitos disponíveis: acesso, correção, eliminação, portabilidade, oposição, revogação do consentimento — conforme [LGPD Art. 18](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm#art18).

---

*© 2026 MGC Dev — Marlon Gomes da Costa · Projeto pessoal e independente*
*Consulte também: [PRIVACY.md](./PRIVACY.md) · [SECURITY.md](./SECURITY.md)*
