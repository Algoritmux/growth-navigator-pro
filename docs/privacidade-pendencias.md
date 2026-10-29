# Política de Privacidade: pendências para validação

A página `/privacidade` (`src/pages/PrivacyPage.tsx`) é uma **versão preliminar**.
Enquanto `PRIVACY_POLICY_DRAFT = true`, ela mostra o aviso "Versão preliminar" e
fica com `noindex`. Depois da revisão jurídica, mude para `false` e atualize
`PRIVACY_POLICY_UPDATED_AT`.

Se a revisão mudar o uso de cookies, aumente `CONSENT_VERSION` em
`src/lib/consent.ts` **e** no script `gc-consent-bootstrap` do `index.html`
(o teste `src/lib/consent.test.ts` confere se os dois batem). Todos os
visitantes serão perguntados de novo.

## Pendências

| # | Ponto | O que está no texto hoje | O que precisa ser decidido |
|---|---|---|---|
| 1 | Retenção da newsletter e do CRM | "Prazo em definição" | Prazo ou critério de conservação |
| 2 | Retenção dos contatos comerciais | "6 meses" | A partir de quando conta (data do envio, último contato?) e o processo para eliminar ou anonimizar ao fim do prazo. Hoje não existe rotina de exclusão. |
| 3 | Encarregado (DPO) | Atendimento pela Algoritmux no e-mail de contato, sem nome | Se a Algoritmux é dispensada da indicação formal (agente de tratamento de pequeno porte) ou se precisa indicar um encarregado |
| 4 | Servidores e transferência internacional | "Alguns fornecedores, como o Google, podem tratar dados fora do Brasil" | Localização do servidor da HostGator e do Listmonk; hipótese legal de transferência |
| 5 | Fornecedores | Hospedagem (HostGator), "ferramentas de envio de e-mails e newsletter", Google Analytics, Google Fonts | Nome do serviço SMTP e onde o Listmonk está hospedado; se ambos estão ativos em produção (os arquivos de exemplo vêm com `enabled => false`) |
| 6 | Bases legais | Contato: art. 7º, V. CRM: art. 7º, IX. Marketing e cookies analíticos: art. 7º, I. Registros técnicos: art. 7º, II e IX | Confirmar cada base. Se o CRM usar legítimo interesse, documentar a avaliação (LIA) |
| 7 | Registros técnicos de acesso | Mencionados de forma genérica | Prazo de guarda (o Marco Civil da Internet, art. 15, trata de registros de acesso a aplicações) |
| 8 | Cancelamento da newsletter | "Link de cancelamento nos e-mails" | Garantir que todo envio inclua o link (modelos do Listmonk) e que o pedido por e-mail seja atendido |
| 9 | Retenção no Google Analytics | Não informada | Conferir o período de retenção configurado no GA4 (Admin → Coleta e retenção de dados) e incluir no texto |
| 10 | Google Fonts | Informado como fornecedor | Opcional: hospedar a fonte Inter no próprio site para não enviar o IP ao Google |

## O que já está implementado

- GA4 em Consent Mode v2 básico: o `gtag.js` só é baixado após o aceite.
- Aviso de cookies com "Aceitar" e "Recusar" do mesmo tamanho, sem opção pré-marcada.
- "Preferências de cookies" no rodapé e no fim das páginas sem rodapé.
- Retirada do consentimento: desliga o GA4, apaga `_ga*` e a atribuição.
- Opção de marketing separada e desmarcada nos formulários de contato e de materiais.
- Aviso de privacidade nos 4 formulários.
- Script de login do Google carregado só em `/login`.
