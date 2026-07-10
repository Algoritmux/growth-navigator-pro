-- Migration: add download/access fields to materials.
-- Apply this SQL to the production database before deploying the
-- material download/admin changes.

ALTER TABLE materials
  ADD COLUMN access_type VARCHAR(20) NOT NULL DEFAULT 'free' AFTER cta_label,
  ADD COLUMN has_download TINYINT(1) NOT NULL DEFAULT 0 AFTER access_type,
  ADD COLUMN download_url VARCHAR(500) NULL AFTER has_download,
  ADD COLUMN download_button_label VARCHAR(100) NOT NULL DEFAULT 'Download' AFTER download_url;
