# Migration Guide: MySQL (Aiven) → PostgreSQL (Neon)

This document records exactly what changed when this project moved from MySQL to PostgreSQL, and the steps to apply that migration to a running deployment. Keep this file for reference even after the migration is complete — it explains *why* certain code looks the way it does.

## Why this migration happened

The project originally used MySQL hosted on Aiven. It was migrated to PostgreSQL hosted on Neon for serverless scaling and a generous free tier. The application's architecture made this migration contained and low-risk: every SQL query lives inside the `backend/models/` folder. Controllers, services, and routes never touch SQL directly — they only call model functions. As a result, only 12 backend files plus the schema needed to change.

## Files changed

| File | Type of change |
|---|---|
| `backend/config/db.js` | Full rewrite — `mysql2` Pool → `pg` Pool |
| `backend/package.json` | Removed `mysql2` dependency (`pg` was already present) |
| `backend/.env` | Replaced discrete `DB_HOST/PORT/USER/PASSWORD/NAME` vars with a single `DATABASE_URL` |
| `database/schema.sql` | Full rewrite — all 11 tables converted to Postgres syntax and types |
| `backend/models/User.js` | Syntax conversion |
| `backend/models/Resume.js` | Syntax conversion |
| `backend/models/Analysis.js` | Syntax conversion + logic rewrite (bulk insert) |
| `backend/models/JobMatch.js` | Syntax conversion |
| `backend/models/ResumeBuild.js` | Syntax conversion + boolean type fix |
| `backend/models/ResumeTemplate.js` | Syntax conversion + logic rewrite (upsert, custom ordering) + bug fix (case-sensitive alias) |
| `backend/models/ResumeRewrite.js` | Syntax conversion |
| `backend/models/ResumeTailoring.js` | Syntax conversion |
| `backend/models/InterviewSession.js` | Syntax conversion + numeric type safety |
| `backend/models/InterviewAnswer.js` | Syntax conversion |
| `database/2026_06_05_career_prep_features.sql` | **Deleted** — fully redundant, already merged into `schema.sql` |

## Universal syntax changes (applied to all 10 model files)

These four patterns appear dozens of times across the codebase and were mechanically applied everywhere:

### 1. Placeholders

```js
// MySQL
"INSERT INTO users (name, email) VALUES (?, ?)"

// Postgres
"INSERT INTO users (name, email) VALUES ($1, $2)"
```

### 2. Result destructuring

```js
// MySQL (mysql2 returns an array tuple)
const [rows] = await pool.execute("SELECT * FROM users");

// Postgres (pg returns an object)
const { rows } = await pool.query("SELECT * FROM users");
```

### 3. Getting the new row's ID after an INSERT

```js
// MySQL
const [result] = await pool.execute("INSERT INTO users (...) VALUES (...)");
return result.insertId;

// Postgres — there is no insertId. Add RETURNING to the query instead.
const { rows } = await pool.query("INSERT INTO users (...) VALUES (...) RETURNING id");
return rows[0].id;
```

### 4. Checking how many rows were affected (UPDATE/DELETE)

```js
// MySQL
const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [id]);
return result.affectedRows > 0;

// Postgres
const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
return result.rowCount > 0;
```

## Schema type mapping

| MySQL type | Postgres type | Notes |
|---|---|---|
| `INT UNSIGNED AUTO_INCREMENT` | `SERIAL` | Postgres has no `UNSIGNED`; `SERIAL` handles auto-increment |
| `TINYINT UNSIGNED` | `SMALLINT` | Used for scores like `ats_score`, `match_score` (0-100) |
| `TINYINT(1)` | `BOOLEAN` | Used for `is_favorite`, `is_tailored`, `is_active` — pass `true`/`false` or `Boolean(x)` from JS, not `1`/`0` |
| `LONGTEXT` | `TEXT` | Postgres `TEXT` has no length cap, same as `LONGTEXT` |
| `JSON` | `JSONB` | `JSONB` is binary-stored, faster to query, and indexable — strictly an upgrade |
| `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4` | *(removed)* | Not a Postgres concept |
| `INDEX name (col)` inline in `CREATE TABLE` | `CREATE INDEX name ON table (col);` as a separate statement | Postgres doesn't support inline named indexes in `CREATE TABLE` |
| `ON UPDATE CURRENT_TIMESTAMP` | A `BEFORE UPDATE` trigger calling `set_updated_at()` | Postgres has no built-in auto-update-timestamp; see the trigger function at the top of `schema.sql` |

## The two queries that needed real logic changes (not just syntax)

### `Analysis.saveQuestions()` — bulk insert

MySQL's `mysql2` driver has a convenience feature where passing a nested array to a `VALUES ?` placeholder auto-expands it into multiple rows:

```js
// MySQL — mysql2 expands `values` (an array of arrays) automatically
await pool.query("INSERT INTO interview_questions (...) VALUES ?", [values]);
```

`pg` has no equivalent. The Postgres version manually builds the placeholder string and flattens the values array:

