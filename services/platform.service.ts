import {
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
} from '../types/platform';
import {
    CourseModel,
    DashboardModel,
    EnrollmentModel,
    FeeModel,
    MemberModel,
    TrainingModel,
} from '../models/platform.model';

export interface CrudService<T, C> {
    getAll(): Promise<T[]>;
    getById(id: number): Promise<T | undefined>;
    create(data: C): Promise<T>;
    update(id: number, data: Partial<C>): Promise<T | undefined>;
    delete(id: number): Promise<boolean>;
}

class ValidationService {
    protected requireText(value: string | undefined, field: string): void {
        if (!value || value.trim().length === 0) {
            throw new Error(`${field} is required`);
        }
    }

    protected requirePositiveNumber(value: number | undefined, field: string): void {
        if (value === undefined || Number(value) <= 0) {
            throw new Error(`${field} must be greater than zero`);
        }
    }
}

export class MemberService extends ValidationService implements CrudService<Member, CreateMemberDTO> {
    constructor(private memberModel: MemberModel) {
        super();
    }

    getAll(): Promise<Member[]> {
        return this.memberModel.findAll();
    }

    getById(id: number): Promise<Member | undefined> {
        return this.memberModel.findById(id);
    }

    create(data: CreateMemberDTO): Promise<Member> {
        this.requireText(data.full_name, 'Full name');
        this.requireText(data.email, 'Email');
        this.requireText(data.phone, 'Phone');
        return this.memberModel.create(data);
    }

    update(id: number, data: Partial<CreateMemberDTO>): Promise<Member | undefined> {
        return this.memberModel.update(id, data);
    }

    delete(id: number): Promise<boolean> {
        return this.memberModel.delete(id);
    }
}

export class CourseService extends ValidationService implements CrudService<Course, CreateCourseDTO> {
    constructor(private courseModel: CourseModel) {
        super();
    }

    getAll(): Promise<Course[]> {
        return this.courseModel.findAll();
    }

    getById(id: number): Promise<Course | undefined> {
        return this.courseModel.findById(id);
    }

    create(data: CreateCourseDTO): Promise<Course> {
        this.requireText(data.title, 'Course title');
        this.requireText(data.language, 'Language');
        this.requirePositiveNumber(data.duration_weeks, 'Duration');
        this.requirePositiveNumber(data.price, 'Price');
        return this.courseModel.create(data);
    }

    update(id: number, data: Partial<CreateCourseDTO>): Promise<Course | undefined> {
        return this.courseModel.update(id, data);
    }

    delete(id: number): Promise<boolean> {
        return this.courseModel.delete(id);
    }
}

export class TrainingService extends ValidationService implements CrudService<Training, CreateTrainingDTO> {
    constructor(private trainingModel: TrainingModel) {
        super();
    }

    getAll(): Promise<Training[]> {
        return this.trainingModel.findAll();
    }

    getById(id: number): Promise<Training | undefined> {
        return this.trainingModel.findById(id);
    }

    create(data: CreateTrainingDTO): Promise<Training> {
        this.requirePositiveNumber(data.course_id, 'Course');
        this.requireText(data.trainer_name, 'Trainer');
        this.requireText(data.room, 'Room');
        this.requirePositiveNumber(data.capacity, 'Capacity');
        return this.trainingModel.create(data);
    }

    update(id: number, data: Partial<CreateTrainingDTO>): Promise<Training | undefined> {
        return this.trainingModel.update(id, data);
    }

    delete(id: number): Promise<boolean> {
        return this.trainingModel.delete(id);
    }
}

export class FeeService extends ValidationService implements CrudService<Fee, CreateFeeDTO> {
    constructor(private feeModel: FeeModel) {
        super();
    }

    getAll(): Promise<Fee[]> {
        return this.feeModel.findAll();
    }

    getById(id: number): Promise<Fee | undefined> {
        return this.feeModel.findById(id);
    }

    create(data: CreateFeeDTO): Promise<Fee> {
        this.requirePositiveNumber(data.course_id, 'Course');
        this.requireText(data.title, 'Fee title');
        this.requirePositiveNumber(data.amount, 'Amount');
        return this.feeModel.create(data);
    }

    update(id: number, data: Partial<CreateFeeDTO>): Promise<Fee | undefined> {
        return this.feeModel.update(id, data);
    }

    delete(id: number): Promise<boolean> {
        return this.feeModel.delete(id);
    }
}

export class EnrollmentService extends ValidationService implements CrudService<Enrollment, CreateEnrollmentDTO> {
    constructor(private enrollmentModel: EnrollmentModel) {
        super();
    }

    getAll(): Promise<Enrollment[]> {
        return this.enrollmentModel.findAll();
    }

    getById(id: number): Promise<Enrollment | undefined> {
        return this.enrollmentModel.findById(id);
    }

    create(data: CreateEnrollmentDTO): Promise<Enrollment> {
        this.requirePositiveNumber(data.member_id, 'Member');
        this.requirePositiveNumber(data.course_id, 'Course');
        return this.enrollmentModel.create(data);
    }

    update(id: number, data: Partial<CreateEnrollmentDTO>): Promise<Enrollment | undefined> {
        return this.enrollmentModel.update(id, data);
    }

    delete(id: number): Promise<boolean> {
        return this.enrollmentModel.delete(id);
    }
}

export class DashboardService {
    constructor(private dashboardModel: DashboardModel) {}

    getStats(): Promise<DashboardStats> {
        return this.dashboardModel.getStats();
    }
}
