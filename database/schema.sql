-- ═══════════════════════════════════════════════════════════════════════════
--  AI Resume Analyzer — MySQL Schema
--  Run this ONCE to create all tables.
--  Usage: mysql -u root -p resume_analyzer < schema.sql
-- ═══════════════════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS resume_analyzer
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE resume_analyzer;

-- ── users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT          UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(60)  NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── resumes ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
  id             INT           UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT           UNSIGNED NOT NULL,
  original_name  VARCHAR(255)  NOT NULL,
  stored_name    VARCHAR(255)  NOT NULL,          -- UUID-based filename on disk
  file_path      VARCHAR(500)  NOT NULL,
  file_size      INT           UNSIGNED NOT NULL, -- bytes
  extracted_text LONGTEXT,                        -- raw text from pdf-parse
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_resumes_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_resumes_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── analyses ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analyses (
  id              INT          UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  resume_id       INT          UNSIGNED NOT NULL,
  user_id         INT          UNSIGNED NOT NULL,
  ats_score       TINYINT      UNSIGNED NOT NULL DEFAULT 0,  -- 0-100
  skills          JSON,                                       -- ["React","Node.js",...]
  job_roles       JSON,                                       -- [{"role":"...","matchScore":80},...]
  missing_skills  JSON,                                       -- ["Docker","Kubernetes",...]
  summary         TEXT,                                       -- 2-3 sentence AI summary
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_analyses_resume FOREIGN KEY (resume_id)
    REFERENCES resumes(id) ON DELETE CASCADE,
  CONSTRAINT fk_analyses_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_analyses_user      (user_id),
  INDEX idx_analyses_resume    (resume_id),
  INDEX idx_analyses_created   (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── interview_questions ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_questions (
  id           INT          UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  analysis_id  INT          UNSIGNED NOT NULL,
  question     TEXT         NOT NULL,
  category     VARCHAR(50)  NOT NULL DEFAULT 'General',   -- Behavioral | Technical | etc.
  difficulty   VARCHAR(20)  NOT NULL DEFAULT 'Medium',    -- Easy | Medium | Hard
  CONSTRAINT fk_iq_analysis FOREIGN KEY (analysis_id)
    REFERENCES analyses(id) ON DELETE CASCADE,
  INDEX idx_iq_analysis (analysis_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- resume_builds: saved builder/editor versions
CREATE TABLE IF NOT EXISTS resume_builds (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id          INT UNSIGNED NOT NULL,
  source_resume_id INT UNSIGNED NULL,
  title            VARCHAR(120) NOT NULL,
  template_id      VARCHAR(40) NOT NULL DEFAULT 'classic',
  content          JSON NOT NULL,
  is_favorite      TINYINT(1) NOT NULL DEFAULT 0,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_resume_builds_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_resume_builds_source_resume FOREIGN KEY (source_resume_id)
    REFERENCES resumes(id) ON DELETE SET NULL,
  INDEX idx_resume_builds_user_updated (user_id, updated_at),
  INDEX idx_resume_builds_source_resume (source_resume_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- resume_templates: ATS-friendly templates available to all users
CREATE TABLE IF NOT EXISTS resume_templates (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  template_id VARCHAR(60) NOT NULL UNIQUE,
  name        VARCHAR(120) NOT NULL,
  category    VARCHAR(60) NOT NULL DEFAULT 'ATS',
  accent      VARCHAR(20) NOT NULL DEFAULT '#4f46e5',
  description VARCHAR(255) NOT NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_resume_templates_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO resume_templates (template_id, name, category, accent, description)
VALUES
  ('modern-developer', 'Modern Developer Template', 'Developer', '#2563eb', 'Technical layout with project depth, tools, and measurable engineering impact.'),
  ('professional-corporate', 'Professional Corporate Template', 'Corporate', '#4f46e5', 'Executive ATS layout for business, operations, and leadership roles.'),
  ('minimal-ats', 'Minimal ATS Template', 'ATS', '#111827', 'Dense parser-friendly one-page layout with minimal decoration.'),
  ('creative-portfolio', 'Creative Portfolio Template', 'Portfolio', '#be185d', 'Polished portfolio layout that still keeps headings and keywords ATS-readable.')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  category = VALUES(category),
  accent = VALUES(accent),
  description = VALUES(description),
  is_active = 1;

-- resume_versions: canonical saved builder/editor/tailored versions
CREATE TABLE IF NOT EXISTS resume_versions (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           INT UNSIGNED NOT NULL,
  source_resume_id  INT UNSIGNED NULL,
  parent_version_id INT UNSIGNED NULL,
  title             VARCHAR(120) NOT NULL,
  template_id       VARCHAR(60) NOT NULL DEFAULT 'minimal-ats',
  content           JSON NOT NULL,
  section_order     JSON NOT NULL,
  job_description   LONGTEXT NULL,
  tailoring_notes   JSON NULL,
  ats_before        TINYINT UNSIGNED NULL,
  ats_after         TINYINT UNSIGNED NULL,
  is_tailored       TINYINT(1) NOT NULL DEFAULT 0,
  is_favorite       TINYINT(1) NOT NULL DEFAULT 0,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_resume_versions_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_resume_versions_source_resume FOREIGN KEY (source_resume_id)
    REFERENCES resumes(id) ON DELETE SET NULL,
  CONSTRAINT fk_resume_versions_parent FOREIGN KEY (parent_version_id)
    REFERENCES resume_versions(id) ON DELETE SET NULL,
  INDEX idx_resume_versions_user_updated (user_id, updated_at),
  INDEX idx_resume_versions_source_resume (source_resume_id),
  INDEX idx_resume_versions_parent (parent_version_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
