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
- MySQL via `mysql2`
- Multer
- PDF parsing
- Gemini AI

Deployment targets:

- Frontend: Vercel
- Backend: Render
- Database: Aiven MySQL

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
|   |-- schema.sql
|   `-- 2026_06_05_career_prep_features.sql
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

For a fresh database, run:

```bash
mysql -u root -p resume_analyzer < database/schema.sql
```

For an existing database, apply the feature migration:

```bash
mysql -u root -p resume_analyzer < database/2026_06_05_career_prep_features.sql
```

## Local Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=resume_analyzer

JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173

MAX_FILE_SIZE_MB=5
UPLOAD_DIR=uploads
```

If `GEMINI_API_KEY` is not set, the app uses fallback or mock responses where available.

### 2. Start Backend

```bash
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

Health check:

```text
GET /api/health
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Start Frontend

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

## Deployment Notes

### Backend on Render

- Set all backend environment variables in Render.
- Use `node server.js` as the start command.
- Set `CLIENT_URL` to the deployed Vercel frontend URL.
- Use persistent file storage or external object storage for production resume uploads.

### Frontend on Vercel

- Set the API base URL to the deployed Render backend if the frontend is configured to read it.
- Build command: `npm run build`
- Output directory: `dist`

### Database on Aiven MySQL

- Create a MySQL database.
- Run `database/schema.sql` for fresh setup.
- Run new migration files when upgrading an existing database.
- Configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in the backend environment.

## Security

- Passwords are hashed with bcrypt.
- JWT protects all authenticated routes.
- Helmet sets common secure HTTP headers.
- Rate limiting protects API routes.
- Resume upload is restricted to PDF files through the upload middleware.
- CORS is scoped through `CLIENT_URL`.
- User-owned resources are scoped by `req.user.id` in controllers and models.

## License

MIT