```js
// Postgres — build "($1,$2,$3,$4), ($5,$6,$7,$8), ..." manually
const placeholders = questions.map((_, i) => {
  const base = i * 4;
  return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
}).join(", ");

const flatValues = questions.flatMap((q) => [analysisId, q.question, q.category, q.difficulty]);

await pool.query(`INSERT INTO interview_questions (...) VALUES ${placeholders}`, flatValues);
```

### `ResumeTemplate.seedDefaults()` and `findActive()` — upsert and custom ordering

**Upsert:** MySQL's `ON DUPLICATE KEY UPDATE` became Postgres' `ON CONFLICT (column) DO UPDATE SET`:

```sql
-- MySQL
INSERT INTO resume_templates (template_id, name) VALUES (?, ?)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Postgres
INSERT INTO resume_templates (template_id, name) VALUES ($1, $2)
ON CONFLICT (template_id) DO UPDATE SET name = EXCLUDED.name;
```

**Custom ordering:** MySQL's `ORDER BY FIELD(...)` is a MySQL-only function with no direct Postgres equivalent. It was replaced with a `CASE` expression:

```sql
-- MySQL
ORDER BY FIELD(template_id, 'modern-developer', 'professional-corporate', 'minimal-ats', 'creative-portfolio')

-- Postgres
ORDER BY CASE template_id
  WHEN 'modern-developer'       THEN 1
  WHEN 'professional-corporate' THEN 2
  WHEN 'minimal-ats'            THEN 3
  WHEN 'creative-portfolio'     THEN 4
  ELSE 5
END
```

## Bugs caught and fixed during the conversion

These weren't simple syntax swaps — they were genuine bugs that the migration surfaced and fixed:

### 1. Case-sensitive column alias in `ResumeTemplate.findActive()`

Postgres lowercases all unquoted identifiers, including aliases. The original query aliased a column as `templateId` (camelCase), which Postgres would have silently returned as `templateid` (lowercase) — breaking the frontend, which expects camelCase. Fixed by quoting the alias:

```sql
-- Before (would break in Postgres)
SELECT template_id AS templateId FROM resume_templates;

-- After (preserves camelCase)
SELECT template_id AS "templateId" FROM resume_templates;
```

### 2. Aggregate functions returning strings instead of numbers

Postgres' `COUNT()`, `AVG()`, and `MAX()` return string-typed values by default (e.g. `"3"` instead of `3`). Several dashboard endpoints send these values straight to the frontend as JSON. Without an explicit cast, the frontend would receive stringified numbers. Fixed by wrapping every aggregate result in `Number()` before returning it, in:
- `Analysis.countByUserId()`
- `JobMatch.countByUserId()`
- `ResumeRewrite.countByUserId()`
- `InterviewSession.countByUserId()`
- `InterviewSession.statsByUserId()` (covers `total`, `average_score`, `best_score`)

## How to apply this migration to your own deployment

1. **Create the Neon database.** Sign up at [neon.tech](https://neon.tech), create a project, and copy the pooled connection string.
2. **Run the new schema.** Execute `database/schema.sql` against your Neon database via `psql "$DATABASE_URL" -f database/schema.sql` or the Neon SQL Editor.
3. **Replace the 12 backend files** listed in the table above with their converted versions.
4. **Update `backend/.env`** — remove the `DB_HOST/PORT/USER/PASSWORD/NAME` variables and add a single `DATABASE_URL` variable pointing to Neon.
5. **Update `backend/package.json`** — remove `mysql2` from dependencies (keep `pg`).
6. **Run `npm install`** inside `backend/` to apply the dependency change.
7. **Delete `database/2026_06_05_career_prep_features.sql`** — it's redundant now.
8. **Rotate your secrets.** If your old `.env` values (JWT secret, Gemini API key, database password) were ever shared, copied into a chat, or committed to a public repo, generate new ones before going live.
9. **Start the backend** and confirm you see `✅ PostgreSQL (Neon) connected successfully` in the console.
10. **Run through the manual test flow** in the main `README.md` to confirm every feature still works end-to-end (register, login, upload, analyze, rewrite, tailor, job match, interview, dashboard).

## Verifying the migration worked

Run these checks after switching everything over:

```bash
# Confirm all 11 tables exist
psql "$DATABASE_URL" -c "\dt"

# Confirm the 4 default resume templates were seeded
psql "$DATABASE_URL" -c "SELECT template_id, name FROM resume_templates;"

# Confirm JSONB columns are actually JSONB, not JSON or TEXT
psql "$DATABASE_URL" -c "\d analyses"
```

In the running app, register a fresh test account and walk through the full manual test flow from the main README. Pay particular attention to:
- Dashboard stat cards (should show real numbers, not `"3"` with quotes visible anywhere in dev tools' Network tab)
- Resume Builder template picker (should display all 4 templates correctly, confirming the `templateId` alias fix worked)
- Mock interview stats page (average/best score should render as numbers, not `null` or strings)