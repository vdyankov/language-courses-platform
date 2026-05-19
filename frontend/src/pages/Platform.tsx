import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { platformApi } from '../api/platformApi.ts';
import { BrandLogo } from '../components/BrandLogo.tsx';
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

type ResourceKey = 'members' | 'courses' | 'trainings' | 'fees' | 'enrollments';
type FormMode = 'create' | 'edit' | null;
type FieldType = 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'date' | 'datetime-local' | 'checkbox';
type FormValue = string | number | boolean;
type FormPayload = Record<string, unknown>;
type ResourceItem = Member | Course | Training | Fee | Enrollment;
type ToastType = 'success' | 'error';

interface ToastState {
    message: string;
    type: ToastType;
}

interface DeleteRequest {
    item: ResourceItem;
    resource: ResourceKey;
}

interface FieldOption {
    label: string;
    value: string | number;
}

interface FieldConfig {
    name: string;
    label: string;
    type: FieldType;
    options?: FieldOption[];
    valueType?: 'string' | 'number' | 'boolean';
    required?: boolean;
    rows?: number;
}

interface ColumnConfig {
    label: string;
    value: (item: ResourceItem) => ReactNode;
}

interface ResourceConfig {
    title: string;
    singular: string;
    items: ResourceItem[];
    fields: FieldConfig[];
    columns: ColumnConfig[];
    emptyForm: Record<string, FormValue>;
    create: (data: FormPayload) => Promise<ResourceItem>;
    update: (id: number, data: FormPayload) => Promise<ResourceItem>;
    remove: (id: number) => Promise<void>;
}

const levelOptions: FieldOption[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => ({
    label: level,
    value: level,
}));

const languageOptions: FieldOption[] = ['Английски', 'Испански', 'Немски', 'Френски', 'Италиански'].map((language) => ({
    label: language,
    value: language,
}));

const enrollmentStatusLabels: Record<string, string> = {
    pending: 'чака',
    active: 'активно',
    completed: 'завършено',
    cancelled: 'отказано',
};

const enrollmentStatusOptions: FieldOption[] = Object.entries(enrollmentStatusLabels).map(([value, label]) => ({
    label,
    value,
}));

const formatDate = (value: unknown): string => {
    if (!value) {
        return '-';
    }
    return new Intl.DateTimeFormat('bg-BG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(String(value)));
};

const formatDateTime = (value: unknown): string => {
    if (!value) {
        return '-';
    }
    return new Intl.DateTimeFormat('bg-BG', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(String(value)));
};

const formatTime = (value: unknown): string => {
    if (!value) {
        return '-';
    }
    return new Intl.DateTimeFormat('bg-BG', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(String(value)));
};

const formatTimeRange = (training: Training): string => {
    return `${formatTime(training.starts_at)} - ${formatTime(training.ends_at)}`;
};

const startOfWeek = (value: Date): Date => {
    const date = new Date(value);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + diff);
    return date;
};

const addDays = (value: Date, days: number): Date => {
    const date = new Date(value);
    date.setDate(date.getDate() + days);
    return date;
};

const dateKey = (value: Date): string => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatCalendarDay = (value: Date): string => {
    return new Intl.DateTimeFormat('bg-BG', {
        day: '2-digit',
        month: 'short',
    }).format(value);
};

const formatWeekRange = (weekStart: Date): string => {
    const weekEnd = addDays(weekStart, 6);
    return `${formatDate(weekStart.toISOString())} - ${formatDate(weekEnd.toISOString())}`;
};

const money = (value: unknown): string => `${Number(value).toFixed(2)} лв.`;

const today = (): string => new Date().toISOString().slice(0, 10);

const toInputDate = (value: unknown, type: FieldType): FormValue => {
    if (type === 'checkbox') {
        return value === true || value === 1;
    }
    if (!value) {
        return '';
    }
    const text = String(value).replace(' ', 'T');
    if (type === 'datetime-local') {
        return text.slice(0, 16);
    }
    if (type === 'date') {
        return text.slice(0, 10);
    }
    return text;
};

