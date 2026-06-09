USE resume_analyzer;

CREATE TABLE IF NOT EXISTS resume_rewrites (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED NOT NULL,
  resume_id           INT UNSIGNED NOT NULL,
  analysis_id         INT UNSIGNED NULL,
  original_content    LONGTEXT NOT NULL,
  rewritten_content   JSON NOT NULL,
  improvement_summary JSON NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_resume_rewrites_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_resume_rewrites_resume FOREIGN KEY (resume_id)
    REFERENCES resumes(id) ON DELETE CASCADE,
  CONSTRAINT fk_resume_rewrites_analysis FOREIGN KEY (analysis_id)
    REFERENCES analyses(id) ON DELETE SET NULL,
  INDEX idx_resume_rewrites_user_created (user_id, created_at),
  INDEX idx_resume_rewrites_resume (resume_id),
  INDEX idx_resume_rewrites_analysis (analysis_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS resume_tailorings (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           INT UNSIGNED NOT NULL,
  resume_id         INT UNSIGNED NOT NULL,
  job_title         VARCHAR(180) NOT NULL DEFAULT 'Target Role',
  company_name      VARCHAR(180) NULL,
  job_description   LONGTEXT NOT NULL,
  ats_before        TINYINT UNSIGNED NULL,
  ats_after         TINYINT UNSIGNED NULL,
  keywords_added    JSON NULL,
  keywords_missing  JSON NULL,
  tailored_resume   JSON NOT NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_resume_tailorings_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_resume_tailorings_resume FOREIGN KEY (resume_id)
    REFERENCES resumes(id) ON DELETE CASCADE,
  INDEX idx_resume_tailorings_user_created (user_id, created_at),
  INDEX idx_resume_tailorings_resume (resume_id),
  INDEX idx_resume_tailorings_company (company_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS job_matches (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED NOT NULL,
  resume_id           INT UNSIGNED NOT NULL,
  job_description     LONGTEXT NOT NULL,
  job_title           VARCHAR(180) NOT NULL DEFAULT 'Target Role',
  match_score         TINYINT UNSIGNED NOT NULL DEFAULT 0,
  matched_keywords    JSON NULL,
  missing_keywords    JSON NULL,
  strengths           JSON NULL,
  weaknesses          JSON NULL,
  improvements        JSON NULL,
  interview_questions JSON NULL,
  summary             TEXT NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_job_matches_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_job_matches_resume FOREIGN KEY (resume_id)
    REFERENCES resumes(id) ON DELETE CASCADE,
  INDEX idx_job_matches_user_created (user_id, created_at),
  INDEX idx_job_matches_resume (resume_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS interview_sessions (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  resume_id      INT UNSIGNED NOT NULL,
  job_match_id   INT UNSIGNED NULL,
  session_type   VARCHAR(60) NOT NULL DEFAULT 'Resume-Based',
  overall_score  DECIMAL(4,1) NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_interview_sessions_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_interview_sessions_resume FOREIGN KEY (resume_id)
    REFERENCES resumes(id) ON DELETE CASCADE,
  CONSTRAINT fk_interview_sessions_job_match FOREIGN KEY (job_match_id)
    REFERENCES job_matches(id) ON DELETE SET NULL,
  INDEX idx_interview_sessions_user_created (user_id, created_at),
  INDEX idx_interview_sessions_resume (resume_id),
  INDEX idx_interview_sessions_job_match (job_match_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS interview_answers (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id      INT UNSIGNED NOT NULL,
  question        TEXT NOT NULL,
  user_answer     LONGTEXT NOT NULL,
  score           DECIMAL(4,1) NOT NULL DEFAULT 0,
  feedback        JSON NULL,
  improved_answer LONGTEXT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_interview_answers_session FOREIGN KEY (session_id)
    REFERENCES interview_sessions(id) ON DELETE CASCADE,
  INDEX idx_interview_answers_session_created (session_id, created_at),
  INDEX idx_interview_answers_score (score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
