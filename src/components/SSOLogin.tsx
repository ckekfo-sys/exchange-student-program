import React, { useState } from "react";
import { AuthProtocol, UserRole, AuthSession, Student } from "../types";
import { ShieldCheck, KeyRound, Info, HelpCircle, ArrowRight, Server, FileCode2 } from "lucide-react";
import { motion } from "motion/react";

interface SSOLoginProps {
  onLoginSuccess: (session: AuthSession) => void;
  userStudent: Student;
}

export default function SSOLogin({ onLoginSuccess, userStudent }: SSOLoginProps) {
  const [protocol, setProtocol] = useState<AuthProtocol>(AuthProtocol.OIDC);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);
  const [customEmail, setCustomEmail] = useState<string>("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState<"idle" | "handshake" | "assertion" | "success">("idle");

  const handleCustomEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomEmail(e.target.value);
  };

  const executeSSO = () => {
    setIsAuthenticating(true);
    setAuthStep("handshake");

    // Simulate SSO steps
    setTimeout(() => {
      setAuthStep("assertion");
      setTimeout(() => {
        setAuthStep("success");
        setTimeout(() => {
          // Finish SSO
          const timestamp = new Date().toISOString();
          const emailToUse = customEmail.trim() || (selectedRole === UserRole.STUDENT ? userStudent.email : "admin_coord@korea.ac.kr");
          const nameToUse = selectedRole === UserRole.STUDENT ? userStudent.name : "Professor Hwang";

          let ssoMetadata: any = {
            issuer: `https://idp.korea.ac.kr/${protocol === AuthProtocol.SAML ? "saml2" : protocol === AuthProtocol.OIDC ? "oauth2" : "cas"}`,
            audience: "https://student-program-portal.korea.ac.kr",
            authInstant: timestamp,
          };

          if (protocol === AuthProtocol.SAML) {
            ssoMetadata.samlAssertion = `<?xml version="1.0" encoding="UTF-8"?>
<saml2:Assertion ID="_s290a182b8109d9a10f823a0c2104" IssueInstant="${timestamp}" Version="2.0" xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">
  <saml2:Issuer>https://idp.korea.ac.kr/saml2</saml2:Issuer>
  <saml2:Subject>
    <saml2:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">${emailToUse}</saml2:NameID>
    <saml2:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer"/>
  </saml2:Subject>
  <saml2:Conditions NotBefore="${timestamp}" NotOnOrAfter="${new Date(Date.now() + 3600000).toISOString()}">
    <saml2:AudienceRestriction>
      <saml2:Audience>https://student-program-portal.korea.ac.kr</saml2:Audience>
    </saml2:AudienceRestriction>
  </saml2:Conditions>
  <saml2:AttributeStatement>
    <saml2:Attribute Name="studentId" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
      <saml2:AttributeValue>${selectedRole === UserRole.STUDENT ? userStudent.studentIdNumber : "COORD2026"}</saml2:AttributeValue>
    </saml2:Attribute>
    <saml2:Attribute Name="displayName" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
      <saml2:AttributeValue>${nameToUse}</saml2:AttributeValue>
    </saml2:Attribute>
    <saml2:Attribute Name="userRole" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
      <saml2:AttributeValue>${selectedRole}</saml2:AttributeValue>
    </saml2:Attribute>
  </saml2:AttributeStatement>
</saml2:Assertion>`;
          } else if (protocol === AuthProtocol.OIDC) {
            ssoMetadata.oidcClaims = {
              iss: "https://idp.korea.ac.kr/oauth2",
              sub: `ku_${selectedRole === UserRole.STUDENT ? "std_11492" : "staff_084"}`,
              aud: "student-program-portal-client-id",
              exp: Math.floor(Date.now() / 1000) + 3600,
              iat: Math.floor(Date.now() / 1000),
              email: emailToUse,
              email_verified: true,
              name: nameToUse,
              "https://korea.ac.kr/claims/role": selectedRole,
              "https://korea.ac.kr/claims/department": selectedRole === UserRole.STUDENT ? userStudent.department : "Office of International Affairs",
              "https://korea.ac.kr/claims/gpa": selectedRole === UserRole.STUDENT ? userStudent.gpa : null,
            };
          } else {
            ssoMetadata.casTicket = `ST-832104-a82f3c9d01e-koreaIdp`;
          }

          const session: AuthSession = {
            isAuthenticated: true,
            user: {
              id: selectedRole === UserRole.STUDENT ? userStudent.id : "user-coord-01",
              name: nameToUse,
              email: emailToUse,
              role: selectedRole,
              studentDetails: selectedRole === UserRole.STUDENT ? {
                ...userStudent,
                email: emailToUse,
              } : undefined
            },
            ssoMethod: protocol,
            ssoMetadata
          };

          onLoginSuccess(session);
          setIsAuthenticating(false);
          setAuthStep("idle");
        }, 1200);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-2xl text-red-700 mb-4 shadow-sm border border-red-200">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
          KU Program Portal
        </h2>
        <p className="mt-2 text-sm text-slate-500 font-sans">
          Student Program Application & Management System
        </p>
        <p className="text-xs text-red-700 font-mono mt-1 font-medium px-2 py-0.5 bg-red-50 inline-block rounded border border-red-100">
          Korea University Unified Single Sign-On
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-slate-100">
          {!isAuthenticating ? (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  1. Choose Identity Protocol (SSO/OIDC/SAML)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[AuthProtocol.OIDC, AuthProtocol.SAML, AuthProtocol.CAS].map((p) => {
                    const isSelected = protocol === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        id={`btn-protocol-${p.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                        onClick={() => setProtocol(p)}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-950 shadow-md"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        {p === AuthProtocol.OIDC ? "OIDC" : p === AuthProtocol.SAML ? "SAML 2.0" : "CAS 3.0"}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-xs text-slate-400 italic">
                  {protocol === AuthProtocol.OIDC && "Uses modern OAuth 2.0 bearer tokens with raw JSON claims payload."}
                  {protocol === AuthProtocol.SAML && "Uses enterprise XML assertions signed with institutional certificates."}
                  {protocol === AuthProtocol.CAS && "Uses tickets checked against university security CAS endpoints."}
                </p>
              </div>

              <div>
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  2. Select Authentication Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    id="btn-role-student"
                    onClick={() => setSelectedRole(UserRole.STUDENT)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedRole === UserRole.STUDENT
                        ? "border-red-600 bg-red-50 text-red-900 shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-sm font-bold">Student Portal</span>
                    <span className="text-[11px] text-slate-500 text-center mt-1">Browse and apply to overseas programs</span>
                  </button>

                  <button
                    type="button"
                    id="btn-role-admin"
                    onClick={() => setSelectedRole(UserRole.COORDINATOR)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedRole === UserRole.COORDINATOR
                        ? "border-red-600 bg-red-50 text-red-900 shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-sm font-bold">Coordinator Console</span>
                    <span className="text-[11px] text-slate-500 text-center mt-1">Manage offerings, approve applications</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 block">
                    3. Identity Email Input (Optional)
                  </label>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Optional Custom</span>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="input-sso-email"
                    value={customEmail}
                    onChange={handleCustomEmailChange}
                    placeholder={selectedRole === UserRole.STUDENT ? userStudent.email : "admin_coord@korea.ac.kr"}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  id="btn-submit-sso"
                  onClick={executeSSO}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 shadow-md transition-all cursor-pointer"
                >
                  Authenticate via SSO
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-red-600 animate-spin"></div>
                <Server className="h-6 w-6 text-red-700 absolute inset-0 m-auto animate-pulse" />
              </div>

              <h3 className="text-lg font-bold text-slate-950 font-display">
                Connecting to Identity Provider (IdP)...
              </h3>

              <div className="w-full mt-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-3">
                  <FileCode2 className="h-4 w-4 text-slate-400" />
                  <span>Protocol: {protocol}</span>
                </div>

                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Redirect Handshake</span>
                    <span className={`font-semibold ${authStep !== "idle" ? "text-emerald-600" : "text-slate-400 animate-pulse"}`}>
                      {authStep !== "idle" ? "SUCCESS" : "WAITING..."}
                    </span>
                  </div>
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-1000"
                      style={{ width: authStep === "handshake" ? "50%" : authStep !== "idle" ? "100%" : "0%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-slate-500">Security Assertion / Signature Verification</span>
                    <span className={`font-semibold ${authStep === "assertion" || authStep === "success" ? "text-emerald-600 animate-pulse" : "text-slate-400"}`}>
                      {authStep === "assertion" || authStep === "success" ? "VERIFYING..." : "PENDING"}
                    </span>
                  </div>
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-1000"
                      style={{ width: authStep === "assertion" ? "80%" : authStep === "success" ? "100%" : "0%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-slate-500">Callback Session Binding</span>
                    <span className={`font-semibold ${authStep === "success" ? "text-emerald-600" : "text-slate-400"}`}>
                      {authStep === "success" ? "COMPLETED" : "PENDING"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-start p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs shadow-sm">
          <Info className="h-4 w-4 mr-2.5 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Security Notice:</span> This management system relies on Korea University’s secure Single Sign-On (SAML 2.0 / OIDC) architecture to automatically fetch certified enrollment files and current GPA scores. Authenticating automatically matches student roles to secure database indexes.
          </div>
        </div>
      </div>
    </div>
  );
}
