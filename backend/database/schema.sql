CREATE DATABASE IF NOT EXISTS growth_navigator
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE growth_navigator;

CREATE TABLE IF NOT EXISTS admins (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  google_email VARCHAR(180) NOT NULL UNIQUE,
  name VARCHAR(180) NULL,
  picture_url TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(220) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  content LONGTEXT NOT NULL,
  category ENUM('GTM', 'ICP', 'Oferta', 'Sales', 'Growth', 'IA') NOT NULL DEFAULT 'GTM',
  tags_json TEXT NULL,
  read_time VARCHAR(40) NOT NULL DEFAULT '5 min',
  editor_font ENUM('theme', 'arial', 'georgia', 'times') NOT NULL DEFAULT 'theme',
  editor_font_size INT UNSIGNED NOT NULL DEFAULT 18,
  editor_line_height DECIMAL(4,2) NOT NULL DEFAULT 1.15,
  paragraph_space_before INT UNSIGNED NOT NULL DEFAULT 8,
  paragraph_space_after INT UNSIGNED NOT NULL DEFAULT 12,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  published_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_blog_posts_published_date (is_published, published_at),
  INDEX idx_blog_posts_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS materials (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  type ENUM('Livro', 'E-book', 'Framework', 'Guia Estratégico', 'Pesquisa', 'Apresentação', 'Estudo Exclusivo') NOT NULL DEFAULT 'Livro',
  slug VARCHAR(220) NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  tags_json TEXT NULL,
  cover_image LONGTEXT NULL,
  href TEXT NULL,
  cta_label VARCHAR(120) NOT NULL DEFAULT 'Acessar material',
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_materials_published (is_published),
  INDEX idx_materials_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  email VARCHAR(180) NOT NULL,
  phone VARCHAR(60) NULL,
  message TEXT NULL,
  service VARCHAR(180) NULL,
  source VARCHAR(120) NOT NULL DEFAULT 'site',
  status ENUM('novo', 'contatado', 'convertido', 'descartado') NOT NULL DEFAULT 'novo',
  crm_synced TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_leads_email (email),
  INDEX idx_leads_status (status),
  INDEX idx_leads_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  source VARCHAR(120) NOT NULL DEFAULT 'newsletter',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(120) NOT NULL UNIQUE,
  setting_value LONGTEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO admins (google_email, name)
VALUES ('guilherme.pubmkt@gmail.com', 'Guilherme Correia')
ON DUPLICATE KEY UPDATE name = VALUES(name);