const getErrorMessage = (error: unknown): string => {
    const message = error instanceof Error ? error.message : 'Възникна грешка при заявката.';
    if (message.includes("Cannot find module '../encodings'")) {
        return 'Backend зависимостите не са инсталирани коректно. Спрете стария сървър, изпълнете npm install в основната папка и стартирайте npm run dev отново.';
    }
    return message;
};

const dayLabels = ['Пон', 'Вто', 'Сря', 'Чет', 'Пет', 'Съб', 'Нед'];
const skeletonRows = [1, 2, 3, 4];

export const Platform = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [fees, setFees] = useState<Fee[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
    const [activeResource, setActiveResource] = useState<ResourceKey>('members');
    const [formMode, setFormMode] = useState<FormMode>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Record<string, FormValue>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState<ToastState | null>(null);
    const [deleteRequest, setDeleteRequest] = useState<DeleteRequest | null>(null);
    const [calendarWeekStart, setCalendarWeekStart] = useState<Date>(() => startOfWeek(new Date()));
    const [selectedTrainingId, setSelectedTrainingId] = useState<number | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [
                dashboardData,
                memberData,
                courseData,
                trainingData,
                feeData,
                enrollmentData,
            ] = await Promise.all([
                platformApi.dashboard(),
                platformApi.members.list(),
                platformApi.courses.list(),
                platformApi.trainings.list(),
                platformApi.fees.list(),
                platformApi.enrollments.list(),
            ]);
            setDashboard(dashboardData);
            setMembers(memberData);
            setCourses(courseData);
            setTrainings(trainingData);
            setFees(feeData);
            setEnrollments(enrollmentData);
        } catch (requestError) {
            const message = getErrorMessage(requestError);
            setError(message);
            setToast({ message, type: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    useEffect(() => {
        if (!toast) {
            return;
        }
        const timeout = window.setTimeout(() => setToast(null), 4500);
        return () => window.clearTimeout(timeout);
    }, [toast]);

    const courseOptions = useMemo<FieldOption[]>(() => courses.map((course) => ({
        label: `${course.language} ${course.level} - ${course.title}`,
        value: course.id,
    })), [courses]);

    const memberOptions = useMemo<FieldOption[]>(() => members.map((member) => ({
        label: member.full_name,
        value: member.id,
    })), [members]);

    const memberCoursesById = useMemo(() => {
        return enrollments.reduce<Map<number, string[]>>((result, enrollment) => {
            const coursesForMember = result.get(enrollment.member_id) ?? [];
            if (enrollment.course_title && !coursesForMember.includes(enrollment.course_title)) {
                coursesForMember.push(enrollment.course_title);
            }
            result.set(enrollment.member_id, coursesForMember);
            return result;
        }, new Map<number, string[]>());
    }, [enrollments]);

    const resources = useMemo<Record<ResourceKey, ResourceConfig>>(() => ({
        members: {
            title: 'Членове',
            singular: 'член',
            items: members,
            emptyForm: {
                full_name: '',
                email: '',
                phone: '',
                level: 'A1',
                course_id: courseOptions[0]?.value ?? '',
            },
            fields: [
                { name: 'full_name', label: 'Име', type: 'text', required: true },
                { name: 'email', label: 'Имейл', type: 'email', required: true },
                { name: 'phone', label: 'Телефон', type: 'tel', required: true },
                { name: 'level', label: 'Ниво', type: 'select', options: levelOptions, required: true },
                { name: 'course_id', label: 'Курс за записване', type: 'select', options: courseOptions, valueType: 'number', required: true },
            ],
            columns: [
                { label: 'Име', value: (item) => (item as Member).full_name },
                { label: 'Контакт', value: (item) => `${(item as Member).email} / ${(item as Member).phone}` },
                {
                    label: 'Курс',
                    value: (item) => {
                        const courseTitles = memberCoursesById.get((item as Member).id) ?? [];
                        return courseTitles.length ? courseTitles.join(', ') : 'Без записване';
                    },
                },
                { label: 'Ниво', value: (item) => <span className="badge level-badge">{(item as Member).level}</span> },
                { label: 'От', value: (item) => formatDate((item as Member).joined_at) },
            ],
            create: async (data) => {
                const memberData = data as unknown as CreateMemberDTO & { course_id?: number };
                const member = await platformApi.members.create(memberData);
                if (memberData.course_id) {
                    await platformApi.enrollments.create({
                        member_id: member.id,
                        course_id: Number(memberData.course_id),
                        status: 'pending',
                        enrolled_at: today(),
                    });
                }
                return member;
            },
            update: async (id, data) => {
                const memberData = data as unknown as Partial<CreateMemberDTO> & { course_id?: number };
                const member = await platformApi.members.update(id, memberData);
                if (memberData.course_id) {
                    const existingEnrollment = enrollments.find((enrollment) => enrollment.member_id === id);
                    if (existingEnrollment) {
                        await platformApi.enrollments.update(existingEnrollment.id, {
                            member_id: id,
                            course_id: Number(memberData.course_id),
                            status: existingEnrollment.status,
                            enrolled_at: String(existingEnrollment.enrolled_at).slice(0, 10),
                        });
                    } else {
                        await platformApi.enrollments.create({
                            member_id: id,
                            course_id: Number(memberData.course_id),
                            status: 'pending',
                            enrolled_at: today(),
                        });
                    }
                }
                return member;
            },
            remove: platformApi.members.delete,
        },
        courses: {
            title: 'Курсове',
            singular: 'курс',
            items: courses,
            emptyForm: {
                title: '',
                language: 'Английски',
                level: 'A1',
                duration_weeks: 8,
                price: 300,
                description: '',
            },
            fields: [
                { name: 'title', label: 'Заглавие', type: 'text', required: true },
                { name: 'language', label: 'Език', type: 'select', options: languageOptions, required: true },
                { name: 'level', label: 'Ниво', type: 'select', options: levelOptions, required: true },
                { name: 'duration_weeks', label: 'Седмици', type: 'number', valueType: 'number', required: true },
                { name: 'price', label: 'Цена', type: 'number', valueType: 'number', required: true },
                { name: 'description', label: 'Описание', type: 'textarea', rows: 3, required: true },
            ],
            columns: [
                { label: 'Курс', value: (item) => (item as Course).title },
                {
                    label: 'Език',
                    value: (item) => (
                        <span className="stacked-cell">
                            <span>{(item as Course).language}</span>
                            <span className="badge level-badge">{(item as Course).level}</span>
                        </span>
                    ),
                },
                { label: 'Период', value: (item) => `${(item as Course).duration_weeks} седм.` },
                { label: 'Цена', value: (item) => money((item as Course).price) },
            ],
            create: (data) => platformApi.courses.create(data as unknown as CreateCourseDTO),
            update: (id, data) => platformApi.courses.update(id, data as Partial<CreateCourseDTO>),
            remove: platformApi.courses.delete,
        },
        trainings: {
            title: 'Занятия',
            singular: 'занятие',
            items: trainings,
            emptyForm: {
                course_id: courseOptions[0]?.value ?? '',
                trainer_name: '',
                room: '',
                starts_at: '',
                ends_at: '',
                capacity: 12,
            },
            fields: [
                { name: 'course_id', label: 'Курс', type: 'select', options: courseOptions, valueType: 'number', required: true },
                { name: 'trainer_name', label: 'Преподавател', type: 'text', required: true },
                { name: 'room', label: 'Зала', type: 'text', required: true },
                { name: 'starts_at', label: 'Начало', type: 'datetime-local', required: true },
                { name: 'ends_at', label: 'Край', type: 'datetime-local', required: true },
                { name: 'capacity', label: 'Места', type: 'number', valueType: 'number', required: true },
            ],
            columns: [
                { label: 'Курс', value: (item) => (item as Training).course_title },
                { label: 'Преподавател', value: (item) => (item as Training).trainer_name },
                { label: 'Кога', value: (item) => formatDateTime((item as Training).starts_at) },
                { label: 'Места', value: (item) => <span className="badge neutral-badge">{(item as Training).capacity}</span> },
            ],
            create: (data) => platformApi.trainings.create(data as unknown as CreateTrainingDTO),
            update: (id, data) => platformApi.trainings.update(id, data as Partial<CreateTrainingDTO>),
            remove: platformApi.trainings.delete,
        },
        fees: {
            title: 'Такси',
            singular: 'такса',
            items: fees,
            emptyForm: {
                course_id: courseOptions[0]?.value ?? '',
                member_id: memberOptions[0]?.value ?? '',
                title: '',
                amount: 0,
                due_date: today(),
                paid: false,
            },
            fields: [
                { name: 'course_id', label: 'Курс', type: 'select', options: courseOptions, valueType: 'number', required: true },
                { name: 'member_id', label: 'Платил курсист', type: 'select', options: memberOptions, valueType: 'number', required: true },
                { name: 'title', label: 'Такса', type: 'text', required: true },
                { name: 'amount', label: 'Сума', type: 'number', valueType: 'number', required: true },
                { name: 'due_date', label: 'Падеж', type: 'date', required: true },
                { name: 'paid', label: 'Платена', type: 'checkbox', valueType: 'boolean' },
            ],
            columns: [
                { label: 'Такса', value: (item) => (item as Fee).title },
                { label: 'Курс', value: (item) => (item as Fee).course_title },
                { label: 'Платил курсист', value: (item) => (item as Fee).member_name ?? 'Не е избран' },
                { label: 'Сума', value: (item) => money((item as Fee).amount) },
                {
                    label: 'Статус',
                    value: (item) => (
                        <span className={(item as Fee).paid ? 'badge success-badge' : 'badge warning-badge'}>
                            {(item as Fee).paid ? 'платена' : 'неплатена'}
                        </span>
                    ),
                },
            ],
            create: (data) => platformApi.fees.create(data as unknown as CreateFeeDTO),
            update: (id, data) => platformApi.fees.update(id, data as Partial<CreateFeeDTO>),
            remove: platformApi.fees.delete,
        },
        enrollments: {
            title: 'Записвания',
            singular: 'записване',
            items: enrollments,
            emptyForm: {
                member_id: memberOptions[0]?.value ?? '',
                course_id: courseOptions[0]?.value ?? '',
                status: 'pending',
                enrolled_at: today(),
            },
            fields: [
                { name: 'member_id', label: 'Член', type: 'select', options: memberOptions, valueType: 'number', required: true },
                { name: 'course_id', label: 'Курс', type: 'select', options: courseOptions, valueType: 'number', required: true },
                { name: 'status', label: 'Статус', type: 'select', options: enrollmentStatusOptions, required: true },
                { name: 'enrolled_at', label: 'Дата', type: 'date', required: true },
            ],
            columns: [
                { label: 'Член', value: (item) => (item as Enrollment).member_name },
                { label: 'Курс', value: (item) => (item as Enrollment).course_title },
                {
                    label: 'Статус',
                    value: (item) => (
                        <span className={`badge status-${(item as Enrollment).status}`}>
                            {enrollmentStatusLabels[(item as Enrollment).status]}
                        </span>
                    ),
                },
                { label: 'Дата', value: (item) => formatDate((item as Enrollment).enrolled_at) },
            ],
            create: (data) => platformApi.enrollments.create(data as unknown as CreateEnrollmentDTO),
            update: (id, data) => platformApi.enrollments.update(id, data as Partial<CreateEnrollmentDTO>),
            remove: platformApi.enrollments.delete,
        },
    }), [courseOptions, courses, enrollments, fees, members, memberCoursesById, memberOptions, trainings]);

    const activeConfig = resources[activeResource];
    const calendarDays = useMemo(() => {
        return Array.from({ length: 7 }, (_item, index) => addDays(calendarWeekStart, index));
    }, [calendarWeekStart]);

    const trainingsByDay = useMemo(() => {
        return trainings.reduce<Map<string, Training[]>>((result, training) => {
            const startsAt = new Date(String(training.starts_at));
            if (Number.isNaN(startsAt.getTime())) {
                return result;
            }
            const key = dateKey(startsAt);
            const items = result.get(key) ?? [];
            items.push(training);
            items.sort((first, second) => {
                return new Date(String(first.starts_at)).getTime() - new Date(String(second.starts_at)).getTime();
            });
            result.set(key, items);
            return result;
        }, new Map<string, Training[]>());
    }, [trainings]);

    const weekTrainings = useMemo(() => {
        return calendarDays.flatMap((day) => trainingsByDay.get(dateKey(day)) ?? []);
    }, [calendarDays, trainingsByDay]);

    const selectedTraining = useMemo(() => {
        return weekTrainings.find((training) => training.id === selectedTrainingId) ?? weekTrainings[0] ?? null;
    }, [selectedTrainingId, weekTrainings]);

    const startCreate = () => {
        setFormMode('create');
        setEditingId(null);
        setFormData(activeConfig.emptyForm);
        setError('');
    };

    const startEdit = (item: ResourceItem, resource: ResourceKey = activeResource) => {
        const config = resources[resource];
        const editableData = config.fields.reduce<Record<string, FormValue>>((values, field) => {
            if (resource === 'members' && field.name === 'course_id') {
                const enrollment = enrollments.find((currentEnrollment) => currentEnrollment.member_id === item.id);
                values[field.name] = enrollment?.course_id ?? '';
                return values;
            }
            values[field.name] = toInputDate((item as unknown as Record<string, unknown>)[field.name], field.type);
            return values;
        }, {});
        setActiveResource(resource);
        setFormMode('edit');
        setEditingId(item.id);
        setFormData(editableData);
        setError('');
    };

    const cancelForm = () => {
        setFormMode(null);
        setEditingId(null);
        setFormData({});
    };

    const changeResource = (resource: ResourceKey) => {
        setActiveResource(resource);
        setFormMode(null);
        setEditingId(null);
        setFormData({});
        setError('');
    };

    const updateField = (field: FieldConfig, value: FormValue) => {
        setFormData((current) => ({ ...current, [field.name]: value }));
    };

    const preparePayload = (): FormPayload => {
        return activeConfig.fields.reduce<FormPayload>((payload, field) => {
            const value = formData[field.name];
            if (field.valueType === 'number') {
                payload[field.name] = Number(value);
            } else if (field.valueType === 'boolean' || field.type === 'checkbox') {
                payload[field.name] = Boolean(value);
            } else {
                payload[field.name] = value;
            }
            return payload;
        }, {});
    };

    const submitForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        try {
            if (formMode === 'edit' && editingId) {
                await activeConfig.update(editingId, preparePayload());
                setToast({ message: `Записът за ${activeConfig.singular} е обновен.`, type: 'success' });
            } else {
                await activeConfig.create(preparePayload());
                setToast({ message: `Нов ${activeConfig.singular} е добавен.`, type: 'success' });
            }
            cancelForm();
            await loadData();
        } catch (submitError) {
            const message = getErrorMessage(submitError);
            setError(message);
            setToast({ message, type: 'error' });
        }
    };

    const requestDelete = (item: ResourceItem) => {
        setDeleteRequest({ item, resource: activeResource });
    };

    const getItemLabel = (resource: ResourceKey, item: ResourceItem): string => {
        if (resource === 'members') {
            return (item as Member).full_name;
        }
        if (resource === 'courses') {
            return (item as Course).title;
        }
        if (resource === 'trainings') {
            const training = item as Training;
            return `${training.course_title ?? 'Занятие'} - ${formatDateTime(training.starts_at)}`;
        }
        if (resource === 'fees') {
            return (item as Fee).title;
        }
        const enrollment = item as Enrollment;
        return `${enrollment.member_name ?? 'Член'} / ${enrollment.course_title ?? 'Курс'}`;
    };

    const confirmDelete = async () => {
        if (!deleteRequest) {
            return;
        }
        setError('');
        try {
            const config = resources[deleteRequest.resource];
            await config.remove(deleteRequest.item.id);
            setToast({ message: `Записът за ${config.singular} е изтрит.`, type: 'success' });
            setDeleteRequest(null);
            await loadData();
        } catch (removeError) {
            const message = getErrorMessage(removeError);
            setError(message);
            setToast({ message, type: 'error' });
        }
    };

    const goToPreviousWeek = () => setCalendarWeekStart((current) => addDays(current, -7));
    const goToNextWeek = () => setCalendarWeekStart((current) => addDays(current, 7));
    const goToCurrentWeek = () => setCalendarWeekStart(startOfWeek(new Date()));

    const summaryItems = [
        { label: 'Членове', value: dashboard?.members ?? 0 },
        { label: 'Курсове', value: dashboard?.courses ?? 0 },
        { label: 'Занятия', value: dashboard?.trainings ?? 0 },
        { label: 'Записвания', value: dashboard?.enrollments ?? 0 },
        { label: 'Неплатени такси', value: dashboard?.unpaidFees ?? 0 },
    ];

    return (
        <div className="app-shell">
            {toast ? (
                <div className={`toast ${toast.type}`} role="status">
                    <span>{toast.message}</span>
                    <button aria-label="Затвори" onClick={() => setToast(null)} type="button">x</button>
                </div>
            ) : null}

            <section className="dashboard-band">
                <div>
                    <p className="eyebrow">Платформа за езикови курсове</p>
                    <h1><BrandLogo className="title-brand" /></h1>
                    <p className="lead">Членове, курсове, занятия, график, такси и записване в един работен екран.</p>
                </div>
                <div className="summary-grid" aria-label="Обобщение">
                    {summaryItems.map((item) => (
                        <div className="summary-card" key={item.label}>
                            <span>{item.label}</span>
                            <strong>{item.value}</strong>
                        </div>
                    ))}
                </div>
            </section>

            {dashboard?.upcomingTrainings.length ? (
                <section className="upcoming-band">
                    <h2>Следващи занятия</h2>
                    <div className="upcoming-list">
                        {dashboard.upcomingTrainings.map((training) => (
                            <article className="training-strip" key={training.id}>
                                <strong>{training.course_title}</strong>
                                <span>{training.trainer_name}</span>
                                <time>{formatDateTime(training.starts_at)}</time>
                            </article>
                        ))}
                    </div>
                </section>
            ) : null}

            <section className="calendar-band">
                <div className="section-heading calendar-heading">
                    <div>
                        <p className="eyebrow">График</p>
                        <h2>Седмичен календар</h2>
                    </div>
                    <div className="calendar-controls">
                        <button onClick={goToPreviousWeek} type="button">Назад</button>
                        <button onClick={goToCurrentWeek} type="button">Тази седмица</button>
                        <button onClick={goToNextWeek} type="button">Напред</button>
                    </div>
                </div>
                <p className="week-label">{formatWeekRange(calendarWeekStart)}</p>

                <div className="calendar-layout">
                    <div className="calendar-grid" role="grid">
                        {calendarDays.map((day, index) => {
                            const dayTrainings = trainingsByDay.get(dateKey(day)) ?? [];
                            return (
                                <div className="calendar-day" key={dateKey(day)} role="gridcell">
                                    <div className="calendar-day-head">
                                        <span>{dayLabels[index]}</span>
                                        <strong>{formatCalendarDay(day)}</strong>
                                    </div>
                                    <div className="calendar-items">
                                        {dayTrainings.length ? dayTrainings.map((training) => (
                                            <button
                                                className={selectedTraining?.id === training.id ? 'calendar-event active' : 'calendar-event'}
                                                key={training.id}
                                                onClick={() => setSelectedTrainingId(training.id)}
                                                type="button"
                                            >
                                                <span>{formatTimeRange(training)}</span>
                                                <strong>{training.course_title}</strong>
                                                <small>{training.trainer_name}</small>
                                            </button>
                                        )) : (
                                            <p className="calendar-empty">Свободен ден</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <aside className="calendar-detail">
                        {selectedTraining ? (
                            <>
                                <span className="badge level-badge">{selectedTraining.language ?? 'Курс'}</span>
                                <h3>{selectedTraining.course_title}</h3>
                                <dl>
                                    <div>
                                        <dt>Преподавател</dt>
                                        <dd>{selectedTraining.trainer_name}</dd>
                                    </div>
                                    <div>
                                        <dt>Час</dt>
                                        <dd>{formatTimeRange(selectedTraining)}</dd>
                                    </div>
                                    <div>
                                        <dt>Зала</dt>
                                        <dd>{selectedTraining.room}</dd>
                                    </div>
                                    <div>
                                        <dt>Места</dt>
                                        <dd>{selectedTraining.capacity}</dd>
                                    </div>
                                </dl>
                                <button
                                    className="ghost-action"
                                    onClick={() => {
                                        startEdit(selectedTraining, 'trainings');
                                    }}
                                    type="button"
                                >
                                    Редакция
                                </button>
                            </>
                        ) : (
                            <p className="calendar-empty large">Няма занятия за избраната седмица.</p>
                        )}
                    </aside>
                </div>
            </section>

            <section className="workspace-band">
                <div className="tabs" role="tablist" aria-label="Раздели">
                    {Object.entries(resources).map(([key, resource]) => (
                        <button
                            className={activeResource === key ? 'active' : ''}
                            key={key}
                            onClick={() => changeResource(key as ResourceKey)}
                            type="button"
                        >
                            {resource.title}
                        </button>
                    ))}
                </div>

                <div className="section-heading">
                    <div>
                        <p className="eyebrow">CRUD</p>
                        <h2>{activeConfig.title}</h2>
                    </div>
                    <button className="primary-action" onClick={startCreate} type="button">
                        Нов {activeConfig.singular}
                    </button>
                </div>

                {error ? <p className="notice error">{error}</p> : null}

                {formMode ? (
                    <form className="editor-panel" onSubmit={submitForm}>
                        <div className="form-grid">
                            {activeConfig.fields.map((field) => (
                                <label className={field.type === 'checkbox' ? 'check-field' : ''} key={field.name}>
                                    <span>{field.label}</span>
                                    {field.type === 'select' ? (
                                        <select
                                            onChange={(event) => updateField(field, event.target.value)}
                                            required={field.required}
                                            value={String(formData[field.name] ?? '')}
                                        >
                                            <option value="" disabled>Изберете</option>
                                            {field.options?.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : field.type === 'textarea' ? (
                                        <textarea
                                            onChange={(event) => updateField(field, event.target.value)}
                                            required={field.required}
                                            rows={field.rows ?? 4}
                                            value={String(formData[field.name] ?? '')}
                                        />
                                    ) : field.type === 'checkbox' ? (
                                        <input
                                            checked={Boolean(formData[field.name])}
                                            onChange={(event) => updateField(field, event.target.checked)}
                                            type="checkbox"
                                        />
                                    ) : (
                                        <input
                                            onChange={(event) => updateField(field, event.target.value)}
                                            required={field.required}
                                            type={field.type}
                                            value={String(formData[field.name] ?? '')}
                                        />
                                    )}
                                </label>
                            ))}
                        </div>
                        <div className="form-actions">
                            <button className="primary-action" type="submit">
                                {formMode === 'edit' ? 'Запази' : 'Добави'}
                            </button>
                            <button className="ghost-action" onClick={cancelForm} type="button">
                                Отказ
                            </button>
                        </div>
                    </form>
                ) : null}

                <div className="data-panel">
                    {loading ? (
                        <div className="table-skeleton" aria-label="Зареждане">
                            {skeletonRows.map((row) => (
                                <div className="skeleton-row" key={row}>
                                    <span />
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            ))}
                        </div>
                    ) : activeConfig.items.length === 0 ? (
                        <p className="empty-state">Няма записи в този раздел.</p>
                    ) : (
                        <table>
                            <thead>
                            <tr>
                                {activeConfig.columns.map((column) => (
                                    <th key={column.label}>{column.label}</th>
                                ))}
                                <th>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {activeConfig.items.map((item) => (
                                <tr key={item.id}>
                                    {activeConfig.columns.map((column) => (
                                        <td key={column.label}>{column.value(item)}</td>
                                    ))}
                                    <td>
                                        <div className="row-actions">
                                            <button onClick={() => startEdit(item)} type="button">Редакция</button>
                                            <button onClick={() => requestDelete(item)} type="button">Изтрий</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            {deleteRequest ? (
                <div className="modal-backdrop" role="presentation">
                    <div aria-modal="true" className="confirm-modal" role="dialog">
                        <p className="eyebrow">Потвърждение</p>
                        <h2>Изтриване</h2>
                        <p>
                            Сигурни ли сте, че искате да изтриете "{getItemLabel(deleteRequest.resource, deleteRequest.item)}"?
                        </p>
                        <div className="form-actions">
                            <button className="danger-action" onClick={() => void confirmDelete()} type="button">
                                Изтрий
                            </button>
                            <button className="ghost-action" onClick={() => setDeleteRequest(null)} type="button">
                                Отказ
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
