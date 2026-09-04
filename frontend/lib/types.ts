export type UserRole = "student" | "company";

export type StudentProfile = {
  name: string;
  university: string;
  grade: string;
  self_pr: string | null;
  github_url: string | null;
  faculty: string | null;
  desired_job_type: string | null;
  desired_location: string[] | string | null;
  gakuchika: string | null;
  skills: string | null;
  qualifications: string | null;
  intern_experience: string | null;
  available_days_per_week: string | null;
  available_weekdays: string[] | string | null;
  available_time_from: string | null;
  available_time_to: string | null;
};

export type CompanyProfile = {
  name: string;
  department: string | null;
  description: string | null;
  website_url: string | null;
  industry: string | null;
  number_of_employees: string | null;
  salary: string | null;
  location: string | null;
  recruiting_job_type: string | null;
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
  faculty: string | null;
  desired_job_type: string | null;
  desired_location: string[] | string | null;
  self_pr: string | null;
  gakuchika: string | null;
  skills: string | null;
  qualifications: string | null;
  intern_experience: string | null;
  github_url: string | null;
  available_days_per_week: string | null;
  available_weekdays: string[] | string | null;
  available_time_from: string | null;
  available_time_to: string | null;
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
    department?: string | null;
    description?: string | null;
    website_url?: string | null;
    industry?: string | null;
    number_of_employees?: string | null;
    salary?: string | null;
    location?: string | null;
    recruiting_job_type?: string | null;
  };
};

export type SentScout = {
  id: number;
  status: ScoutStatus;
  subject: string;
  body: string;
  created_at: string;
  student: StudentListItem;
};

export type StudentsResponse = {
  students: StudentListItem[];
};

export type StudentSearchParams = {
  q?: string;
  grade?: string;
  has_github?: boolean;
  has_skills?: boolean;
  has_qualifications?: boolean;
  has_intern_experience?: boolean;
  desired_locations?: string[];
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

export type NotificationActionType = "scout_received" | "message_received";

export type Notification = {
  id: number;
  action_type: NotificationActionType;
  title: string;
  body: string | null;
  is_read: boolean;
  notifiable_type: string;
  notifiable_id: number;
  scout_id: number | null;
  created_at: string;
};

export type NotificationsResponse = {
  notifications: Notification[];
  unread_count: number;
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
  faculty?: string | null;
  desired_job_type?: string | null;
  desired_location?: string[] | string | null;
  gakuchika?: string | null;
  skills?: string | null;
  qualifications?: string | null;
  intern_experience?: string | null;
  available_days_per_week?: string | null;
  available_weekdays?: string[] | string | null;
  available_time_from?: string | null;
  available_time_to?: string | null;
};

export type UpdateCompanyProfilePayload = {
  name: string;
  department?: string | null;
  description?: string | null;
  website_url?: string | null;
  industry?: string | null;
  number_of_employees?: string | null;
  salary?: string | null;
  location?: string | null;
  recruiting_job_type?: string | null;
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
        faculty: string;
        desired_job_type: string;
        desired_location: string[];
        available_days_per_week: string;
        available_weekdays: string[];
        available_time_from: string;
        available_time_to: string;
        self_pr: string;
        gakuchika: string;
        skills?: string | null;
        qualifications?: string | null;
        intern_experience?: string | null;
        github_url?: string | null;
      };
    }
  | {
      email: string;
      password: string;
      role: "company";
      company_profile_attributes: {
        name: string;
        department: string;
        industry: string;
        number_of_employees: string;
        salary: string;
        location: string;
        recruiting_job_type: string;
        description: string;
        website_url: string;
      };
    };

export function parseStringList(
  value: string[] | string | null | undefined
): string[] {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string" && item.trim() !== "");
  }
  if (value == null) return [];

  const trimmed = value.trim();
  if (trimmed === "") return [];

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is string => typeof item === "string" && item.trim() !== ""
      );
    }
  } catch {
    // 旧データの単一テキストはそのまま配列化する
  }

  return [trimmed];
}

export function parseDesiredLocations(
  value: string[] | string | null | undefined
): string[] {
  return parseStringList(value);
}

export function formatAvailableTime(
  from: string | null | undefined,
  to: string | null | undefined
): string | null {
  const start = normalizeTime(from);
  const end = normalizeTime(to);
  if (!start && !end) return null;
  if (start && end) return `${start}〜${end}`;
  return start || end;
}

function normalizeTime(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";
  return trimmed.length >= 5 ? trimmed.slice(0, 5) : trimmed;
}

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
