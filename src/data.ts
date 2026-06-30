import { Program, Student, Application, ApplicationStatus, AuditLog, UserRole, AuthProtocol, ParticipationHistory, SurveyResponse } from "./types";

export const INITIAL_PROGRAMS: Program[] = [
  {
    id: "prog-nus-2026",
    title: "NUS Student Exchange Program (Fall 2026)",
    description: "Experience academic excellence at the National University of Singapore. Open to all engineering and computer science undergraduates. The program covers standard tuition fees and provides options for on-campus housing.",
    department: "Computer Science & Engineering",
    location: "Singapore",
    duration: "1 Semester (August - December 2026)",
    capacity: 15,
    deadline: "2026-08-15",
    prerequisiteGPA: 3.5,
    isActive: true,
    requiredDocuments: ["Official Academic Transcript", "English Proficiency Certificate (TOEFL/IELTS)", "Statement of Purpose"]
  },
  {
    id: "prog-oxford-summer",
    title: "Oxford Academic Summer Research Programme",
    description: "An intensive 8-week research fellowship at Oxford University, United Kingdom. Students collaborate on cutting-edge humanities, artificial intelligence, and biotechnology projects alongside senior faculty members.",
    department: "All Departments",
    location: "Oxford, United Kingdom",
    duration: "2 Months (July - August 2026)",
    capacity: 5,
    deadline: "2026-07-20",
    prerequisiteGPA: 3.8,
    isActive: true,
    requiredDocuments: ["Official Academic Transcript", "Two Academic Recommendation Letters", "Detailed Research Proposal"]
  },
  {
    id: "prog-sv-intern",
    title: "Global Tech Internship - Silicon Valley Hub",
    description: "Gain hands-on industry experience with pioneering tech companies in San Jose and San Francisco. This competitive internship provides a monthly stipend, housing allowances, and J-1 visa sponsorship assistance.",
    department: "Business & Engineering",
    location: "California, USA",
    duration: "6 Months (September 2026 - February 2027)",
    capacity: 8,
    deadline: "2026-07-30",
    prerequisiteGPA: 3.2,
    isActive: true,
    requiredDocuments: ["Resume / CV", "Portfolio / GitHub Link", "Statement of Purpose"]
  },
  {
    id: "prog-sn-exchange",
    title: "Sorbonne University Exchange Semester",
    description: "Immerse yourself in Parisian culture while pursuing studies in liberal arts, sciences, or economics. Classes are offered in both French and English.",
    department: "Liberal Arts & Social Sciences",
    location: "Paris, France",
    duration: "1 Semester (September 2026 - January 2027)",
    capacity: 10,
    deadline: "2026-08-01",
    prerequisiteGPA: 3.0,
    isActive: true,
    requiredDocuments: ["Official Academic Transcript", "Statement of Purpose", "French Language Assessment (Optional)"]
  },
  {
    id: "prog-muenchen-research",
    title: "TUM Munich Robotics & Automation Lab Fellowship",
    description: "Conduct high-impact research in collaborative robotics and control theory at Technical University of Munich. Strong background in linear algebra and C++/Python is required.",
    department: "Electrical & Mechanical Engineering",
    location: "Munich, Germany",
    duration: "3 Months (September - November 2026)",
    capacity: 4,
    deadline: "2026-07-15",
    prerequisiteGPA: 3.6,
    isActive: false,
    requiredDocuments: ["Official Academic Transcript", "C++ / Python Project Sample", "Statement of Purpose"]
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "std-korea-01",
    name: "Tom Holland",
    email: "tom@korea.ac.kr",
    department: "Computer Science & Engineering",
    gpa: 3.82,
    completedCredits: 92,
    studentIdNumber: "2023014238",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    previousParticipation: [
      {
        programId: "past-1",
        programTitle: "UC Berkeley Summer Session",
        location: "Berkeley, USA",
        duration: "6 Weeks",
        year: "2025",
        status: "Completed",
        description: "Studied intro to AI and linear algebra. Earned 8 credits with a 3.7 GPA."
      }
    ]
  },
  {
    id: "std-korea-02",
    name: "Emma Watson",
    email: "emma@korea.ac.kr",
    department: "Business Administration",
    gpa: 3.65,
    completedCredits: 78,
    studentIdNumber: "2023028491",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    previousParticipation: [
      {
        programId: "past-2",
        programTitle: "UNESCO Youth Leadership Forum",
        location: "Paris, France",
        duration: "2 Weeks",
        year: "2024",
        status: "Completed",
        description: "Selected as Korea University delegate. Led workshops on sustainable development goals."
      }
    ]
  },
  {
    id: "std-korea-03",
    name: "John Smith",
    email: "john@korea.ac.kr",
    department: "Electrical Engineering",
    gpa: 3.48,
    completedCredits: 110,
    studentIdNumber: "2022019482",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    previousParticipation: [
      {
        programId: "past-3",
        programTitle: "Tokyo Tech Winter Lab",
        location: "Tokyo, Japan",
        duration: "4 Weeks",
        year: "2025",
        status: "Completed",
        description: "Worked on embedded systems projects using ARM microcontrollers. Published a technical report."
      },
      {
        programId: "past-4",
        programTitle: "IEEE ROV Competition",
        location: "Seoul, Korea",
        duration: "3 Months",
        year: "2024",
        status: "Completed",
        description: "Team lead for autonomous underwater vehicle project. Won 2nd place overall."
      }
    ]
  },
  {
    id: "std-user",
    name: "Alice Johnson",
    email: "alice@korea.ac.kr",
    department: "Computer Science & Engineering",
    gpa: 3.91,
    completedCredits: 85,
    studentIdNumber: "2023011492",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    previousParticipation: []
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: "app-001",
    studentId: "std-korea-01",
    programId: "prog-nus-2026",
    status: ApplicationStatus.UNDER_REVIEW,
    gpaAtTimeOfApplication: 3.82,
    statementOfPurpose: "My primary motivation is to study distributed systems at NUS and engage with the vibrant academic and multi-cultural student groups in Singapore.",
    submittedAt: "2026-06-25T14:32:00Z",
    documents: [
      { name: "Transcript_SOP_Tom.pdf", url: "#", uploadedAt: "2026-06-25T14:28:00Z" },
      { name: "SOP_TomHolland.pdf", url: "#", uploadedAt: "2026-06-25T14:31:00Z" }
    ],
    history: [
      { status: ApplicationStatus.DRAFT, updatedAt: "2026-06-24T09:15:00Z", updatedBy: "Tom Holland" },
      { status: ApplicationStatus.SUBMITTED, updatedAt: "2026-06-25T14:32:00Z", updatedBy: "Tom Holland" }
    ]
  },
  {
    id: "app-002",
    studentId: "std-korea-02",
    programId: "prog-sv-intern",
    status: ApplicationStatus.APPROVED,
    gpaAtTimeOfApplication: 3.65,
    statementOfPurpose: "As a business major focusing on tech entrepreneurship, participating in the Silicon Valley Hub will provide me with direct industry insights and unmatched networking opportunities.",
    submittedAt: "2026-06-22T10:11:00Z",
    reviewedBy: "Coordinator Team",
    reviewedAt: "2026-06-27T09:00:00Z",
    reviewNotes: "Strong background, excellent portfolio. Candidate demonstrates a clear understanding of startup ecosystems. Approved for final matching phase.",
    documents: [
      { name: "Academic Transcript_Emma.pdf", url: "#", uploadedAt: "2026-06-22T09:55:00Z" },
      { name: "Resume_EmmaWatson.pdf", url: "#", uploadedAt: "2026-06-22T10:05:00Z" }
    ],
    history: [
      { status: ApplicationStatus.DRAFT, updatedAt: "2026-06-20T11:00:00Z", updatedBy: "Emma Watson" },
      { status: ApplicationStatus.SUBMITTED, updatedAt: "2026-06-22T10:11:00Z", updatedBy: "Emma Watson" },
      { status: ApplicationStatus.APPROVED, updatedAt: "2026-06-27T09:00:00Z", updatedBy: "Coordinator Team", notes: "Approved for final matching phase." }
    ]
  },
  {
    id: "app-003",
    studentId: "std-korea-03",
    programId: "prog-oxford-summer",
    status: ApplicationStatus.REJECTED,
    gpaAtTimeOfApplication: 3.48,
    statementOfPurpose: "I want to research computer vision techniques at Oxford summer school and understand current state of artificial intelligence.",
    submittedAt: "2026-06-18T16:05:00Z",
    reviewedBy: "Coordinator Team",
    reviewedAt: "2026-06-24T15:00:00Z",
    reviewNotes: "The Oxford summer research requires a minimum GPA of 3.8. The candidate's GPA (3.48) is below the threshold for this highly selective program. Recommend applying to other outstanding exchange options.",
    documents: [
      { name: "Transcript_JohnSmith.pdf", url: "#", uploadedAt: "2026-06-18T15:55:00Z" },
      { name: "RecommendationLetter_John.pdf", url: "#", uploadedAt: "2026-06-18T16:02:00Z" }
    ],
    history: [
      { status: ApplicationStatus.SUBMITTED, updatedAt: "2026-06-18T16:05:00Z", updatedBy: "John Smith" },
      { status: ApplicationStatus.REJECTED, updatedAt: "2026-06-24T15:00:00Z", updatedBy: "Coordinator Team", notes: "GPA does not meet minimum academic prerequisite of 3.8." }
    ]
  },
  {
    id: "app-004",
    studentId: "std-korea-03",
    programId: "prog-sv-intern",
    status: ApplicationStatus.SUBMITTED,
    gpaAtTimeOfApplication: 3.48,
    statementOfPurpose: "Looking to apply my embedded systems skills in a real-world tech environment. Silicon Valley offers the perfect ecosystem for hands-on engineering growth.",
    submittedAt: "2026-06-20T11:00:00Z",
    documents: [
      { name: "Transcript_John_SV.pdf", url: "#", uploadedAt: "2026-06-20T10:50:00Z" },
      { name: "Portfolio_JohnSmith.pdf", url: "#", uploadedAt: "2026-06-20T10:55:00Z" }
    ],
    history: [
      { status: ApplicationStatus.SUBMITTED, updatedAt: "2026-06-20T11:00:00Z", updatedBy: "John Smith" }
    ]
  },
  {
    id: "app-005",
    studentId: "std-user",
    programId: "prog-nus-2026",
    status: ApplicationStatus.SUBMITTED,
    gpaAtTimeOfApplication: 3.91,
    statementOfPurpose: "My goal is to deepen my understanding of distributed systems and AI through NUS's world-class computer science curriculum.",
    submittedAt: "2026-06-28T09:30:00Z",
    documents: [
      { name: "Transcript_Alice.pdf", url: "#", uploadedAt: "2026-06-28T09:20:00Z" },
      { name: "SOP_AliceJohnson.pdf", url: "#", uploadedAt: "2026-06-28T09:25:00Z" }
    ],
    history: [
      { status: ApplicationStatus.SUBMITTED, updatedAt: "2026-06-28T09:30:00Z", updatedBy: "Alice Johnson" }
    ]
  },
  {
    id: "app-006",
    studentId: "std-user",
    programId: "prog-sn-exchange",
    status: ApplicationStatus.UNDER_REVIEW,
    gpaAtTimeOfApplication: 3.91,
    statementOfPurpose: "Interested in exploring cross-cultural perspectives in computer science through Sorbonne's interdisciplinary programs.",
    submittedAt: "2026-06-26T14:00:00Z",
    documents: [
      { name: "Transcript_Alice_Sorbonne.pdf", url: "#", uploadedAt: "2026-06-26T13:50:00Z" },
      { name: "French_Assessment_Alice.pdf", url: "#", uploadedAt: "2026-06-26T13:55:00Z" }
    ],
    history: [
      { status: ApplicationStatus.SUBMITTED, updatedAt: "2026-06-26T14:00:00Z", updatedBy: "Alice Johnson" },
      { status: ApplicationStatus.UNDER_REVIEW, updatedAt: "2026-06-28T11:00:00Z", updatedBy: "Coordinator Team" }
    ]
  },
  {
    id: "app-007",
    studentId: "std-korea-01",
    programId: "prog-sv-intern",
    status: ApplicationStatus.SUBMITTED,
    gpaAtTimeOfApplication: 3.82,
    statementOfPurpose: "I aim to combine my software engineering background with Silicon Valley's innovation ecosystem to build impactful products.",
    submittedAt: "2026-06-27T16:45:00Z",
    documents: [
      { name: "Resume_Tom_SV.pdf", url: "#", uploadedAt: "2026-06-27T16:35:00Z" },
      { name: "Portfolio_TomHolland.pdf", url: "#", uploadedAt: "2026-06-27T16:40:00Z" }
    ],
    history: [
      { status: ApplicationStatus.SUBMITTED, updatedAt: "2026-06-27T16:45:00Z", updatedBy: "Tom Holland" }
    ]
  },
  {
    id: "app-008",
    studentId: "std-korea-02",
    programId: "prog-sn-exchange",
    status: ApplicationStatus.UNDER_REVIEW,
    gpaAtTimeOfApplication: 3.65,
    statementOfPurpose: "Aiming to broaden my business perspective through immersion in European markets and French business culture.",
    submittedAt: "2026-06-24T12:30:00Z",
    documents: [
      { name: "Transcript_Emma_Sorbonne.pdf", url: "#", uploadedAt: "2026-06-24T12:20:00Z" },
      { name: "SOP_Emma_Sorbonne.pdf", url: "#", uploadedAt: "2026-06-24T12:25:00Z" }
    ],
    history: [
      { status: ApplicationStatus.SUBMITTED, updatedAt: "2026-06-24T12:30:00Z", updatedBy: "Emma Watson" },
      { status: ApplicationStatus.UNDER_REVIEW, updatedAt: "2026-06-26T09:00:00Z", updatedBy: "Coordinator Team" }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-001",
    action: "USER_SSO_LOGIN",
    timestamp: "2026-06-28T09:00:12Z",
    actor: "tom@korea.ac.kr",
    actorRole: UserRole.STUDENT,
    target: "Korea University IdP",
    details: "Student logged in successfully using SAML 2.0 WebSSO profile. Assertion validated.",
    protocolUsed: AuthProtocol.SAML
  },
  {
    id: "log-002",
    action: "USER_SSO_LOGIN",
    timestamp: "2026-06-28T10:15:33Z",
    actor: "admin_coord@korea.ac.kr",
    actorRole: UserRole.COORDINATOR,
    target: "Korea University IdP",
    details: "Coordinator authenticated successfully using OIDC Authorization Code Flow. JWT validated.",
    protocolUsed: AuthProtocol.OIDC
  },
  {
    id: "log-003",
    action: "APPLICATION_STATUS_UPDATE",
    timestamp: "2026-06-27T09:00:00Z",
    actor: "admin_coord@korea.ac.kr",
    actorRole: UserRole.COORDINATOR,
    target: "app-002",
    details: "Application for program 'prog-sv-intern' status updated to APPROVED. Emailed notification sent."
  },
  {
    id: "log-004",
    action: "PROGRAM_CREATION",
    timestamp: "2026-06-20T14:00:00Z",
    actor: "system_admin@korea.ac.kr",
    actorRole: UserRole.ADMIN,
    target: "prog-oxford-summer",
    details: "New international research program created and set to active status."
  }
];

export const INITIAL_SURVEYS: SurveyResponse[] = [
  {
    id: "survey-001",
    studentId: "std-korea-01",
    studentName: "Tom Holland",
    programId: "past-1",
    programTitle: "UC Berkeley Summer Session",
    overallRating: 4,
    teachingQuality: 5,
    facilities: 4,
    culturalExperience: 4,
    comment: "Great experience overall. The AI course was very well structured.",
    submittedAt: "2025-09-15T10:30:00Z"
  },
  {
    id: "survey-002",
    studentId: "std-korea-02",
    studentName: "Emma Watson",
    programId: "past-2",
    programTitle: "UNESCO Youth Leadership Forum",
    overallRating: 5,
    teachingQuality: 4,
    facilities: 5,
    culturalExperience: 5,
    comment: "Life-changing experience. The networking opportunities were incredible.",
    submittedAt: "2024-08-20T14:00:00Z"
  }
];

export const POSTGRESQL_SCHEMA_SQL = `-- ==========================================
-- Student Program Application & Management System
-- PostgreSQL Relational Database Schema
-- Designed for Korea University Coordination Portal
-- ==========================================

-- Enable standard UUID extension for strong key protection
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES & CONFIG ENUMS
CREATE TYPE user_role AS ENUM ('student', 'coordinator', 'admin');
CREATE TYPE application_status AS ENUM ('Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected');
CREATE TYPE sso_protocol AS ENUM ('SAML 2.0', 'OIDC', 'CAS');

-- 2. STUDENTS TABLE
-- Stores profile details synchronized with the University Directory via SSO
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    gpa NUMERIC(3, 2) NOT NULL CHECK (gpa >= 0.00 AND gpa <= 4.50),
    completed_credits INT NOT NULL DEFAULT 0 CHECK (completed_credits >= 0),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for fast search on academic directory integrations
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_id_num ON students(student_id_number);

-- 2.5 PARTICIPATION HISTORY TABLE
-- Tracks previous exchange programs each student has completed
CREATE TABLE participation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    program_title VARCHAR(200) NOT NULL,
    location VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Completed', 'Ongoing')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_participation_student_id ON participation_history(student_id);

-- 3. PROGRAMS TABLE
-- Stores academic and global opportunity parameters
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    department VARCHAR(150) NOT NULL,
    location VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    deadline DATE NOT NULL,
    prerequisite_gpa NUMERIC(3, 2) NOT NULL CHECK (prerequisite_gpa >= 0.00 AND prerequisite_gpa <= 4.50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    required_documents TEXT[] NOT NULL, -- PostgreSQL Array of document titles
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_programs_is_active ON programs(is_active);

-- 4. APPLICATIONS TABLE
-- Stores applications with foreign keys linking back to students and programs
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE RESTRICT,
    status application_status NOT NULL DEFAULT 'Draft',
    gpa_at_time_of_application NUMERIC(3, 2) NOT NULL,
    statement_of_purpose TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by VARCHAR(100),
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_program_application UNIQUE (student_id, program_id)
);

CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_program_id ON applications(program_id);
CREATE INDEX idx_applications_status ON applications(status);

-- 5. APPLICATION DOCUMENTS TABLE
-- Supports multi-file uploads per application
CREATE TABLE application_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_app_docs_app_id ON application_documents(application_id);

-- 6. APPLICATION STATUS HISTORY TABLE
-- Tracks immutable state logs for applications, auditing updates
CREATE TABLE application_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    previous_status application_status,
    new_status application_status NOT NULL,
    updated_by VARCHAR(150) NOT NULL, -- Email or admin username
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_app_history_app_id ON application_history(application_id);

-- 7. AUDIT LOGS TABLE
-- Tracks high-sensitivity events such as Single Sign-On and manual parameter adjustments
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    actor VARCHAR(150) NOT NULL, -- Email address or system agent
    actor_role user_role NOT NULL,
    target_id VARCHAR(100), -- ID of program, student, or application modified
    protocol_used sso_protocol, -- Nullable if not auth-related
    details TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- ==========================================
-- Triggers to auto-update update timestamps
-- ==========================================
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_modtime BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER update_programs_modtime BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER update_applications_modtime BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
`;
