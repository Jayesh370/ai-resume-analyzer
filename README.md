# ResumeAI - AI Resume Analyzer & Career Preparation Platform

ResumeAI is a full-stack career preparation platform that helps users analyze resumes, improve ATS performance, tailor resumes to job descriptions, build resume versions, match jobs, and practice mock interviews with AI feedback.

## Features

- JWT authentication with protected user workflows
- PDF resume upload and text extraction
- AI resume analysis with ATS score, detected skills, missing skills, role matches, and interview questions
- Resume Builder with version history and ATS-friendly templates
- AI Resume Rewriter with original text, improved text, and reason for improvement
- Resume Tailoring Engine for job descriptions and target companies
- Automatic tailored resume version creation
- Job Match analysis with matched and missing keywords plus role-fit scoring
- AI Mock Interview system with session types, answer scoring, feedback, and improved answers
- Dashboard analytics with ATS trends, job match trends, rewrite counts, tailoring counts, and interview scores
- Gemini AI with retry and fallback behavior so AI failures do not crash the app

## Tech Stack

Frontend:

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Recharts
- Lucide React
- Framer Motion

Backend:

- Node.js
- Express.js
- JWT Authentication
- PostgreSQL via `pg`
- Multer
- PDF parsing
- Gemini AI

Deployment targets:

- Frontend: Vercel
- Backend: Render
- Database: Neon (Serverless PostgreSQL)

