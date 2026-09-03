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

export type StudentsResponse = {
  students: StudentListItem[];
};

export type ScoutsResponse = {
  scouts: ReceivedScout[];
};

export type CreateScoutPayload = {
  student_profile_id: number;
  subject: string;
  body: string;
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
