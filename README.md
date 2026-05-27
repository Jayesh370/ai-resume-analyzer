# 🧠 ResumeAI — AI Resume Analyzer + Interview Prep Platform

A full-stack web application where users can sign up, upload a resume PDF, and receive:
- **ATS-style resume score** (0–100)
- **Skill extraction** from the resume
- **Job-role match analysis** (top 3 roles)
- **Missing skill suggestions**
- **Interview questions** tailored to their resume
- **History dashboard** to save and revisit analyses

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│  React + Tailwind (Vite)          Frontend  :5173         │
│  ┌──────────┐  ┌────────────────────────────────────┐    │
│  │AuthContext│  │Pages: Landing·Login·Register        │    │
│  │ + JWT    │  │Dashboard·Upload·Result·History      │    │
│  └──────────┘  │Profile                              │    │
│                └────────────────────────────────────┘    │
└────────────────────────────┬─────────────────────────────┘
                             │ HTTP /api/*
┌────────────────────────────▼─────────────────────────────┐
│  Node.js + Express         Backend  :5000                 │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  JWT Auth   │  │ Multer Upload│  │ OpenAI / Mock AI│  │
│  └─────────────┘  └──────────────┘  └─────────────────┘  │
│  Routes: /auth · /resumes · /analyses · /users            │
└────────────────────────────┬─────────────────────────────┘
                             │ mysql2/promise
┌────────────────────────────▼─────────────────────────────┐
│  MySQL 8+          Database                               │
│  users · resumes · analyses · interview_questions         │
└──────────────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure

```
ai-resume-analyzer/
├── backend/
│   ├── config/db.js              # MySQL pool
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── resumeController.js
│   │   ├── analysisController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT verify
│   │   ├── upload.js             # Multer PDF
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Resume.js
│   │   └── Analysis.js
│   ├── routes/
│   │   ├── auth.js · resume.js · analysis.js · user.js
│   ├── services/
│   │   ├── aiService.js          # Selects OpenAI or mock
│   │   ├── mockAiService.js      # Works without API key
│   │   └── pdfService.js         # pdf-parse
│   ├── utils/helpers.js
│   ├── uploads/                  # PDF storage (gitignored)
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx · Footer.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ScoreCard.jsx
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx · Login.jsx · Register.jsx
│   │   │   ├── Dashboard.jsx · ResumeUpload.jsx
│   │   │   ├── AnalysisResult.jsx · History.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/api.js        # Axios + auth interceptor
│   │   ├── App.jsx · main.jsx · index.css
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── database/schema.sql
└── README.md
```

---

## ⚙️ Prerequisites

| Tool     | Version  |
|----------|----------|
| Node.js  | ≥ 18.x   |
| npm      | ≥ 9.x    |
| MySQL    | ≥ 8.0    |

---

## 🚀 Local Setup — Step by Step

### 1. Clone the repository

```bash
git clone https://github.com/yourname/ai-resume-analyzer.git
cd ai-resume-analyzer
```

### 2. Set up the database

```bash
# Log into MySQL
mysql -u root -p

# Inside MySQL shell:
CREATE DATABASE resume_analyzer CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Run the schema
mysql -u root -p resume_analyzer < database/schema.sql
```

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=resume_analyzer

JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d

# Optional — leave blank to use the built-in mock AI
OPENAI_API_KEY=sk-...

MAX_FILE_SIZE_MB=5
UPLOAD_DIR=uploads
CLIENT_URL=http://localhost:5173
```

### 4. Install & start the backend

```bash
# Still inside /backend
npm install
npm run dev
```

You should see:
```
✅  MySQL connected successfully
🚀  Server running on http://localhost:5000
🤖  AI Service  : Mock (no key set)
```

### 5. Configure the frontend

```bash
cd ../frontend
cp .env.example .env
```

`.env` content (Vite proxies /api → backend, so usually no changes needed):
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 6. Install & start the frontend

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🧪 Testing Steps

### Manual testing flow

1. **Register** at `/register` — creates a new account
2. **Log in** at `/login`
3. **Upload a PDF resume** at `/upload`
4. Wait for the 4-step progress indicator to complete
5. **View the analysis result** — score, skills, job roles, missing skills, questions
6. Go to **History** at `/history` — see all past analyses
7. Click **View** on any row to revisit a result
8. Click **Delete** to remove an analysis
9. Visit **Profile** at `/profile` — update name/email or change password

### API testing with curl

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"Secret123"}'

# Login (copy token from response)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"Secret123"}'

# Upload resume (replace TOKEN and path)
curl -X POST http://localhost:5000/api/resumes/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "resume=@/path/to/resume.pdf"

# Run analysis (use resumeId from upload response)
curl -X POST http://localhost:5000/api/analyses/run \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resumeId": 1}'

# Get all analyses
curl http://localhost:5000/api/analyses \
  -H "Authorization: Bearer TOKEN"
```

---

## 🤖 AI Service

The app works in **two modes**:

| Mode     | Requirement       | Quality     |
|----------|-------------------|-------------|
| **Mock** | No key needed     | Deterministic, keyword-based scoring |
| **OpenAI GPT-4o** | `OPENAI_API_KEY` in `.env` | Full AI-quality analysis |

The mock service is production-ready for demos. Simply set `OPENAI_API_KEY` to upgrade.

---

## 🌐 Deployment Guide

### Backend (Railway / Render / Heroku)

1. Set environment variables matching `.env.example` in your host's dashboard
2. For `UPLOAD_DIR`, use a persistent volume or switch to S3 (see note below)
3. Set `NODE_ENV=production`
4. Start command: `node server.js`

> **Note:** On ephemeral file systems (Heroku, Railway without volumes), uploaded PDFs are lost on restart. For production, store PDFs in **AWS S3** or **Cloudinary** and save the URL in the DB instead of a local path.

### Frontend (Vercel / Netlify)

1. Set `VITE_API_BASE_URL=https://your-backend-url.com`
2. Update `CLIENT_URL` in the backend `.env` to your Vercel URL
3. Build command: `npm run build`
4. Publish directory: `dist`

### Database (PlanetScale / Railway MySQL / AWS RDS)

1. Create a MySQL 8 database
2. Run `schema.sql` via the host's query console
3. Update `DB_*` variables in backend config

---

## 🔐 Security Checklist

- [x] Passwords hashed with bcrypt (cost factor 12)
- [x] JWT tokens expire after 7 days
- [x] Helmet.js sets secure HTTP headers
- [x] Rate limiting on all routes (100/15 min); stricter on `/auth` (10/15 min)
- [x] File type validation (PDF only) + size cap (5 MB)
- [x] Input validation via express-validator on all write endpoints
- [x] CORS restricted to `CLIENT_URL`
- [ ] TODO: HTTPS in production (handled by your hosting provider / nginx)
- [ ] TODO: Move PDF storage to S3 for scalable file handling

---

## 📦 Key Dependencies

### Backend
| Package | Purpose |
|---------|---------|
| express | Web framework |
| mysql2 | MySQL driver (Promise API) |
| jsonwebtoken | JWT sign/verify |
| bcryptjs | Password hashing |
| multer | PDF file upload |
| pdf-parse | Text extraction from PDFs |
| openai | GPT-4o integration |
| helmet | HTTP security headers |
| express-rate-limit | Abuse protection |
| express-validator | Input validation |

### Frontend
| Package | Purpose |
|---------|---------|
| react + react-dom | UI library |
| react-router-dom | Client-side routing |
| axios | HTTP client |
| react-hot-toast | Toast notifications |
| recharts | Charts (bar, radar) |
| lucide-react | Icon set |
| tailwindcss | Utility CSS |

---

## 📄 License

MIT — free to use and modify.
