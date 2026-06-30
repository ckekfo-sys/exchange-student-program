import React, { useState } from "react";
import { AuthSession, Program, Student, Application, AuditLog, UserRole, SurveyResponse } from "./types";
import { INITIAL_PROGRAMS, INITIAL_STUDENTS, INITIAL_APPLICATIONS, INITIAL_AUDIT_LOGS, INITIAL_SURVEYS } from "./data";
import SSOLogin from "./components/SSOLogin";
import StudentDashboard from "./components/StudentDashboard";
import AdminDashboard from "./components/AdminDashboard";
import PostgresSchemaViewer from "./components/PostgresSchemaViewer";
import { Database, ShieldCheck, GraduationCap, LayoutDashboard, DatabaseBackup } from "lucide-react";

export default function App() {
  // Application-wide state
  const [programs, setPrograms] = useState<Program[]>(INITIAL_PROGRAMS);
  const [students] = useState<Student[]>(INITIAL_STUDENTS);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [surveys, setSurveys] = useState<SurveyResponse[]>(INITIAL_SURVEYS);
  
  // Auth Session state
  const [session, setSession] = useState<AuthSession>({
    isAuthenticated: false
  });

  // Auxiliary state to toggle PostgreSQL schema viewer
  const [showSchemaViewer, setShowSchemaViewer] = useState(false);

  const handleLoginSuccess = (newSession: AuthSession) => {
    setSession(newSession);

    // Save login log
    const timestamp = new Date().toISOString();
    const isStudent = newSession.user?.role === UserRole.STUDENT;
    const actorEmail = newSession.user?.email || "unknown";

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: "USER_SSO_LOGIN",
      timestamp,
      actor: actorEmail,
      actorRole: newSession.user?.role || UserRole.STUDENT,
      target: "Central IdP Handshake",
      details: `${isStudent ? "Student" : "Coordinator"} authenticated successfully using ${newSession.ssoMethod}. Profile verified against directory.`,
      protocolUsed: newSession.ssoMethod
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleLogout = () => {
    const previousEmail = session.user?.email || "unknown";
    const previousRole = session.user?.role || UserRole.STUDENT;
    const previousProtocol = session.ssoMethod;

    setSession({ isAuthenticated: false });

    // Save logout log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action: "USER_SSO_LOGOUT",
      timestamp: new Date().toISOString(),
      actor: previousEmail,
      actorRole: previousRole,
      target: "Session termination",
      details: "User successfully terminated secure session. Local token reference cleared.",
      protocolUsed: previousProtocol
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    setShowSchemaViewer(false);
  };

  // Find the student profile of the currently logged-in student, if any
  const loggedInStudent = students.find((s) => s.email === session.user?.email) || INITIAL_STUDENTS[3]; // Fallback to Chae Eun-seo

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* SSO Login flow */}
      {!session.isAuthenticated ? (
        <SSOLogin onLoginSuccess={handleLoginSuccess} userStudent={INITIAL_STUDENTS[3]} />
      ) : (
        <div className="flex-1 flex flex-col justify-between pb-12">
          {/* Main User Workspace Dashboard */}
          <div>
            {!showSchemaViewer ? (
              session.user?.role === UserRole.STUDENT ? (
                <StudentDashboard
                  programs={programs}
                  student={loggedInStudent}
                  applications={applications}
                  setApplications={setApplications}
                  auditLogs={auditLogs}
                  setAuditLogs={setAuditLogs}
                  session={session}
                  onLogout={handleLogout}
                  surveys={surveys}
                  setSurveys={setSurveys}
                />
              ) : (
                <AdminDashboard
                  programs={programs}
                  setPrograms={setPrograms}
                  students={students}
                  applications={applications}
                  setApplications={setApplications}
                  auditLogs={auditLogs}
                  setAuditLogs={setAuditLogs}
                  currentAdminEmail={session.user?.email || "admin_coord@korea.ac.kr"}
                  onLogout={handleLogout}
                  ssoMethodName={session.ssoMethod || "SAML 2.0"}
                  surveys={surveys}
                />
              )
            ) : (
              /* Database schema viewer mode (when toggled on by user) */
              <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col">
                <header className="bg-slate-950 border-b border-slate-800 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
                  <div className="flex items-center space-x-2.5">
                    <DatabaseBackup className="h-5 w-5 text-emerald-400" />
                    <div>
                      <h2 className="text-sm font-display font-extrabold text-white">Relational Database Workspace</h2>
                      <p className="text-[10px] text-slate-400 font-mono">Student Program Application Schema</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSchemaViewer(false)}
                    className="py-1.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-emerald-400 transition-colors cursor-pointer border border-slate-700"
                  >
                    Return to Dashboard
                  </button>
                </header>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
                  <PostgresSchemaViewer />
                </div>
              </div>
            )}
          </div>

          {/* Persistent workspace bar to toggle PostgreSQL inspector */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-8">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start space-x-3 text-left">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 font-display">Relational Database & Tables Inspection</h4>
                  <p className="text-[11px] text-slate-400">
                    Verify PostgreSQL entity designs, junction relationships, triggers, and constraints required in the PRD.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSchemaViewer(!showSchemaViewer)}
                className={`py-2 px-4 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  showSchemaViewer
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                {showSchemaViewer ? "Go Back to Dashboard" : "Inspect PostgreSQL DDL & ERD"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
