import type {
    Course,
    CreateCourseDTO,
    CreateEnrollmentDTO,
    CreateFeeDTO,
    CreateMemberDTO,
    CreateTrainingDTO,
    DashboardStats,
    Enrollment,
    Fee,
    Member,
    Training,
} from '../../../types/platform.ts';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

interface ApiResponse<T> {
    message: string;
    data: T;
    error?: string;
}

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    const payload = await response.json().catch(() => ({})) as Partial<ApiResponse<T>>;

    if (!response.ok) {
        throw new Error(payload.error ?? payload.message ?? 'Request failed');
    }

    return payload.data as T;
};

const resourceApi = <T, C>(path: string) => ({
    list: () => request<T[]>(path),
    create: (data: C) => request<T>(path, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id: number, data: Partial<C>) => request<T>(`${path}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: async (id: number) => {
        await request<void>(`${path}/${id}`, { method: 'DELETE' });
    },
});

export const platformApi = {
    dashboard: () => request<DashboardStats>('/dashboard'),
    members: resourceApi<Member, CreateMemberDTO>('/members'),
    courses: resourceApi<Course, CreateCourseDTO>('/courses'),
    trainings: resourceApi<Training, CreateTrainingDTO>('/trainings'),
    fees: resourceApi<Fee, CreateFeeDTO>('/fees'),
    enrollments: resourceApi<Enrollment, CreateEnrollmentDTO>('/enrollments'),
};