> **Migration note:** This project was originally built on MySQL (Aiven) and has been migrated to PostgreSQL (Neon). Every model file, the schema, and the connection layer were converted — see [Database Tables](#database-tables) and [Local Setup](#local-setup) below for the Postgres-specific steps.

## Project Structure

```text
ai-resume-analyzer/
|-- backend/
|   |-- config/
|   |   `-- db.js
|   |-- controllers/
|   |   |-- analysisController.js
|   |   |-- authController.js
|   |   |-- interviewController.js
|   |   |-- jobMatchController.js
|   |   |-- resumeBuilderController.js
|   |   |-- resumeController.js
|   |   |-- resumeRewriteController.js
|   |   |-- resumeTailoringController.js
|   |   `-- userController.js
|   |-- middleware/
|   |   |-- auth.js
|   |   |-- errorHandler.js
|   |   `-- upload.js
|   |-- models/
|   |   |-- Analysis.js
|   |   |-- InterviewAnswer.js
|   |   |-- InterviewSession.js
|   |   |-- JobMatch.js
|   |   |-- Resume.js
|   |   |-- ResumeBuild.js
|   |   |-- ResumeRewrite.js
|   |   |-- ResumeTailoring.js
|   |   |-- ResumeTemplate.js
|   |   `-- User.js
|   |-- routes/
|   |   |-- analysis.js
|   |   |-- auth.js
|   |   |-- interview.js
|   |   |-- jobMatch.js
|   |   |-- resume.js
|   |   |-- resumeBuilder.js
|   |   |-- resumeRewrite.js
|   |   |-- resumeTailoring.js
|   |   `-- user.js
|   |-- services/
|   |   |-- aiGenerationService.js
|   |   |-- aiService.js
|   |   |-- interviewService.js
|   |   |-- jobMatchService.js
|   |   |-- pdfService.js
|   |   |-- resumeBuilderService.js
|   |   |-- resumeRewriteService.js
|   |   `-- resumeTailoringService.js
|   |-- package.json
|   `-- server.js
|-- database/
|   `-- schema.sql
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   |   |-- AnalysisResult.jsx
|   |   |   |-- Dashboard.jsx
|   |   |   |-- InterviewDashboard.jsx
|   |   |   |-- JobMatch.jsx
|   |   |   |-- ResumeBuilder.jsx
|   |   |   |-- ResumeRewriter.jsx
|   |   |   |-- ResumeTailor.jsx
|   |   |   `-- ResumeTailoringEngine.jsx
|   |   |-- services/
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- package.json
|   `-- vite.config.js
`-- README.md
```

> Note: `database/2026_06_05_career_prep_features.sql` has been removed. Every table it created is already included in the consolidated `database/schema.sql`, so only one file is needed for a fresh setup now.

## Database Tables

Core tables:

- `users`
- `resumes`
- `analyses`
- `interview_questions`
- `job_matches`
- `resume_templates`
- `resume_versions`

Career-prep feature tables:

- `resume_rewrites`
- `resume_tailorings`
- `interview_sessions`
- `interview_answers`

All `JSON` columns from the original MySQL schema are now `JSONB` in Postgres (binary JSON — faster and indexable). All boolean flags (`is_favorite`, `is_tailored`, `is_active`) are native `BOOLEAN` instead of `TINYINT(1)`. `updated_at` columns are kept in sync automatically via a Postgres trigger (`set_updated_at()`), replacing MySQL's `ON UPDATE CURRENT_TIMESTAMP`.

For a fresh database, run the schema against your Neon connection string:

```bash
psql "$DATABASE_URL" -f database/schema.sql
```

Or paste the contents of `database/schema.sql` directly into the Neon SQL Editor in your project dashboard.

## Local Setup

### 1. Create a Neon Database

1. Sign up at [neon.tech](https://neon.tech) and create a new project.
2. In the project dashboard, open **Connection Details** and copy the **pooled connection string** (it looks like `postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require`).
3. Save it — you'll paste it into `backend/.env` as `DATABASE_URL` in the next step.
4. Run `database/schema.sql` against it (via `psql` or the Neon SQL Editor) to create all tables and seed the default resume templates.

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=postgresql://your_user:your_password@your-project.neon.tech/neondb?sslmode=require

JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173

MAX_FILE_SIZE_MB=5
UPLOAD_DIR=uploads
```

If `GEMINI_API_KEY` is not set, the app uses fallback or mock responses where available.

### 3. Start Backend

```bash
npm run dev
```

On a successful start you should see:

```text
✅ PostgreSQL (Neon) connected successfully
```

Backend URL:

```text
http://localhost:5000
```

Health check:

```text
GET /api/health
```

### 4. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 5. Start Frontend

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Main Frontend Routes

- `/` - landing page
- `/login` - login
- `/register` - registration
- `/dashboard` - analytics dashboard
- `/upload` - upload and analyze resume
- `/analysis/:id` - resume analysis report
- `/resume-rewriter/:analysisId` - AI Resume Rewriter
- `/resume-tailoring` - uploaded-resume tailoring engine
- `/resume-builder` - resume versions and builder
- `/resume-builder/:id` - resume version editor
- `/resume-builder/:id/tailor` - builder-based tailoring flow
- `/job-match` - job match analyzer
- `/job-match/:id` - job match result
- `/interviews` - AI Mock Interview dashboard
- `/history` - analysis history
- `/profile` - user profile

## Main API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Resumes

- `POST /api/resumes/upload`
- `GET /api/resumes`
- `DELETE /api/resumes/:id`

### Analyses

- `POST /api/analyses/run`
- `GET /api/analyses`
- `GET /api/analyses/dashboard`
- `GET /api/analyses/:id`
- `DELETE /api/analyses/:id`

### Resume Rewriter

- `POST /api/resume-rewrites/run`
- `GET /api/resume-rewrites`
- `GET /api/resume-rewrites/:id`
- `POST /api/resume-rewrites/:id/save-version`

### Resume Tailoring

- `POST /api/resume-tailorings/run`
- `GET /api/resume-tailorings`
- `GET /api/resume-tailorings/:id`

### Resume Builder

- `GET /api/resume-builder/templates`
- `GET /api/resume-builder`
- `POST /api/resume-builder`
- `GET /api/resume-builder/:id`
- `PUT /api/resume-builder/:id`
- `POST /api/resume-builder/:id/duplicate`
- `POST /api/resume-builder/:id/tailor`
- `PATCH /api/resume-builder/:id/favorite`
- `GET /api/resume-builder/:id/export`
- `DELETE /api/resume-builder/:id`

### Job Match

- `POST /api/job-matches/analyze`
- `GET /api/job-matches`
- `GET /api/job-matches/:id`
- `DELETE /api/job-matches/:id`

### Interviews

- `GET /api/interviews/stats`
- `POST /api/interviews/sessions`
- `GET /api/interviews/sessions`
- `GET /api/interviews/sessions/:id`
- `POST /api/interviews/sessions/:id/answers`

## AI Behavior

Gemini is used for:

- Resume analysis
- Resume rewriting
- Resume tailoring
- Job matching
- Mock interview question generation
- Mock interview answer evaluation

AI calls use retry handling. If Gemini fails after retries, the backend returns a meaningful fallback response instead of crashing the application.

## Manual Test Flow

1. Register a user.
2. Log in.
3. Upload a PDF resume.
4. Run resume analysis.
5. Open the analysis report.
6. Click `Rewrite Resume` and save a rewritten version.
7. Open `Tailor` and generate a resume for a job description and company.
8. Confirm a tailored version is created in Resume Builder.
9. Run a job match.
10. Open `Interview` and complete a mock interview question.
11. Return to Dashboard and confirm updated widgets and trends.

## Useful Commands

Backend:

```bash
cd backend
npm run dev
npm start
node --check server.js
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
```

Database (Postgres):

```bash
# Run schema against Neon
psql "$DATABASE_URL" -f database/schema.sql

# Open an interactive shell against Neon
psql "$DATABASE_URL"

# Inside psql — list all tables
\dt

# Inside psql — inspect a table's columns
\d analyses
```

## Deployment Notes

### Backend on Render

- Set all backend environment variables in Render, including `DATABASE_URL` from Neon.
- Use `node server.js` as the start command.
- Set `CLIENT_URL` to the deployed Vercel frontend URL.
- Use persistent file storage or external object storage (e.g. Cloudinary, S3) for production resume uploads — Render's filesystem is ephemeral and uploaded PDFs will not survive a redeploy otherwise.

### Frontend on Vercel

- Set the API base URL to the deployed Render backend if the frontend is configured to read it.
- Build command: `npm run build`
- Output directory: `dist`

### Database on Neon (Serverless PostgreSQL)

- Create a project at [neon.tech](https://neon.tech) — a default database (`neondb`) is created automatically.
- Run `database/schema.sql` once via `psql` or the Neon SQL Editor for a fresh setup.
- Copy the **pooled connection string** (recommended for serverless/traffic-spiky workloads) into `DATABASE_URL` in your backend environment, both locally and on Render.
- Neon scales to zero when idle — the first request after inactivity may take a second or two longer while the database wakes up. This is expected behavior, not an error.
- Neon requires SSL; the connection string already includes `?sslmode=require`, and `backend/config/db.js` also sets `ssl: { rejectUnauthorized: false }` as a safety net.

## Security

- Passwords are hashed with bcrypt.
- JWT protects all authenticated routes.
- Helmet sets common secure HTTP headers.
- Rate limiting protects API routes.
- Resume upload is restricted to PDF files through the upload middleware.
- CORS is scoped through `CLIENT_URL`.
- User-owned resources are scoped by `req.user.id` in controllers and models.
- Database connections to Neon are encrypted via SSL/TLS.

## License

MIT