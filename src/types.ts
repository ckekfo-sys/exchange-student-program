export enum ApplicationStatus {
  DRAFT = "Draft",
  SUBMITTED = "Submitted",
  UNDER_REVIEW = "Under Review",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

export enum UserRole {
  STUDENT = "student",
  COORDINATOR = "coordinator",
  ADMIN = "admin"
}

export enum AuthProtocol {
  SAML = "SAML 2.0",
  OIDC = "OIDC (OpenID Connect)",
  CAS = "CAS 3.0"
}

export interface ParticipationHistory {
  programId: string;
  programTitle: string;
  location: string;
  duration: string;
  year: string;
  status: "Completed" | "Ongoing";
  description: string;
}

export interface SurveyResponse {
  id: string;
  studentId: string;
  studentName: string;
  programId: string;
  programTitle: string;
  overallRating: number;
  teachingQuality: number;
  facilities: number;
  culturalExperience: number;
  comment: string;
  submittedAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
  gpa: number;
  completedCredits: number;
  studentIdNumber: string;
  avatarUrl?: string;
  previousParticipation?: ParticipationHistory[];
}

export interface Program {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  duration: string;
  capacity: number;
  deadline: string;
  prerequisiteGPA: number;
  isActive: boolean;
  requiredDocuments: string[];
}

export interface Application {
  id: string;
  studentId: string;
  programId: string;
  status: ApplicationStatus;
  gpaAtTimeOfApplication: number;
  statementOfPurpose: string;
  submittedAt: string;
  documents: { name: string; url: string; uploadedAt: string }[];
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  history: {
    status: ApplicationStatus;
    updatedAt: string;
    updatedBy: string;
    notes?: string;
  }[];
}

export interface AuditLog {
  id: string;
  action: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  target: string;
  details: string;
  protocolUsed?: AuthProtocol;
}

export interface AuthSession {
  isAuthenticated: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    studentDetails?: Student;
  };
  ssoMethod?: AuthProtocol;
  ssoMetadata?: {
    issuer: string;
    audience: string;
    samlAssertion?: string; // Raw XML simulation
    oidcClaims?: Record<string, any>; // OIDC Claims JSON
    casTicket?: string; // CAS ticket validation response
    authInstant: string;
  };
}
