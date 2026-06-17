-- ═══════════════════════════════════════════════════════════════════════════
--  AI Resume Analyzer — PostgreSQL Schema (Neon)
--  Converted from MySQL schema.sql
--
--  Usage:
--    1. Create a database in your Neon project (or use the default "neondb")
--    2. Run this file against it via the Neon SQL editor, or:
--         psql "$DATABASE_URL" -f schema.sql
--
--  KEY DIFFERENCES FROM THE MYSQL VERSION:
--   • No CREATE DATABASE / USE — Neon databases are created in the dashboard
--   • INT UNSIGNED AUTO_INCREMENT      → SERIAL / GENERATED ALWAYS AS IDENTITY
--   • TINYINT UNSIGNED                 → SMALLINT
--   • TINYINT(1)                       → BOOLEAN
--   • LONGTEXT                         → TEXT (Postgres TEXT has no length cap)
--   • JSON                             → JSONB (binary JSON — faster, indexable)
--   • ENGINE=InnoDB DEFAULT CHARSET=.. → removed entirely (not a Postgres concept)
--   • INDEX name (col) inline          → separate CREATE INDEX statements
--   • ON UPDATE CURRENT_TIMESTAMP      → trigger function (see bottom of file)
--   • ON DUPLICATE KEY UPDATE          → ON CONFLICT (...) DO UPDATE SET ...
--   • ORDER BY FIELD(...)              → ORDER BY CASE ... END
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────
--  Reusable trigger function for auto-updating `updated_at` columns.
--  MySQL did this automatically with "ON UPDATE CURRENT_TIMESTAMP".
--  Postgres has no built-in equivalent, so every table that needs it
--  gets a BEFORE UPDATE trigger calling this same function.
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ── users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL       PRIMARY KEY,
  name          VARCHAR(60)  NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── resumes ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
  id             SERIAL       PRIMARY KEY,
  user_id        INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_name  VARCHAR(255) NOT NULL,
  stored_name    VARCHAR(255) NOT NULL,          -- UUID-based filename on disk
  file_path      VARCHAR(500) NOT NULL,
  file_size      INTEGER      NOT NULL,          -- bytes
  extracted_text TEXT,                           -- raw text from pdf-parse
  created_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes (user_id);


