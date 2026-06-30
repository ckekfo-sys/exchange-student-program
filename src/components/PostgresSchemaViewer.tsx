import React, { useState } from "react";
import { POSTGRESQL_SCHEMA_SQL } from "../data";
import { Database, Copy, Check, Info, Table2, Layers2, FileSpreadsheet, Share2 } from "lucide-react";

export default function PostgresSchemaViewer() {
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTable, setSelectedTable] = useState<string>("all");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(POSTGRESQL_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaTables = [
    {
      name: "students",
      description: "Holds primary directory and academic credentials synced from Single Sign-On.",
      columns: [
        { name: "id", type: "UUID", desc: "Primary key. Unique identifier." },
        { name: "student_id_number", type: "VARCHAR(20)", desc: "Unique student identifier." },
        { name: "name", type: "VARCHAR(100)", desc: "Student's full name." },
        { name: "email", type: "VARCHAR(100)", desc: "Unique academic email." },
        { name: "department", type: "VARCHAR(100)", desc: "Associated major department." },
        { name: "gpa", type: "NUMERIC(3,2)", desc: "Calculated academic GPA (0.00 - 4.50)." },
        { name: "completed_credits", type: "INT", desc: "Total successfully completed academic credits." },
        { name: "avatar_url", type: "TEXT", desc: "Optional student photo profile URL." }
      ]
    },
    {
      name: "programs",
      description: "Stores international opportunities and eligibility thresholds.",
      columns: [
        { name: "id", type: "UUID", desc: "Primary key. Unique identifier." },
        { name: "title", type: "VARCHAR(200)", desc: "Program name." },
        { name: "description", type: "TEXT", desc: "Detailed informational copy." },
        { name: "department", type: "VARCHAR(150)", desc: "Limiting departments or 'All'." },
        { name: "location", type: "VARCHAR(100)", desc: "Target country or city." },
        { name: "duration", type: "VARCHAR(100)", desc: "E.g. '1 Semester' or '2 Months'." },
        { name: "capacity", type: "INT", desc: "Total allowable candidates." },
        { name: "deadline", type: "DATE", desc: "Hard date cutoff for submissions." },
        { name: "prerequisite_gpa", type: "NUMERIC(3,2)", desc: "Minimum GPA required for application." },
        { name: "is_active", type: "BOOLEAN", desc: "Flag controlling student availability." },
        { name: "required_documents", type: "TEXT[]", desc: "Array containing titles of mandatory documents." }
      ]
    },
    {
      name: "applications",
      description: "Junction table mapping student submissions with programs.",
      columns: [
        { name: "id", type: "UUID", desc: "Primary key. Application identifier." },
        { name: "student_id", type: "UUID", desc: "Foreign Key -> students(id)." },
        { name: "program_id", type: "UUID", desc: "Foreign Key -> programs(id)." },
        { name: "status", type: "application_status", desc: "Draft, Submitted, Under Review, Approved, Rejected." },
        { name: "gpa_at_time_of_application", type: "NUMERIC(3,2)", desc: "Snapshot of student GPA when submitting." },
        { name: "statement_of_purpose", type: "TEXT", desc: "Self-authored intent letter." },
        { name: "submitted_at", type: "TIMESTAMP", desc: "Submitting timestamp." },
        { name: "reviewed_at", type: "TIMESTAMP", desc: "Approval or rejection timestamp." },
        { name: "reviewed_by", type: "VARCHAR(100)", desc: "Coordinator user identifier." },
        { name: "review_notes", type: "TEXT", desc: "Coordination team remarks." }
      ]
    },
    {
      name: "application_documents",
      description: "Stores links to user-uploaded PDF files per application.",
      columns: [
        { name: "id", type: "UUID", desc: "Primary key. File record identifier." },
        { name: "application_id", type: "UUID", desc: "Foreign Key -> applications(id)." },
        { name: "file_name", type: "VARCHAR(255)", desc: "Name of document e.g. SOP.pdf." },
        { name: "file_url", type: "TEXT", desc: "Secure cloud storage URL path." },
        { name: "uploaded_at", type: "TIMESTAMP", desc: "Uploading timestamp." }
      ]
    },
    {
      name: "application_history",
      description: "Immutable timeline log of application status updates.",
      columns: [
        { name: "id", type: "UUID", desc: "Primary key. Timeline identifier." },
        { name: "application_id", type: "UUID", desc: "Foreign Key -> applications(id)." },
        { name: "previous_status", type: "application_status", desc: "State prior to update." },
        { name: "new_status", type: "application_status", desc: "State after update." },
        { name: "updated_by", type: "VARCHAR(150)", desc: "Coordinator email or system service." },
        { name: "notes", type: "TEXT", desc: "Reasoning for the transition." },
        { name: "updated_at", type: "TIMESTAMP", desc: "Transition timestamp." }
      ]
    },
    {
      name: "participation_history",
      description: "Tracks previous exchange programs completed by each student.",
      columns: [
        { name: "id", type: "UUID", desc: "Primary key." },
        { name: "student_id", type: "UUID", desc: "Foreign Key -> students(id)." },
        { name: "program_title", type: "VARCHAR(200)", desc: "Name of past program attended." },
        { name: "location", type: "VARCHAR(100)", desc: "Host institution location." },
        { name: "duration", type: "VARCHAR(100)", desc: "E.g. '6 Weeks', '1 Semester'." },
        { name: "year", type: "VARCHAR(20)", desc: "Year of participation." },
        { name: "status", type: "VARCHAR(20)", desc: "'Completed' or 'Ongoing'." },
        { name: "description", type: "TEXT", desc: "Summary of achievements and activities." }
      ]
    },
    {
      name: "audit_logs",
      description: "Security events tracking system and authentication details (SSO, etc).",
      columns: [
        { name: "id", type: "UUID", desc: "Primary key. Event identifier." },
        { name: "action", type: "VARCHAR(100)", desc: "E.g. 'USER_SSO_LOGIN', 'STATUS_UPDATE'." },
        { name: "actor", type: "VARCHAR(150)", desc: "User or program execution agent." },
        { name: "actor_role", type: "user_role", desc: "E.g. student, coordinator, admin." },
        { name: "target_id", type: "VARCHAR(100)", desc: "ID of modified element." },
        { name: "protocol_used", type: "sso_protocol", desc: "SAML, OIDC, CAS (if auth related)." },
        { name: "details", type: "TEXT", desc: "Plaintext operational logs." },
        { name: "timestamp", type: "TIMESTAMP", desc: "Execution timestamp." }
      ]
    }
  ];

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-850">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pb-6 border-b border-slate-800 mb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-800 rounded-lg text-emerald-400">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-display font-bold">PostgreSQL Relational Schema</h3>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Standard DDL with relational connections, constraints, indices, and audit structures.
          </p>
        </div>

        <button
          onClick={copyToClipboard}
          className="inline-flex items-center space-x-2 py-2 px-3.5 bg-slate-800 hover:bg-slate-755 border border-slate-700 rounded-lg text-xs font-semibold text-emerald-400 transition-all cursor-pointer"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? "SQL Copied!" : "Copy Full DDL Script"}</span>
        </button>
      </div>

      {/* Grid Layout of Visual Schema Mapping & DDL viewer */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Interactive Diagram */}
        <div className="xl:col-span-7 space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Table2 className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Visual Relationship Graph
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                6 Tables Defined
              </span>
            </div>

            {/* Relational Entity Nodes */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {schemaTables.map((tbl) => (
                <div
                  key={tbl.name}
                  onClick={() => setSelectedTable(tbl.name)}
                  className={`p-3.5 rounded-xl transition-all cursor-pointer border ${
                    selectedTable === tbl.name
                      ? "bg-slate-850 border-emerald-500 shadow-md shadow-emerald-950/20"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                      <span className="text-sm font-bold font-mono text-white">
                        {tbl.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-sans bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Table
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-sans mb-3 leading-relaxed">
                    {tbl.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/60">
                    {tbl.columns.slice(0, 4).map((col) => (
                      <div key={col.name} className="bg-slate-950 p-1.5 rounded border border-slate-850 text-left">
                        <div className="text-[10px] font-mono font-bold text-slate-300 truncate">
                          {col.name}
                        </div>
                        <div className="text-[9px] font-mono text-emerald-400 truncate uppercase mt-0.5">
                          {col.type}
                        </div>
                      </div>
                    ))}
                    {tbl.columns.length > 4 && (
                      <div className="bg-slate-950 p-1.5 rounded border border-slate-850 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                        +{tbl.columns.length - 4} columns
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Foreign Key Relation indicators */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-x-4 gap-y-2 justify-center">
              <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400">
                <span className="inline-block w-2.5 h-0.5 bg-emerald-400"></span>
                <span>students(id)</span>
                <span className="text-slate-600">→</span>
                <span>applications(student_id)</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400">
                <span className="inline-block w-2.5 h-0.5 bg-emerald-400"></span>
                <span>programs(id)</span>
                <span className="text-slate-600">→</span>
                <span>applications(program_id)</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400">
                <span className="inline-block w-2.5 h-0.5 bg-emerald-400"></span>
                <span>applications(id)</span>
                <span className="text-slate-600">→</span>
                <span>history & docs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Schema Columns Details or Raw SQL Tab */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <Layers2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    {selectedTable === "all" ? "Schema Inspector" : `${selectedTable} Column Spec`}
                  </span>
                </div>
                {selectedTable !== "all" && (
                  <button
                    onClick={() => setSelectedTable("all")}
                    className="text-[10px] text-slate-400 hover:text-white font-mono cursor-pointer"
                  >
                    Reset View
                  </button>
                )}
              </div>

              {selectedTable === "all" ? (
                <div className="space-y-4 py-6 text-center">
                  <Database className="h-10 w-10 text-slate-600 mx-auto animate-pulse" />
                  <div className="max-w-xs mx-auto text-xs text-slate-400 font-sans leading-relaxed">
                    Select a table from the relational graph on the left to inspect detailed PostgreSQL field types, triggers, limits, and constraint properties.
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {schemaTables
                    .find((t) => t.name === selectedTable)
                    ?.columns.map((col) => (
                      <div key={col.name} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between gap-4 items-start">
                        <div className="text-left">
                          <div className="text-xs font-mono font-bold text-white flex items-center space-x-1">
                            <span>{col.name}</span>
                            {col.name === "id" && (
                              <span className="text-[8px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-1 rounded">PK</span>
                            )}
                            {(col.name.endsWith("_id") || col.name === "student_id" || col.name === "program_id") && (
                              <span className="text-[8px] font-mono bg-blue-950 text-blue-400 border border-blue-800 px-1 rounded">FK</span>
                            )}
                          </div>
                          <p className="text-[10.5px] text-slate-400 font-sans mt-0.5">
                            {col.desc}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-[10px] font-mono font-semibold bg-slate-950 text-emerald-400 border border-slate-800 py-0.5 px-2 rounded uppercase">
                            {col.type}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-sans flex items-start gap-2 bg-slate-900/40 p-3 rounded-lg">
              <Info className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-300">Data Integrity rules:</span> Cascade deletes apply only on students, preserving programs. GPA calculations strictly capped at 4.50 (Standard Korean scale).
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Area */}
      <div className="mt-6 bg-slate-950 rounded-xl border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-850">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Raw PostgreSQL DDL Script
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-500">
            PostgreSQL v15+ compliant
          </span>
        </div>
        <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[220px] p-3 rounded-lg bg-slate-900 leading-relaxed text-left border border-slate-850 scrollbar-thin">
          {POSTGRESQL_SCHEMA_SQL}
        </pre>
      </div>
    </div>
  );
}
