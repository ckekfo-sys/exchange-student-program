import React, { useState } from "react";
import { Program, Student, Application, ApplicationStatus, AuditLog, UserRole, SurveyResponse } from "../types";
import { 
  Users, Layers, FileCheck2, Activity, Calendar, Award, 
  Search, Eye, Edit3, Trash2, Plus, LogOut, CheckCircle, 
  XCircle, Clock, ToggleLeft, ToggleRight, FileText, Download, 
  AlertTriangle, Save, RefreshCw, Sparkles, Filter, Star, BarChart3
} from "lucide-react";

interface AdminDashboardProps {
  programs: Program[];
  setPrograms: React.Dispatch<React.SetStateAction<Program[]>>;
  students: Student[];
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  currentAdminEmail: string;
  onLogout: () => void;
  ssoMethodName: string;
  surveys: SurveyResponse[];
}

export default function AdminDashboard({
  programs,
  setPrograms,
  students,
  applications,
  setApplications,
  auditLogs,
  setAuditLogs,
  currentAdminEmail,
  onLogout,
  ssoMethodName,
  surveys
}: AdminDashboardProps) {
  // Tabs: 'applications' | 'programs' | 'audit' | 'surveys'
  const [activeTab, setActiveTab] = useState<"applications" | "programs" | "audit" | "surveys">("applications");

  // Search & Filters
  const [appSearch, setAppSearch] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState<string>("all");
  const [progSearch, setProgSearch] = useState("");

  // Detailed view/review states
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewStatus, setReviewStatus] = useState<ApplicationStatus>(ApplicationStatus.UNDER_REVIEW);

  // Program Modal (Add/Edit)
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [programForm, setProgramForm] = useState({
    title: "",
    description: "",
    department: "",
    location: "",
    duration: "",
    capacity: 10,
    deadline: "",
    prerequisiteGPA: 3.5,
    requiredDocuments: ["Official Academic Transcript", "English Proficiency Certificate", "Statement of Purpose"]
  });

  // Log action helper
  const addAuditLog = (action: string, target: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action,
      timestamp: new Date().toISOString(),
      actor: currentAdminEmail,
      actorRole: UserRole.COORDINATOR,
      target,
      details
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Metrics calculations
  const totalApps = applications.length;
  const approvedAppsCount = applications.filter((a) => a.status === ApplicationStatus.APPROVED).length;
  const pendingAppsCount = applications.filter(
    (a) => a.status === ApplicationStatus.SUBMITTED || a.status === ApplicationStatus.UNDER_REVIEW
  ).length;
  const activeProgramsCount = programs.filter((p) => p.isActive).length;
  const approvalRate = totalApps > 0 ? Math.round((approvedAppsCount / totalApps) * 100) : 0;
  const programApplicationCounts = programs.reduce<Record<string, number>>((acc, program) => {
    acc[program.id] = applications.filter((app) => app.programId === program.id).length;
    return acc;
  }, {});

  const getProgramFillRate = (program: Program) => {
    if (program.capacity <= 0) return 0;
    return Math.min(100, Math.round((programApplicationCounts[program.id] / program.capacity) * 100));
  };

  // Review logic
  const openReviewDrawer = (app: Application) => {
    setSelectedApp(app);
    setReviewNotes(app.reviewNotes || "");
    setReviewStatus(app.status);
  };

  const handleUpdateStatus = () => {
    if (!selectedApp) return;

    const previousStatus = selectedApp.status;
    const updatedHistory = [
      ...selectedApp.history,
      {
        status: reviewStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: "Coordinator Team",
        notes: reviewNotes || undefined
      }
    ];

    setApplications((prev) =>
      prev.map((app) =>
        app.id === selectedApp.id
          ? {
              ...app,
              status: reviewStatus,
              reviewNotes: reviewNotes || undefined,
              reviewedBy: currentAdminEmail,
              reviewedAt: new Date().toISOString(),
              history: updatedHistory
            }
          : app
      )
    );

    // Add audit log
    addAuditLog(
      "APPLICATION_STATUS_UPDATE",
      selectedApp.id,
      `Updated application status from '${previousStatus}' to '${reviewStatus}'. Coordinator Notes: ${reviewNotes || 'None'}`
    );

    // Refresh selectedApp view
    setSelectedApp((prev) =>
      prev
        ? {
            ...prev,
            status: reviewStatus,
            reviewNotes: reviewNotes || undefined,
            reviewedBy: currentAdminEmail,
            reviewedAt: new Date().toISOString(),
            history: updatedHistory
          }
        : null
    );

    alert(`Application status updated to ${reviewStatus} successfully!`);
  };

  // Program deletion
  const handleDeleteProgram = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the program '${title}'? This action is irreversible in the database.`)) {
      setPrograms((prev) => prev.filter((p) => p.id !== id));
      addAuditLog("PROGRAM_DELETION", id, `Deleted program offering: '${title}'`);
    }
  };

  // Toggle Program Active/Inactive
  const handleToggleProgramActive = (id: string, title: string, currentStatus: boolean) => {
    setPrograms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !currentStatus } : p))
    );
    addAuditLog(
      "PROGRAM_STATUS_TOGGLE",
      id,
      `Toggled program '${title}' status to ${!currentStatus ? "ACTIVE" : "INACTIVE"}`
    );
  };

  // Save/Edit Program Submit
  const handleProgramFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProgram) {
      // Edit mode
      setPrograms((prev) =>
        prev.map((p) =>
          p.id === editingProgram.id
            ? { ...p, ...programForm }
            : p
        )
      );
      addAuditLog("PROGRAM_UPDATE", editingProgram.id, `Updated program offering: '${programForm.title}'`);
    } else {
      // Create mode
      const newId = `prog-${Date.now()}`;
      const newProgram: Program = {
        id: newId,
        ...programForm,
        isActive: true
      };
      setPrograms((prev) => [...prev, newProgram]);
      addAuditLog("PROGRAM_CREATION", newId, `Created new international program offering: '${programForm.title}'`);
    }

    setIsProgramModalOpen(false);
    setEditingProgram(null);
  };

  const openAddProgramModal = () => {
    setEditingProgram(null);
    setProgramForm({
      title: "",
      description: "",
      department: "All Departments",
      location: "",
      duration: "",
      capacity: 10,
      deadline: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      prerequisiteGPA: 3.5,
      requiredDocuments: ["Official Academic Transcript", "English Proficiency Certificate", "Statement of Purpose"]
    });
    setIsProgramModalOpen(true);
  };

  const openEditProgramModal = (prog: Program) => {
    setEditingProgram(prog);
    setProgramForm({
      title: prog.title,
      description: prog.description,
      department: prog.department,
      location: prog.location,
      duration: prog.duration,
      capacity: prog.capacity,
      deadline: prog.deadline,
      prerequisiteGPA: prog.prerequisiteGPA,
      requiredDocuments: prog.requiredDocuments
    });
    setIsProgramModalOpen(true);
  };

  // Filter application list
  const filteredApps = applications.filter((app) => {
    const student = students.find((s) => s.id === app.studentId);
    const program = programs.find((p) => p.id === app.programId);
    
    const searchString = `${student?.name || ""} ${student?.email || ""} ${program?.title || ""}`.toLowerCase();
    const matchesSearch = searchString.includes(appSearch.toLowerCase());
    
    const matchesStatus = appStatusFilter === "all" || app.status === appStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Banner / Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-red-700 flex items-center justify-center text-white font-display font-black text-sm">
                KU
              </div>
              <div>
                <h1 className="text-base font-display font-bold text-slate-900 leading-tight">
                  Coordinator Console
                </h1>
                <p className="text-[10px] font-mono text-slate-400">
                  Student Program Application & Management System
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Logged in via {ssoMethodName}</span>
                <span className="text-xs font-mono font-bold text-slate-800">{currentAdminEmail}</span>
              </div>
              <button
                type="button"
                id="btn-admin-logout"
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
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/80 flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Total Programs</span>
              <span className="text-2xl font-display font-extrabold text-slate-900">{programs.length}</span>
              <span className="text-[10px] text-emerald-600 font-mono block mt-0.5">● {activeProgramsCount} Currently Active</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/80 flex items-center space-x-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Total Applications</span>
              <span className="text-2xl font-display font-extrabold text-slate-900">{totalApps}</span>
              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{pendingAppsCount} pending evaluation</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/80 flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <FileCheck2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Approval Rate</span>
              <span className="text-2xl font-display font-extrabold text-slate-900">{approvalRate}%</span>
              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{approvedAppsCount} fully approved</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/80 flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">DB Sync Integrity</span>
              <span className="text-2xl font-display font-extrabold text-emerald-700">100%</span>
              <span className="text-[10px] text-amber-600 font-mono block mt-0.5">OIDC & Identity Synced</span>
            </div>
          </div>
        </div>

        {/* Console Navigation */}
        <div className="flex border-b border-slate-200/80 bg-white p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab("applications")}
            className={`flex-1 py-3 px-4 text-center text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === "applications"
                ? "bg-slate-900 text-white shadow"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Applications Evaluation ({filteredApps.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("programs")}
            className={`flex-1 py-3 px-4 text-center text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === "programs"
                ? "bg-slate-900 text-white shadow"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>International Offerings ({programs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex-1 py-3 px-4 text-center text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === "audit"
                ? "bg-slate-900 text-white shadow"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Systemic Audit Logs ({auditLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("surveys")}
            className={`flex-1 py-3 px-4 text-center text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === "surveys"
                ? "bg-slate-900 text-white shadow"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Program Surveys ({surveys.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "applications" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
            {/* Filter Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/50">
              <div className="relative flex-1">
                <Search className="absolute inset-y-0 left-0 pl-3 h-5 w-5 text-slate-400 self-center" />
                <input
                  type="text"
                  placeholder="Search student, email, or program details..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-xs placeholder-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div className="flex items-center space-x-2.5">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500">Status Filter:</span>
                <select
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-xs font-medium text-slate-600 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value={ApplicationStatus.SUBMITTED}>Submitted</option>
                  <option value={ApplicationStatus.UNDER_REVIEW}>Under Review</option>
                  <option value={ApplicationStatus.APPROVED}>Approved</option>
                  <option value={ApplicationStatus.REJECTED}>Rejected</option>
                  <option value={ApplicationStatus.DRAFT}>Draft</option>
                </select>
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50 font-mono text-[10px] uppercase text-slate-400 font-bold">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 text-left">Student Profile</th>
                    <th scope="col" className="px-6 py-3.5 text-left">Program Applied</th>
                    <th scope="col" className="px-6 py-3.5 text-center">Academic GPA</th>
                    <th scope="col" className="px-6 py-3.5 text-center">Status</th>
                    <th scope="col" className="px-6 py-3.5 scope-col text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-400 text-xs">
                        No applications matched your search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => {
                      const student = students.find((s) => s.id === app.studentId);
                      const program = programs.find((p) => p.id === app.programId);

                      // Check gpa eligibility
                      const isGpaEligible = student ? student.gpa >= (program?.prerequisiteGPA || 0) : true;

                      return (
                        <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              {student?.avatarUrl ? (
                                <img src={student.avatarUrl} alt={student.name} referrerPolicy="no-referrer" className="h-8 w-8 rounded-full border" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                                  {student?.name?.charAt(0)}
          </div>
        )}

        {/* Surveys Summary Tab */}
        {activeTab === "surveys" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xs font-bold text-slate-900 font-display">Program Satisfaction Survey Summary</h3>
                <p className="text-[10px] text-slate-400">Aggregated ratings from participating students.</p>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-white py-1 px-2.5 border rounded border-slate-200">
                {surveys.length} response{surveys.length !== 1 ? "s" : ""}
              </span>
            </div>

            {surveys.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No survey responses submitted yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50 font-mono text-[10px] uppercase text-slate-400 font-bold">
                    <tr>
                      <th className="px-4 py-3 text-left">Student</th>
                      <th className="px-4 py-3 text-left">Program</th>
                      <th className="px-4 py-3 text-center">Overall</th>
                      <th className="px-4 py-3 text-center">Teaching</th>
                      <th className="px-4 py-3 text-center">Facilities</th>
                      <th className="px-4 py-3 text-center">Culture</th>
                      <th className="px-4 py-3 text-center">Avg</th>
                      <th className="px-4 py-3 text-left">Comment</th>
                      <th className="px-4 py-3 text-right">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {surveys.map((s) => {
                      const avg = ((s.overallRating + s.teachingQuality + s.facilities + s.culturalExperience) / 4).toFixed(1);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-900">{s.studentName}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600 max-w-[160px] truncate">{s.programTitle}</td>
                          <td className="px-4 py-3 text-center text-xs">{s.overallRating}★</td>
                          <td className="px-4 py-3 text-center text-xs">{s.teachingQuality}★</td>
                          <td className="px-4 py-3 text-center text-xs">{s.facilities}★</td>
                          <td className="px-4 py-3 text-center text-xs">{s.culturalExperience}★</td>
                          <td className="px-4 py-3 text-center text-xs font-bold font-mono">{avg}</td>
                          <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate">{s.comment}</td>
                          <td className="px-4 py-3 text-right text-[10px] font-mono text-slate-400 whitespace-nowrap">{new Date(s.submittedAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
                              <div>
                                <div className="text-xs font-bold text-slate-900">{student?.name}</div>
                                <div className="text-[10px] font-mono text-slate-400">{student?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs font-medium text-slate-800 truncate max-w-xs">
                              {program?.title}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-400">
                              <span>Deadline: {program?.deadline}</span>
                              <span>·</span>
                              <span>모집인원: {program?.capacity}명</span>
                              <span>·</span>
                              <span>
                                달성률: {program ? getProgramFillRate(program) : 0}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-xs font-bold font-mono text-slate-950">
                              {student?.gpa.toFixed(2)}
                            </div>
                            <div className="text-[9px] font-mono text-slate-400">
                              Req: {program?.prerequisiteGPA.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              app.status === ApplicationStatus.APPROVED ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                              app.status === ApplicationStatus.REJECTED ? "bg-red-50 text-red-700 border border-red-200" :
                              app.status === ApplicationStatus.UNDER_REVIEW ? "bg-amber-50 text-amber-700 border border-amber-200" :
                              app.status === ApplicationStatus.SUBMITTED ? "bg-blue-50 text-blue-700 border border-blue-200" :
                              "bg-slate-100 text-slate-600"
                            }`}>
                              {app.status === ApplicationStatus.APPROVED && <CheckCircle className="h-3 w-3" />}
                              {app.status === ApplicationStatus.REJECTED && <XCircle className="h-3 w-3" />}
                              {app.status === ApplicationStatus.UNDER_REVIEW && <Clock className="h-3 w-3 animate-pulse" />}
                              <span>{app.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {!isGpaEligible && (
                                <span className="inline-flex items-center text-red-600" title="Student GPA falls below prerequisite limit">
                                  <AlertTriangle className="h-4 w-4" />
                                </span>
                              )}
                              <button
                                onClick={() => openReviewDrawer(app)}
                                className="inline-flex items-center space-x-1 py-1 px-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[10px] rounded transition-all cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Evaluate</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "programs" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">Manage Offerings</h3>
                <p className="text-xs text-slate-500">Add, configure, or temporarily disable global study placements.</p>
              </div>

              <button
                onClick={openAddProgramModal}
                className="inline-flex items-center space-x-1.5 py-2 px-3 bg-red-700 hover:bg-red-800 rounded-lg text-xs font-semibold text-white transition-all shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Create Offering</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programs.map((prog) => (
                <div key={prog.id} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2.5">
                      <span className={`py-0.5 px-2 rounded text-[10px] font-mono font-bold uppercase ${
                        prog.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}>
                        {prog.isActive ? "Active" : "Archived / Inactive"}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {prog.deadline} · {prog.capacity}명 · {getProgramFillRate(prog)}%
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-950 font-display mb-1.5">{prog.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">{prog.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4">
                      <div>
                        <span className="block text-slate-500 font-bold uppercase">Region:</span>
                        <span className="text-slate-800 font-medium">{prog.location}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 font-bold uppercase">Duration:</span>
                        <span className="text-slate-800 font-medium">{prog.duration}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 font-bold uppercase">Deadline:</span>
                        <span className="text-slate-800 font-medium">{prog.deadline}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 font-bold uppercase">Capacity / Rate:</span>
                        <span className="text-slate-800 font-medium">
                          {prog.capacity}명 / {getProgramFillRate(prog)}%
                        </span>
                      </div>
                      <div className="pt-1 border-t border-slate-200/60 col-span-2 flex justify-between items-center">
                        <span className="uppercase text-slate-500 font-bold">GPA CUTOFF:</span>
                        <span className="text-red-700 font-bold">{prog.prerequisiteGPA.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleToggleProgramActive(prog.id, prog.title, prog.isActive)}
                      className={`inline-flex items-center space-x-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                        prog.isActive ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {prog.isActive ? (
                        <>
                          <ToggleRight className="h-5 w-5" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-5 w-5" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditProgramModal(prog)}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer"
                        title="Edit config parameters"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProgram(prog.id, prog.title)}
                        className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors cursor-pointer"
                        title="Delete permanently"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "audit" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xs font-bold text-slate-900 font-display">Relational Audit Engine</h3>
                <p className="text-[10px] text-slate-400">Verifying SSO, application status edits, and program mutations.</p>
              </div>

              <span className="text-[10px] font-mono text-slate-500 bg-white py-1 px-2.5 border rounded border-slate-200">
                Auditor active
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto font-mono text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-start gap-3">
                  <div className="md:w-44 flex-shrink-0 text-left">
                    <div className="text-[10px] text-slate-400 font-medium">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-900 text-white text-[9px] font-bold">
                      {log.action}
                    </span>
                  </div>

                  <div className="flex-1 text-left">
                    <p className="text-slate-700 leading-relaxed font-sans">{log.details}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-400">
                      <span>Actor: <strong className="text-slate-600">{log.actor}</strong> ({log.actorRole})</span>
                      <span>• Target: <strong className="text-slate-600">{log.target}</strong></span>
                      {log.protocolUsed && (
                        <span className="text-emerald-600 font-semibold">• Protocol: {log.protocolUsed}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Review & Evaluation Detail Drawer/Modal */}
      {selectedApp && (() => {
        const student = students.find((s) => s.id === selectedApp.studentId);
        const program = programs.find((p) => p.id === selectedApp.programId);
        const isGpaEligible = student ? student.gpa >= (program?.prerequisiteGPA || 0) : true;

        return (
          <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity" onClick={() => setSelectedApp(null)}></div>

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Header */}
                  <div className="pb-4 border-b border-slate-200 flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950 font-display">Evaluate Application</h3>
                      <p className="text-xs text-slate-400">Application Reference ID: <strong className="font-mono text-slate-700">{selectedApp.id}</strong></p>
                    </div>
                    <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1 cursor-pointer">
                      Close
                    </button>
                  </div>

                  {/* Student Profile Overview */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">1. Applicant Profile</span>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3 text-left">
                      {student?.avatarUrl ? (
                        <img src={student.avatarUrl} alt={student.name} referrerPolicy="no-referrer" className="h-10 w-10 rounded-full border border-slate-200 shadow-xs" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shadow-xs">
                          {student?.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{student?.name}</h4>
                        <p className="text-xs text-slate-500 font-mono">{student?.email}</p>
                        <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono text-slate-400">
                          <span>Major: <strong className="text-slate-700 font-sans">{student?.department}</strong></span>
                          <span>ID Num: <strong className="text-slate-700">{student?.studentIdNumber}</strong></span>
                          <span>Credits: <strong className="text-slate-700">{student?.completedCredits} / 130</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Program Requirements Match */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">2. Target Program Eligibility</span>
                    <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-3 text-left">
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">{program?.title}</h5>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">Region: {program?.location} | Duration: {program?.duration}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                        <div className="bg-slate-50 p-2.5 rounded-lg text-center">
                          <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Student GPA</span>
                          <span className={`text-lg font-mono font-bold ${isGpaEligible ? "text-emerald-600" : "text-red-600"}`}>
                            {student?.gpa.toFixed(2)}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-lg text-center">
                          <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Cutoff GPA Required</span>
                          <span className="text-lg font-mono font-bold text-slate-700">
                            {program?.prerequisiteGPA.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {isGpaEligible ? (
                        <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                          <CheckCircle className="h-4 w-4" />
                          <span>Student meets academic prerequisite cutoff standard.</span>
                        </div>
                      ) : (
                        <div className="flex items-start space-x-2 text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-100">
                          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold block">Prerequisite Warning!</span>
                            Student's current GPA ({student?.gpa.toFixed(2)}) is lower than the mandatory prerequisite cutoff ({program?.prerequisiteGPA.toFixed(2)}) required for this program.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Statement of Purpose */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">3. Statement of Purpose</span>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-sans text-xs text-slate-700 leading-relaxed text-left whitespace-pre-wrap">
                      "{selectedApp.statementOfPurpose || "No Statement of Purpose submitted."}"
                    </div>
                  </div>

                  {/* Submitted Documents */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">4. Attached Documents ({selectedApp.documents.length})</span>
                    <div className="space-y-2">
                      {selectedApp.documents.map((doc, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2.5 bg-white border border-slate-200 rounded-lg text-xs hover:bg-slate-50">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <span className="font-medium text-slate-800">{doc.name}</span>
                          </div>
                          <button className="text-red-700 hover:text-red-900 font-semibold inline-flex items-center space-x-1 cursor-pointer">
                            <Download className="h-3.5 w-3.5" />
                            <span className="text-[10px]">Download</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Historical Evaluation Timeline */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">5. Evaluation History Logs</span>
                    <div className="relative border-l-2 border-slate-100 pl-4 ml-2 space-y-4 text-left">
                      {selectedApp.history.map((hist, idx) => (
                        <div key={idx} className="relative">
                          {/* Bullet marker */}
                          <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-slate-300"></span>
                          <div className="text-[10px] font-mono text-slate-400">
                            {new Date(hist.updatedAt).toLocaleString()} | Actor: {hist.updatedBy}
                          </div>
                          <div className="text-xs font-semibold text-slate-800 mt-0.5">
                            Status shifted to <span className="text-red-700">{hist.status}</span>
                          </div>
                          {hist.notes && (
                            <p className="text-[11px] text-slate-500 italic mt-0.5 bg-slate-50 p-2 rounded border border-slate-100">
                              Notes: {hist.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evaluator Update Controls */}
                  <div className="pt-4 border-t border-slate-200 space-y-3 text-left">
                    <label className="text-xs font-bold text-slate-800 block">Update Status Evaluation</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[ApplicationStatus.UNDER_REVIEW, ApplicationStatus.APPROVED, ApplicationStatus.REJECTED].map((stat) => (
                        <button
                          key={stat}
                          onClick={() => setReviewStatus(stat)}
                          className={`py-2 px-3 text-center text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                            reviewStatus === stat
                              ? "bg-slate-900 text-white border-slate-950 shadow-md"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {stat}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <label className="text-xs font-bold text-slate-800 block mb-1">Evaluation & Coordinator Notes</label>
                      <textarea
                        rows={3}
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="State your reasons for approval, rejection, or requirements request..."
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 bg-slate-5 font-sans"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border-t border-slate-200 flex space-x-3">
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="flex-1 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold rounded-xl text-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    className="flex-1 py-2.5 bg-red-700 hover:bg-red-800 text-xs font-semibold rounded-xl text-white transition-all shadow-md cursor-pointer flex justify-center items-center"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    Apply Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Program Config Modal (Add/Edit) */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity" onClick={() => setIsProgramModalOpen(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-middle bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-100">
              <form onSubmit={handleProgramFormSubmit}>
                <div className="bg-white px-6 pt-5 pb-4 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-950 font-display">
                      {editingProgram ? "Configure Program Offering" : "Add International Opportunity"}
                    </h3>
                    <button type="button" onClick={() => setIsProgramModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-semibold cursor-pointer">
                      Close
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">Program Title</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g. National University of Singapore Exchange (Fall 2026)"
                        value={programForm.title}
                        onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 bg-slate-50 font-sans"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">Description / Brief Overview</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Detailed course limits, tuition support info, and housing recommendations..."
                        value={programForm.description}
                        onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 bg-slate-5"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">Target Department</label>
                        <select
                          value={programForm.department}
                          onChange={(e) => setProgramForm({ ...programForm, department: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:outline-none"
                        >
                          <option value="All Departments">All Departments</option>
                          <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                          <option value="Electrical Engineering">Electrical Engineering</option>
                          <option value="Business Administration">Business Administration</option>
                          <option value="Liberal Arts & Social Sciences">Liberal Arts & Social Sciences</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">Prerequisite GPA Cutoff</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.00"
                          max="4.50"
                          required
                          value={programForm.prerequisiteGPA}
                          onChange={(e) => setProgramForm({ ...programForm, prerequisiteGPA: parseFloat(e.target.value) })}
                          className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">Location</label>
                        <input
                          type="text"
                          required
                          placeholder="Singapore"
                          value={programForm.location}
                          onChange={(e) => setProgramForm({ ...programForm, location: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl p-2 text-xs bg-slate-50 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">Duration</label>
                        <input
                          type="text"
                          required
                          placeholder="1 Semester"
                          value={programForm.duration}
                          onChange={(e) => setProgramForm({ ...programForm, duration: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl p-2 text-xs bg-slate-50 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">Capacity</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={programForm.capacity}
                          onChange={(e) => setProgramForm({ ...programForm, capacity: parseInt(e.target.value) })}
                          className="w-full border border-slate-200 rounded-xl p-2 text-xs bg-slate-50 font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">Deadline Date</label>
                      <input
                        type="date"
                        required
                        value={programForm.deadline}
                        onChange={(e) => setProgramForm({ ...programForm, deadline: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl p-2 text-xs bg-slate-50 font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsProgramModalOpen(false)}
                    className="py-2 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold rounded-xl text-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-red-700 hover:bg-red-800 text-xs font-semibold rounded-xl text-white transition-all shadow-sm cursor-pointer"
                  >
                    {editingProgram ? "Update Offering" : "Add Offering"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
