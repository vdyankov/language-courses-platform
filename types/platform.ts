export type MemberLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type EnrollmentStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface Member {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    level: MemberLevel;
    joined_at: string;
}

export interface CreateMemberDTO {
    full_name: string;
    email: string;
    phone: string;
    level: MemberLevel;
}

export interface Course {
    id: number;
    title: string;
    language: string;
    level: MemberLevel;
    duration_weeks: number;
    price: number;
    description: string;
}

export interface CreateCourseDTO {
    title: string;
    language: string;
    level: MemberLevel;
    duration_weeks: number;
    price: number;
    description: string;
}

export interface Training {
    id: number;
    course_id: number;
    course_title?: string;
    language?: string;
    trainer_name: string;
    room: string;
    starts_at: string;
    ends_at: string;
    capacity: number;
}

export interface CreateTrainingDTO {
    course_id: number;
    trainer_name: string;
    room: string;
    starts_at: string;
    ends_at: string;
    capacity: number;
}

export interface Fee {
    id: number;
    course_id: number;
    course_title?: string;
    member_id: number | null;
    member_name?: string | null;
    title: string;
    amount: number;
    due_date: string;
    paid: boolean;
}

export interface CreateFeeDTO {
    course_id: number;
    member_id?: number | null;
    title: string;
    amount: number;
    due_date: string;
    paid: boolean;
}

export interface Enrollment {
    id: number;
    member_id: number;
    member_name?: string;
    course_id: number;
    course_title?: string;
    status: EnrollmentStatus;
    enrolled_at: string;
}

export interface CreateEnrollmentDTO {
    member_id: number;
    course_id: number;
    status: EnrollmentStatus;
    enrolled_at: string;
}

export interface DashboardStats {
    members: number;
    courses: number;
    trainings: number;
    enrollments: number;
    unpaidFees: number;
    upcomingTrainings: Training[];
}
