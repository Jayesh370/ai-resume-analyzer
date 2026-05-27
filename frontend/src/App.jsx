import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ResumeUpload from "./pages/ResumeUpload.jsx";
import AnalysisResult from "./pages/AnalysisResult.jsx";
import History from "./pages/History.jsx";
import Profile from "./pages/Profile.jsx";
import JobMatch from "./pages/JobMatch.jsx";
import JobMatchResult from "./pages/JobMatchResult.jsx";
import ResumeBuilder from "./pages/ResumeBuilder.jsx";
import ResumeEditor from "./pages/ResumeEditor.jsx";
import ResumeTailor from "./pages/ResumeTailor.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "rgba(15,15,26,0.95)",
                color: "#f1f0ff",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "14px",
                fontSize: "13px",
                backdropFilter: "blur(20px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              },
              success: { iconTheme: { primary: "#8b5cf6", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />

          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<ResumeUpload />} />
              <Route path="/analysis/:id" element={<AnalysisResult />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/job-match" element={<JobMatch />} />
              <Route path="/job-match/:id" element={<JobMatchResult />} />
              <Route path="/resume-builder" element={<ResumeBuilder />} />
              <Route path="/resume-builder/:id/tailor" element={<ResumeTailor />} />
              <Route path="/resume-builder/:id" element={<ResumeEditor />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
