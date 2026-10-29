-- Migration: opção de marketing separada nos leads (Fase 2.1 - LGPD).
-- Aplique no banco de produção antes ou logo depois do deploy da Fase 2.1.
-- Antes da migração, o site continua salvando leads normalmente e registra a
-- escolha de marketing no texto da mensagem (ver backend/api/leads/create.php).

ALTER TABLE leads
  ADD COLUMN marketing_opt_in TINYINT(1) NOT NULL DEFAULT 0 AFTER source,
  ADD COLUMN marketing_opt_in_at DATETIME NULL AFTER marketing_opt_in;

-- Leads anteriores ficam com marketing_opt_in = 0: não houve opção específica
-- de marketing quando foram enviados.