-- ── analyses ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analyses (
  id              SERIAL       PRIMARY KEY,
  resume_id       INTEGER      NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  user_id         INTEGER      NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  ats_score       SMALLINT     NOT NULL DEFAULT 0,   -- 0-100
  skills          JSONB,                              -- ["React","Node.js",...]
  job_roles       JSONB,                              -- [{"role":"...","matchScore":80},...]
  missing_skills  JSONB,                              -- ["Docker","Kubernetes",...]
  summary         TEXT,                               -- 2-3 sentence AI summary
  ai_provider     VARCHAR(50),                         -- e.g. "gemini" | "mock"
  created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analyses_user    ON analyses (user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_resume  ON analyses (resume_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created ON analyses (created_at);


-- ── interview_questions ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_questions (
  id           SERIAL      PRIMARY KEY,
  analysis_id  INTEGER     NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  question     TEXT        NOT NULL,
  category     VARCHAR(50) NOT NULL DEFAULT 'General',  -- Behavioral | Technical | etc.
  difficulty   VARCHAR(20) NOT NULL DEFAULT 'Medium'     -- Easy | Medium | Hard
);

CREATE INDEX IF NOT EXISTS idx_iq_analysis ON interview_questions (analysis_id);


-- ── resume_templates ───────────────────────────────────────────────────────
-- ATS-friendly templates available to all users
CREATE TABLE IF NOT EXISTS resume_templates (
  id          SERIAL       PRIMARY KEY,
  template_id VARCHAR(60)  NOT NULL UNIQUE,
  name        VARCHAR(120) NOT NULL,
  category    VARCHAR(60)  NOT NULL DEFAULT 'ATS',
  accent      VARCHAR(20)  NOT NULL DEFAULT '#4f46e5',
  description VARCHAR(255) NOT NULL,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resume_templates_active ON resume_templates (is_active);

DROP TRIGGER IF EXISTS trg_resume_templates_updated_at ON resume_templates;
CREATE TRIGGER trg_resume_templates_updated_at
  BEFORE UPDATE ON resume_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed default templates.
-- MySQL used "ON DUPLICATE KEY UPDATE" — Postgres equivalent is "ON CONFLICT ... DO UPDATE".
INSERT INTO resume_templates (template_id, name, category, accent, description)
VALUES
  ('modern-developer',       'Modern Developer Template',       'Developer', '#2563eb', 'Technical layout with project depth, tools, and measurable engineering impact.'),
  ('professional-corporate', 'Professional Corporate Template', 'Corporate', '#4f46e5', 'Executive ATS layout for business, operations, and leadership roles.'),
  ('minimal-ats',            'Minimal ATS Template',            'ATS',       '#111827', 'Dense parser-friendly one-page layout with minimal decoration.'),
  ('creative-portfolio',     'Creative Portfolio Template',     'Portfolio', '#be185d', 'Polished portfolio layout that still keeps headings and keywords ATS-readable.')
ON CONFLICT (template_id) DO UPDATE SET
  name        = EXCLUDED.name,
  category    = EXCLUDED.category,
  accent      = EXCLUDED.accent,
  description = EXCLUDED.description,
  is_active   = TRUE;


-- ── resume_versions ────────────────────────────────────────────────────────
-- Canonical saved builder/editor/tailored versions
CREATE TABLE IF NOT EXISTS resume_versions (
  id                SERIAL       PRIMARY KEY,
  user_id           INTEGER      NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  source_resume_id  INTEGER      REFERENCES resumes(id)          ON DELETE SET NULL,
  parent_version_id INTEGER      REFERENCES resume_versions(id)  ON DELETE SET NULL,
  title             VARCHAR(120) NOT NULL,
  template_id       VARCHAR(60)  NOT NULL DEFAULT 'minimal-ats',
  content           JSONB        NOT NULL,
  section_order     JSONB        NOT NULL,
  job_description   TEXT,
  tailoring_notes   JSONB,
  ats_before        SMALLINT,
  ats_after         SMALLINT,
  is_tailored       BOOLEAN      NOT NULL DEFAULT FALSE,
  is_favorite       BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resume_versions_user_updated   ON resume_versions (user_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_resume_versions_source_resume  ON resume_versions (source_resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_parent         ON resume_versions (parent_version_id);

DROP TRIGGER IF EXISTS trg_resume_versions_updated_at ON resume_versions;
CREATE TRIGGER trg_resume_versions_updated_at
  BEFORE UPDATE ON resume_versions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── resume_rewrites ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resume_rewrites (
  id                  SERIAL    PRIMARY KEY,
  user_id             INTEGER   NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  resume_id           INTEGER   NOT NULL REFERENCES resumes(id)  ON DELETE CASCADE,
  analysis_id         INTEGER   REFERENCES analyses(id)          ON DELETE SET NULL,
  original_content    TEXT      NOT NULL,
  rewritten_content   JSONB     NOT NULL,
  improvement_summary JSONB,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resume_rewrites_user_created ON resume_rewrites (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_resume_rewrites_resume       ON resume_rewrites (resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_rewrites_analysis     ON resume_rewrites (analysis_id);


-- ── resume_tailorings ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resume_tailorings (
  id                SERIAL       PRIMARY KEY,
  user_id           INTEGER      NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  resume_id         INTEGER      NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  job_title         VARCHAR(180) NOT NULL DEFAULT 'Target Role',
  company_name      VARCHAR(180),
  job_description   TEXT         NOT NULL,
  ats_before        SMALLINT,
  ats_after         SMALLINT,
  keywords_added    JSONB,
  keywords_missing  JSONB,
  tailored_resume   JSONB        NOT NULL,
  created_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resume_tailorings_user_created ON resume_tailorings (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_resume_tailorings_resume       ON resume_tailorings (resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_tailorings_company      ON resume_tailorings (company_name);


-- ── job_matches ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_matches (
  id                  SERIAL       PRIMARY KEY,
  user_id             INTEGER      NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  resume_id           INTEGER      NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  job_description     TEXT         NOT NULL,
  job_title           VARCHAR(180) NOT NULL DEFAULT 'Target Role',
  match_score         SMALLINT     NOT NULL DEFAULT 0,
  matched_keywords    JSONB,
  missing_keywords    JSONB,
  strengths           JSONB,
  weaknesses          JSONB,
  improvements        JSONB,
  interview_questions JSONB,
  summary             TEXT,
  created_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_matches_user_created ON job_matches (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_job_matches_resume       ON job_matches (resume_id);


-- ── interview_sessions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_sessions (
  id             SERIAL       PRIMARY KEY,
  user_id        INTEGER      NOT NULL REFERENCES users(id)       ON DELETE CASCADE,
  resume_id      INTEGER      NOT NULL REFERENCES resumes(id)     ON DELETE CASCADE,
  job_match_id   INTEGER      REFERENCES job_matches(id)          ON DELETE SET NULL,
  session_type   VARCHAR(60)  NOT NULL DEFAULT 'Resume-Based',
  overall_score  DECIMAL(4,1),
  created_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_created ON interview_sessions (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_resume       ON interview_sessions (resume_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_job_match    ON interview_sessions (job_match_id);


-- ── interview_answers ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_answers (
  id              SERIAL    PRIMARY KEY,
  session_id      INTEGER   NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  question        TEXT      NOT NULL,
  user_answer     TEXT      NOT NULL,
  score           DECIMAL(4,1) NOT NULL DEFAULT 0,
  feedback        JSONB,
  improved_answer TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interview_answers_session_created ON interview_answers (session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_interview_answers_score           ON interview_answers (score);


-- ═══════════════════════════════════════════════════════════════════════════
--  Verification queries — run these after the script finishes to confirm
--  everything was created correctly.
-- ═══════════════════════════════════════════════════════════════════════════
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;