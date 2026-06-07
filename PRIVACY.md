# Aviso de Privacidade — MGC Finanças

**Versão:** 1.1 · **Última atualização:** Junho de 2026

---

## 1. Quem somos

**Controlador:** Marlon Gomes da Costa (CPF sob sigilo, disponível mediante solicitação fundamentada)
**Contato:** marlongc25@protonmail.com
**Porte:** Agente de Tratamento de Pequeno Porte (ATPP) conforme [Resolução CD/ANPD nº 2/2022](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022)

---

## 2. Arquitetura do app e modelo de três camadas

O MGC Finanças opera em **três camadas** com diferentes controladores:

| Camada | O que guarda | Quem controla |
|---|---|---|
| **Camada 1** (desenvolvedor) | Código hospedado no GitHub Pages; banco de reviews e pings (Supabase compartilhado) | Marlon Gomes da Costa |
| **Camada 2** (usuário) | Dados financeiros e cenários de investimento no `localStorage` do próprio dispositivo | Exclusivamente o usuário |
| **Camada 3** (usuário) | Banco Supabase próprio, configurado opcionalmente pelo usuário | Exclusivamente o usuário |

**Este aviso cobre apenas a Camada 1.** Os dados das Camadas 2 e 3 nunca chegam aos servidores do desenvolvedor.

---

## 3. Quais dados tratamos (Camada 1)

### 3.1 Ping anônimo de dispositivo ativo

Para contar quantos dispositivos acessam o app, coletamos **uma vez por dia por dispositivo**:

| Dado | Descrição |
|---|---|
| `device_id` | Identificador aleatório gerado no dispositivo (UUID v4). Não é vinculado a conta, nome, e-mail ou qualquer dado pessoal identificável. Armazenado no `localStorage` local. |
| `app_name` | Nome do app (`mgc-financas`) |
| `version` | Versão do app |
| `ping_date` | Data do ping (AAAA-MM-DD) |

**Não coletamos:** IP, localização geográfica, tipo de dispositivo, sistema operacional ou qualquer dado que permita identificar o titular.

### 3.2 Avaliações voluntárias

Ao clicar em "⭐ Avaliações" e enviar uma avaliação, coletamos:

| Dado | Obrigatoriedade | Uso |
|---|---|---|
| Nome | Obrigatório | Exibição pública na lista de avaliações |
| Comentário | Opcional | Exibição pública na lista de avaliações |
| Pontuação (1–5 estrelas) | Obrigatório | Exibição pública |
| Data | Gerada automaticamente | Ordenação da lista |

> ⚠️ **Aviso importante:** avaliações são **públicas** — visíveis para qualquer pessoa que abra o app. Não inclua dados pessoais sensíveis no comentário.

---

## 4. Finalidades e bases legais

| Dado | Finalidade | Base legal ([LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) Art. 7º) |
|---|---|---|
| `device_id` (ping) | Contagem de dispositivos ativos; manutenção e melhoria do app | Legítimo interesse do controlador (Art. 7º, IX) |
| Avaliação (nome, comentário, estrelas) | Exibição pública de avaliações para auxiliar outros usuários na avaliação do app | Consentimento expresso do titular (Art. 7º, I) — concedido ao clicar em "Enviar avaliação" |

---

## 5. Com quem compartilhamos

| Destinatário | Dado | Finalidade | País |
|---|---|---|---|
| Supabase Inc. (operador) | Pings anônimos, avaliações | Hospedagem do banco de dados compartilhado | EUA (adequação contratual SCCs) |
| GitHub Inc. (operador) | Código-fonte (público), `stats.json` | Hospedagem via GitHub Pages | EUA |

Nenhum dado é vendido, cedido ou compartilhado para fins publicitários.

---

## 6. Por quanto tempo guardamos

| Dado | Período de retenção |
|---|---|
| Pings diários (`app_pings`) | Indefinido (usados para contagem histórica); exclusão sob solicitação via e-mail |
| Avaliações | Indefinido enquanto o app estiver ativo; exclusão sob solicitação via e-mail |

---

## 7. Seus direitos (LGPD Art. 18)

Você tem direito a:

1. **Confirmação** da existência de tratamento
2. **Acesso** aos dados tratados
3. **Correção** de dados incompletos ou incorretos
4. **Anonimização, bloqueio ou eliminação** de dados desnecessários ou tratados em desconformidade
5. **Portabilidade** dos dados a outro fornecedor
6. **Eliminação** dos dados tratados com base em consentimento
7. **Informação** sobre compartilhamento com terceiros
8. **Informação** sobre a possibilidade de não fornecer consentimento e as consequências
9. **Revogação** do consentimento

Para exercer qualquer direito, envie e-mail para **marlongc25@protonmail.com** com o assunto "Direitos LGPD — MGC Finanças". Responderemos em até **15 dias úteis**.

---

## 8. Segurança dos dados

Medidas técnicas adotadas:

- Dados financeiros **nunca saem do seu dispositivo** (Camadas 2 e 3 sob controle exclusivo do usuário)
- Pings usam identificador aleatório — sem dados pessoais identificáveis
- Banco de dados do desenvolvedor usa Row Level Security (RLS) e restrições SQL
- Comunicação via HTTPS (GitHub Pages + Supabase)
- Código-fonte aberto para auditoria pública

Consulte [SECURITY.md](./SECURITY.md) para detalhes da política de segurança.

---

## 9. Transferência internacional

Os dados tratados pelo desenvolvedor (pings e avaliações) são armazenados nos servidores da **Supabase Inc.** (EUA) e **GitHub Inc.** (EUA), com base em cláusulas contratuais padrão (SCCs) compatíveis com o [Art. 33 da LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm#art33).

---

## 10. Alterações neste aviso

Mudanças materiais serão comunicadas via banner no próprio app. O histórico de versões está disponível no [CHANGELOG.md](./CHANGELOG.md). A data de última atualização consta no topo deste documento.

---

## 11. Contato e encarregado

**Canal de privacidade:** marlongc25@protonmail.com

Atuamos como ATPP (Agente de Tratamento de Pequeno Porte). A figura de Encarregado (DPO) formal é dispensada conforme [Resolução CD/ANPD nº 2/2022, Art. 4º](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022), mas o canal acima atende a todas as solicitações relacionadas a privacidade.

---

*© 2026 MGC Dev — Marlon Gomes da Costa · Projeto pessoal e independente*
