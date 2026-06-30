import React, { useState } from "react";
import { Program, Student, Application, ApplicationStatus, AuditLog, AuthSession, AuthProtocol, SurveyResponse } from "../types";
import { 
  GraduationCap, BookOpen, Clock, CheckCircle, XCircle, AlertCircle, 
  MapPin, Calendar, FileText, Upload, Send, HelpCircle, LogOut,
  User, ShieldCheck, Key, FileCode2, Copy, Check, Award, Download, Star, MessageSquare
} from "lucide-react";

interface StudentDashboardProps {
  programs: Program[];
  student: Student;
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  session: AuthSession;
  onLogout: () => void;
  surveys: SurveyResponse[];
  setSurveys: React.Dispatch<React.SetStateAction<SurveyResponse[]>>;
}

export default function StudentDashboard({
  programs,
  student,
  applications,
  setApplications,
  auditLogs,
  setAuditLogs,
  session,
  onLogout,
  surveys,
  setSurveys
}: StudentDashboardProps) {
  // Tabs: 'programs' | 'applications' | 'sso-token'
  const [activeTab, setActiveTab] = useState<"programs" | "applications" | "sso-token">("programs");

  // Application flow
  const [applyingProgram, setApplyingProgram] = useState<Program | null>(null);
  const [sop, setSop] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; uploadedAt: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Survey state
  const [surveyTarget, setSurveyTarget] = useState<ParticipationHistory | null>(null);
  const [surveyForm, setSurveyForm] = useState({ overallRating: 5, teachingQuality: 5, facilities: 5, culturalExperience: 5, comment: "" });

  // Filter out draft applications for visual purposes, but keep total
  const studentApps = applications.filter((app) => app.studentId === student.id);
  const mySurveys = surveys.filter((s) => s.studentId === student.id);

  // Log audit helper
  const addAuditLog = (action: string, target: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action,
      timestamp: new Date().toISOString(),
      actor: student.email,
      actorRole: session.user?.role || "student" as any,
      target,
      details,
      protocolUsed: session.ssoMethod
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Drag-and-drop file simulation handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      const newFiles = files.map((file: any) => ({
        name: file.name,
        url: "#",
        uploadedAt: new Date().toISOString()
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      const newFiles = files.map((file: any) => ({
        name: file.name,
        url: "#",
        uploadedAt: new Date().toISOString()
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Survey submission
  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyTarget) return;
    const newSurvey: SurveyResponse = {
      id: `survey-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      programId: surveyTarget.programId,
      programTitle: surveyTarget.programTitle,
      ...surveyForm,
      submittedAt: new Date().toISOString()
    };
    setSurveys((prev) => [newSurvey, ...prev]);
    setSurveyTarget(null);
    alert("Thank you! Your satisfaction survey has been submitted.");
  };

  const openSurvey = (p: ParticipationHistory) => {
    const existing = mySurveys.find((s) => s.programId === p.programId);
    if (existing) {
      alert(`You already submitted a survey for "${p.programTitle}" on ${new Date(existing.submittedAt).toLocaleDateString()}.`);
      return;
    }
    setSurveyTarget(p);
    setSurveyForm({ overallRating: 5, teachingQuality: 5, facilities: 5, culturalExperience: 5, comment: "" });
  };

  // Program application submission
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingProgram) return;

    // Validation
    if (student.gpa < applyingProgram.prerequisiteGPA) {
      alert(`Prerequisite GPA mismatch! This program requires a minimum GPA of ${applyingProgram.prerequisiteGPA.toFixed(2)}, while your current GPA is ${student.gpa.toFixed(2)}.`);
      return;
    }

    if (sop.trim().length < 50) {
      alert("Please provide a more detailed Statement of Purpose (minimum 50 characters) to strengthen your application.");
      return;
    }

    // Check if already applied
    const existing = studentApps.find((a) => a.programId === applyingProgram.id);
    if (existing) {
      alert("You have already submitted an application for this program. Duplicate entries are blocked in the relational model.");
      return;
    }

    const newApp: Application = {
      id: `app-${Date.now()}`,
      studentId: student.id,
      programId: applyingProgram.id,
      status: ApplicationStatus.SUBMITTED,
      gpaAtTimeOfApplication: student.gpa,
      statementOfPurpose: sop,
      submittedAt: new Date().toISOString(),
      documents: uploadedFiles.length > 0 ? uploadedFiles : [
        { name: "Transcript_AutoVerified.pdf", url: "#", uploadedAt: new Date().toISOString() }
      ],
      history: [
        {
          status: ApplicationStatus.SUBMITTED,
          updatedAt: new Date().toISOString(),
          updatedBy: `${student.name} (via SSO Auth)`
        }
      ]
    };

    setApplications((prev) => [newApp, ...prev]);
    addAuditLog(
      "APPLICATION_SUBMISSION",
      newApp.id,
      `Successfully submitted exchange application for program '${applyingProgram.title}'. Current GPA: ${student.gpa.toFixed(2)}.`
    );

    alert(`Application for '${applyingProgram.title}' has been submitted successfully!`);
    
    // Clear state
    setApplyingProgram(null);
    setSop("");
    setUploadedFiles([]);
    setActiveTab("applications");
  };

  const copySsoTokenDump = () => {
    const rawData = session.ssoMethod === AuthProtocol.SAML 
      ? session.ssoMetadata?.samlAssertion 
      : JSON.stringify(session.ssoMetadata?.oidcClaims, null, 2);
    
    if (rawData) {
      navigator.clipboard.writeText(rawData);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-red-700 flex items-center justify-center text-white font-display font-black text-sm">
                KU
              </div>
              <div>
                <h1 className="text-base font-display font-bold text-slate-900 leading-tight">
                  KU Student Portal
                </h1>
                <p className="text-[10px] font-mono text-slate-400">
                  Global Programs Coordinating System
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Verified SSO Session</span>
                <span className="text-xs font-mono font-bold text-slate-800">{student.name} ({student.studentIdNumber})</span>
              </div>
              <button
                type="button"
                id="btn-student-logout"
                onClick={onLogout}
                className="inline-flex items-center space-x-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-all cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Student Profile Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 flex items-center space-x-4">
            {student.avatarUrl ? (
              <img src={student.avatarUrl} alt={student.name} referrerPolicy="no-referrer" className="h-16 w-16 rounded-full border border-slate-200 object-cover shadow-xs" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-lg">
                {student.name.charAt(0)}
              </div>
            )}
            <div className="text-left">
              <h2 className="text-lg font-bold text-slate-950 font-display">{student.name}</h2>
              <p className="text-xs text-slate-400 font-mono">{student.email}</p>
              <div className="mt-1 flex items-center text-xs text-red-700 font-bold">
                <GraduationCap className="h-4 w-4 mr-1" />
                <span>{student.department}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 text-center">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Current GPA</span>
              <span className="text-lg font-mono font-extrabold text-red-700">{student.gpa.toFixed(2)}</span>
              <span className="block text-[8px] text-slate-400 font-mono">Scale 4.50</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Earned Credits</span>
              <span className="text-lg font-mono font-extrabold text-slate-800">{student.completedCredits}</span>
              <span className="block text-[8px] text-slate-400 font-mono">Req: 130 max</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Active Applications</span>
              <span className="text-lg font-mono font-extrabold text-slate-800">{studentApps.length}</span>
              <span className="block text-[8px] text-slate-400 font-mono">Linked safely</span>
            </div>
          </div>
        </div>

        {/* Previous Participation History */}
        {student.previousParticipation && student.previousParticipation.length > 0 && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
            <div className="flex items-center space-x-2 mb-3">
              <Award className="h-4 w-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900 font-display">Previous Program Participation</h3>
              <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                {student.previousParticipation.length} program{student.previousParticipation.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {student.previousParticipation.map((p, idx) => (
                <div key={idx} className="flex items-start space-x-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 flex-shrink-0">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">{p.programTitle}</span>
                      <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold flex-shrink-0">{p.year}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{p.location} · {p.duration}</p>
                    <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">{p.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <button
                        onClick={() => {
                          const blob = new Blob([`Certificate of Completion\n\nThis certifies that ${student.name} has successfully completed the program "${p.programTitle}" at ${p.location} (${p.year}).\n\nDuration: ${p.duration}\nStatus: ${p.status}\n\nIssued by Korea University - Global Programs Coordinating System`], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `Certificate_${p.programTitle.replace(/\s+/g, "_")}_${p.year}.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="inline-flex items-center space-x-1 py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-[9px] rounded-lg transition-all cursor-pointer"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download Certificate</span>
                      </button>
                      <button
                        onClick={() => openSurvey(p)}
                        className="inline-flex items-center space-x-1 py-1 px-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[9px] rounded-lg transition-all cursor-pointer"
                      >
                        <Star className="h-3 w-3" />
                        <span>{mySurveys.find((s) => s.programId === p.programId) ? "View Survey" : "Rate Program"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard Navigation */}
        <div className="flex border-b border-slate-200/80 bg-white p-1 rounded-xl shadow-sm">
          <button
            onClick={() => { setActiveTab("programs"); setApplyingProgram(null); }}
            className={`flex-1 py-3 px-4 text-center text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === "programs"
                ? "bg-slate-900 text-white shadow"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Overseas Opportunities</span>
          </button>
          <button
            onClick={() => { setActiveTab("applications"); setApplyingProgram(null); }}
            className={`flex-1 py-3 px-4 text-center text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === "applications"
                ? "bg-slate-900 text-white shadow"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>My Applications Tracker ({studentApps.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab("sso-token"); setApplyingProgram(null); }}
            className={`flex-1 py-3 px-4 text-center text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === "sso-token"
                ? "bg-slate-900 text-white shadow"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>SSO Token Assertion Audit</span>
          </button>
        </div>

        {/* Primary View Area */}
        {activeTab === "programs" && !applyingProgram && (
          <div className="space-y-4">
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-900 font-display">Global Learning Opportunities</h3>
              <p className="text-xs text-slate-500">Prerequisite checkers analyze your current GPA in real-time against directory limits.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programs.filter((p) => p.isActive).map((prog) => {
                const isEligible = student.gpa >= prog.prerequisiteGPA;
                const alreadyApplied = studentApps.some((app) => app.programId === prog.id);

                return (
                  <div key={prog.id} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2.5">
                        <span className={`py-0.5 px-2 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                          isEligible ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                        }`}>
                          {isEligible ? "Eligible to Apply" : "GPA Requirement Mismatch"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Req Cutoff: {prog.prerequisiteGPA.toFixed(2)}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-950 font-display text-left">{prog.title}</h4>
                      <p className="text-xs text-slate-500 text-left mt-2 leading-relaxed mb-4">{prog.description}</p>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 text-left">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-700 truncate">{prog.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-700 truncate">DL: {prog.deadline}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">Seats: {prog.capacity} total</span>
                      
                      {alreadyApplied ? (
                        <span className="inline-flex items-center text-xs text-emerald-600 font-bold">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Applied
                        </span>
                      ) : (
                        <button
                          disabled={!isEligible}
                          onClick={() => setApplyingProgram(prog)}
                          className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isEligible 
                              ? "bg-red-700 hover:bg-red-800 text-white shadow-xs" 
                              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                          }`}
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Applying Program Form View */}
        {activeTab === "programs" && applyingProgram && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden text-left max-w-2xl mx-auto">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono uppercase bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">New Application Form</span>
                <h3 className="text-sm font-bold text-slate-900 font-display mt-1">{applyingProgram.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setApplyingProgram(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold p-1 cursor-pointer"
              >
                Cancel Form
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-5">
              <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl flex items-start text-xs text-amber-800">
                <ShieldCheck className="h-5 w-5 mr-2 flex-shrink-0 text-amber-600" />
                <div>
                  <span className="font-bold block mb-0.5">Automated Academic Verification</span>
                  Your enrollment major, finished credits, and official GPA of <strong className="font-mono text-amber-950">{student.gpa.toFixed(2)}</strong> are pre-loaded via OIDC/SAML federated identity validation. This guarantees data integrity and cuts requirement times.
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Statement of Purpose (Minimum 50 characters)
                </label>
                <textarea
                  rows={6}
                  required
                  value={sop}
                  onChange={(e) => setSop(e.target.value)}
                  placeholder="Describe your motivations for applying to this overseas program, what subjects you plan to take, and how this will enhance your career objectives..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white"
                ></textarea>
              </div>

              {/* Document attachment Area */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Mandatory Attachments Checklist ({applyingProgram.requiredDocuments.length})
                </label>
                <p className="text-[10px] text-slate-400">Please attach the following files to avoid coordinator evaluation issues:</p>
                <div className="flex flex-wrap gap-1.5">
                  {applyingProgram.requiredDocuments.map((doc, i) => (
                    <span key={i} className="text-[9px] font-mono font-semibold bg-slate-100 text-slate-600 border px-2 py-0.5 rounded flex items-center">
                      <FileText className="h-3 w-3 mr-1 text-slate-400" />
                      {doc}
                    </span>
                  ))}
                </div>

                {/* Upload drag drop panel */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                    dragActive 
                      ? "border-red-600 bg-red-50/40" 
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                  }`}
                >
                  <input
                    type="file"
                    id="student-file-upload-input"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <label htmlFor="student-file-upload-input" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2 animate-bounce" />
                    <span className="text-xs font-bold text-slate-700 block">Drag & Drop Documents Here</span>
                    <span className="text-[10px] text-slate-400 block mt-1">or click to manually browse system files (PDF, DOCX)</span>
                  </label>
                </div>

                {/* File checklist */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[9px] font-mono font-bold uppercase text-slate-400">Attached Documents</span>
                    <div className="space-y-1">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white border rounded-lg p-2 text-xs">
                          <span className="font-medium text-slate-700 truncate max-w-xs">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeUploadedFile(idx)}
                            className="text-red-600 hover:text-red-800 text-[10px] font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setApplyingProgram(null)}
                  className="py-2.5 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold rounded-xl text-slate-700 transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-red-700 hover:bg-red-800 text-xs font-bold rounded-xl text-white transition-all shadow-md cursor-pointer flex items-center"
                >
                  <Send className="h-4 w-4 mr-1.5" />
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Applications tracker Tab */}
        {activeTab === "applications" && (
          <div className="space-y-4 text-left">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">My Application Tracker</h3>
              <p className="text-xs text-slate-500">Track current review progress and coordinator decisions.</p>
            </div>

            {studentApps.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-3">
                <BookOpen className="h-8 w-8 text-slate-400 mx-auto animate-pulse" />
                <h4 className="text-xs font-bold text-slate-700">No applications on file</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">You haven't submitted any overseas exchange program requests yet. Browse open offerings and apply to start your global semester.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {studentApps.map((app) => {
                  const program = programs.find((p) => p.id === app.programId);
                  
                  return (
                    <div key={app.id} className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                      {/* Top status header bar */}
                      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 block">Submitted: {new Date(app.submittedAt).toLocaleDateString()}</span>
                          <h4 className="text-xs font-bold text-slate-900 mt-0.5">{program?.title}</h4>
                        </div>

                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold self-start sm:self-center ${
                          app.status === ApplicationStatus.APPROVED ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          app.status === ApplicationStatus.REJECTED ? "bg-red-50 text-red-700 border border-red-200" :
                          app.status === ApplicationStatus.UNDER_REVIEW ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          app.status === ApplicationStatus.SUBMITTED ? "bg-blue-50 text-blue-700 border border-blue-200" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {app.status === ApplicationStatus.APPROVED && <CheckCircle className="h-3 w-3" />}
                          {app.status === ApplicationStatus.REJECTED && <XCircle className="h-3 w-3" />}
                          {app.status === ApplicationStatus.UNDER_REVIEW && <Clock className="h-3 w-3" />}
                          <span>{app.status}</span>
                        </span>
                      </div>

                      {/* Timeline Detail Area */}
                      <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
                        <div className="md:col-span-8 space-y-3">
                          <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">Your Submitted SOP Excerpt</span>
                          <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed italic">
                            "{app.statementOfPurpose}"
                          </p>

                          {/* Coordinator response notes */}
                          {app.reviewNotes && (
                            <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 text-xs">
                              <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold mb-1.5">Coordinator Team Response</span>
                              <p className="leading-relaxed">{app.reviewNotes}</p>
                              <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                                Evaluated by {app.reviewedBy} on {new Date(app.reviewedAt || "").toLocaleDateString()}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Historical Audit Trail */}
                        <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-5 space-y-3">
                          <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">Relational Progress logs</span>
                          <div className="relative border-l border-slate-200 pl-3 space-y-3 text-[11px] font-sans">
                            {app.history.map((h, i) => (
                              <div key={i} className="relative">
                                <span className="absolute -left-[15.5px] top-1 h-1.5 w-1.5 bg-slate-400 rounded-full"></span>
                                <div className="text-[9px] font-mono text-slate-400">{new Date(h.updatedAt).toLocaleString()}</div>
                                <div className="font-bold text-slate-800 mt-0.5">Shifted status to {h.status}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">By {h.updatedBy}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SSO Token Assertion View Tab */}
        {activeTab === "sso-token" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden text-left">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-slate-900 font-display">SSO Federated Security Assertion</h3>
                <p className="text-[10px] text-slate-400">Inspecting decrypted claims token provided by Korea University's centralized IdP ({session.ssoMethod}).</p>
              </div>

              <button
                onClick={copySsoTokenDump}
                className="inline-flex items-center space-x-1.5 py-1.5 px-3 bg-white border rounded-lg text-[10px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {copiedToken ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedToken ? "Copied" : "Copy Token"}</span>
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border rounded-xl">
                  <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Protocol Mechanism</span>
                  <span className="text-xs font-bold text-slate-800 block mt-1">{session.ssoMethod}</span>
                </div>
                <div className="p-3 bg-slate-50 border rounded-xl">
                  <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Issuer ID</span>
                  <span className="text-xs font-mono text-slate-800 block mt-1 truncate">{session.ssoMetadata?.issuer}</span>
                </div>
                <div className="p-3 bg-slate-50 border rounded-xl">
                  <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Security Handshake</span>
                  <span className="text-xs text-emerald-700 font-bold block mt-1">Verified signature (SHA-256)</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">Raw Decoded Assertion Dump</span>
                
                {session.ssoMethod === AuthProtocol.SAML ? (
                  <pre className="text-[11px] font-mono text-slate-700 bg-slate-900 p-4 rounded-xl leading-relaxed max-h-[300px] overflow-y-auto text-emerald-300">
                    {session.ssoMetadata?.samlAssertion}
                  </pre>
                ) : session.ssoMethod === AuthProtocol.OIDC ? (
                  <pre className="text-[11px] font-mono text-slate-700 bg-slate-900 p-4 rounded-xl leading-relaxed max-h-[300px] overflow-y-auto text-emerald-300">
                    {JSON.stringify(session.ssoMetadata?.oidcClaims, null, 2)}
                  </pre>
                ) : (
                  <div className="p-4 bg-slate-900 rounded-xl font-mono text-xs text-emerald-300">
                    Ticket validated: {session.ssoMetadata?.casTicket} <br />
                    Response code: CAS_VAL_SUCCESS
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Survey Modal */}
        {surveyTarget && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs" onClick={() => setSurveyTarget(null)}></div>
              <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 text-left">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-900 font-display">Program Satisfaction Survey</h3>
                  <button onClick={() => setSurveyTarget(null)} className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer">Close</button>
                </div>
                <p className="text-[10px] text-slate-500 mb-4 font-mono">{surveyTarget.programTitle} · {surveyTarget.year}</p>
                <form onSubmit={handleSurveySubmit} className="space-y-4">
                  {[
                    { key: "overallRating", label: "Overall Experience" },
                    { key: "teachingQuality", label: "Teaching Quality" },
                    { key: "facilities", label: "Facilities & Resources" },
                    { key: "culturalExperience", label: "Cultural Experience" }
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1.5">{field.label}</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button type="button" key={star} onClick={() => setSurveyForm({ ...surveyForm, [field.key]: star })}
                            className={`p-1.5 rounded-lg text-sm transition-all cursor-pointer ${surveyForm[field.key as keyof typeof surveyForm] >= star ? "text-amber-400" : "text-slate-200"}`}>
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1">Additional Comments</label>
                    <textarea rows={3} value={surveyForm.comment} onChange={(e) => setSurveyForm({ ...surveyForm, comment: e.target.value })}
                      placeholder="Share your thoughts about this program..."
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
                    ></textarea>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setSurveyTarget(null)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
                    <button type="submit" className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-xs font-bold rounded-xl text-white shadow-md cursor-pointer flex items-center justify-center">
                      <Star className="h-3.5 w-3.5 mr-1.5" />Submit Survey
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
