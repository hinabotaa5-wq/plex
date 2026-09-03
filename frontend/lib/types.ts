export type UserRole = "student" | "company";

export type StudentProfile = {
  name: string;
  university: string;
  grade: string;
  self_pr: string | null;
  github_url: string | null;
  portfolio_url: string | null;
};

export type CompanyProfile = {
  name: string;
  department: string | null;
  description: string | null;
  website_url: string | null;
};

export type User = {
  id: number;
  email: string;
  role: UserRole;
  profile: StudentProfile | CompanyProfile | null;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type MeResponse = {
  user: User;
};

export type StudentListItem = {
  id: number;
  name: string;
  university: string;
  grade: string;
  self_pr: string | null;
  github_url: string | null;
  portfolio_url: string | null;
};

export type ScoutStatus = "sent" | "accepted" | "declined";

export type ReceivedScout = {
  id: number;
  status: ScoutStatus;
  subject: string;
  body: string;
  created_at: string;
  company: {
    id: number;
    name: string;
    description: string | null;
    website_url: string | null;
  };
};

export type SentScout = {
  id: number;
  status: ScoutStatus;
  subject: string;
  body: string;
  created_at: string;
  student: {
    id: number;
    name: string;
    university: string;
    grade: string;
  };
};

export type StudentsResponse = {
  students: StudentListItem[];
};

export type StudentSearchParams = {
  q?: string;
  grade?: string;
  has_github?: boolean;
};

export type ScoutsResponse = {
  scouts: ReceivedScout[];
};

export type SentScoutsResponse = {
  scouts: SentScout[];
};

export type ChatMessage = {
  id: number;
  body: string;
  created_at: string;
  user_id: number;
  sender_role: UserRole;
};

export type CreateScoutPayload = {
  student_profile_id: number;
  subject: string;
  body: string;
};

export type UpdateStudentProfilePayload = {
  name: string;
  university: string;
  grade: string;
  self_pr?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
};

export type UpdateCompanyProfilePayload = {
  name: string;
  department?: string | null;
  description?: string | null;
  website_url?: string | null;
};

export type UpdateProfilePayload =
  | UpdateStudentProfilePayload
  | UpdateCompanyProfilePayload;

export type ProfileResponse = {
  profile: StudentProfile | CompanyProfile;
};

export type SignupPayload =
  | {
      email: string;
      password: string;
      role: "student";
      student_profile_attributes: {
        name: string;
        university: string;
        grade: string;
        self_pr?: string | null;
        github_url?: string | null;
        portfolio_url?: string | null;
      };
    }
  | {
      email: string;
      password: string;
      role: "company";
      company_profile_attributes: {
        name: string;
        description?: string | null;
        website_url?: string | null;
      };
    };

export function isStudentProfile(
  user: User
): user is User & { profile: StudentProfile } {
  return user.role === "student" && user.profile !== null;
}

export function isCompanyProfile(
  user: User
): user is User & { profile: CompanyProfile } {
  return user.role === "company" && user.profile !== null;
}
