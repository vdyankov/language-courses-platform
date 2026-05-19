import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
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

export class MemberModel {
    constructor(private db: Pool) {}

    async findAll(): Promise<Member[]> {
        const [rows] = await this.db.query<RowDataPacket[]>(
            'SELECT * FROM members ORDER BY joined_at DESC, id DESC'
        );
        return rows as Member[];
    }

    async findById(id: number): Promise<Member | undefined> {
        const [rows] = await this.db.query<RowDataPacket[]>(
            'SELECT * FROM members WHERE id = ?',
            [id]
        );
        return rows[0] as Member | undefined;
    }

    async create(member: CreateMemberDTO): Promise<Member> {
        const [result] = await this.db.query<ResultSetHeader>(
            'INSERT INTO members(full_name, email, phone, level) VALUES (?, ?, ?, ?)',
            [member.full_name, member.email, member.phone, member.level]
        );
        const created = await this.findById(result.insertId);
        if (!created) {
            throw new Error('Member was not created');
        }
        return created;
    }

    async update(id: number, data: Partial<CreateMemberDTO>): Promise<Member | undefined> {
        const existing = await this.findById(id);
        if (!existing) {
            return undefined;
        }
        const updated = { ...existing, ...data };
        await this.db.query<ResultSetHeader>(
            'UPDATE members SET full_name = ?, email = ?, phone = ?, level = ? WHERE id = ?',
            [updated.full_name, updated.email, updated.phone, updated.level, id]
        );
        return this.findById(id);
    }

    async delete(id: number): Promise<boolean> {
        const [result] = await this.db.query<ResultSetHeader>(
            'DELETE FROM members WHERE id = ?',
            [id]
        );
        return result.affectedRows === 1;
    }
}

export class CourseModel {
    constructor(private db: Pool) {}

    async findAll(): Promise<Course[]> {
        const [rows] = await this.db.query<RowDataPacket[]>(
            'SELECT * FROM courses ORDER BY language, level, title'
        );
        return rows as Course[];
    }

    async findById(id: number): Promise<Course | undefined> {
        const [rows] = await this.db.query<RowDataPacket[]>(
            'SELECT * FROM courses WHERE id = ?',
            [id]
        );
        return rows[0] as Course | undefined;
    }

    async create(course: CreateCourseDTO): Promise<Course> {
        const [result] = await this.db.query<ResultSetHeader>(
            `INSERT INTO courses(title, language, level, duration_weeks, price, description)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                course.title,
                course.language,
                course.level,
                course.duration_weeks,
                course.price,
                course.description,
            ]
        );
        const created = await this.findById(result.insertId);
        if (!created) {
            throw new Error('Course was not created');
        }
        return created;
    }

    async update(id: number, data: Partial<CreateCourseDTO>): Promise<Course | undefined> {
        const existing = await this.findById(id);
        if (!existing) {
            return undefined;
        }
        const updated = { ...existing, ...data };
        await this.db.query<ResultSetHeader>(
            `UPDATE courses
             SET title = ?, language = ?, level = ?, duration_weeks = ?, price = ?, description = ?
             WHERE id = ?`,
            [
                updated.title,
                updated.language,
                updated.level,
                updated.duration_weeks,
                updated.price,
                updated.description,
                id,
            ]
        );
        return this.findById(id);
    }

    async delete(id: number): Promise<boolean> {
        const [result] = await this.db.query<ResultSetHeader>(
            'DELETE FROM courses WHERE id = ?',
            [id]
        );
        return result.affectedRows === 1;
    }
}

export class TrainingModel {
    constructor(private db: Pool) {}

    async findAll(): Promise<Training[]> {
        const [rows] = await this.db.query<RowDataPacket[]>(
            `SELECT trainings.*, courses.title AS course_title, courses.language
             FROM trainings
             JOIN courses ON courses.id = trainings.course_id
             ORDER BY trainings.starts_at`
        );
        return rows as Training[];
    }

    async findById(id: number): Promise<Training | undefined> {
        const [rows] = await this.db.query<RowDataPacket[]>(
            `SELECT trainings.*, courses.title AS course_title, courses.language
             FROM trainings
             JOIN courses ON courses.id = trainings.course_id
             WHERE trainings.id = ?`,
            [id]
        );
        return rows[0] as Training | undefined;
    }

    async create(training: CreateTrainingDTO): Promise<Training> {
        const [result] = await this.db.query<ResultSetHeader>(
            `INSERT INTO trainings(course_id, trainer_name, room, starts_at, ends_at, capacity)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                training.course_id,
                training.trainer_name,
                training.room,
                training.starts_at,
                training.ends_at,
                training.capacity,
            ]
        );
        const created = await this.findById(result.insertId);
        if (!created) {
            throw new Error('Training was not created');
        }
        return created;
    }

    async update(id: number, data: Partial<CreateTrainingDTO>): Promise<Training | undefined> {
        const existing = await this.findById(id);
        if (!existing) {
            return undefined;
        }
        const updated = { ...existing, ...data };
        await this.db.query<ResultSetHeader>(
            `UPDATE trainings
             SET course_id = ?, trainer_name = ?, room = ?, starts_at = ?, ends_at = ?, capacity = ?
             WHERE id = ?`,
            [
                updated.course_id,
                updated.trainer_name,
                updated.room,
                updated.starts_at,
                updated.ends_at,
                updated.capacity,
                id,
            ]
        );
        return this.findById(id);
    }

    async delete(id: number): Promise<boolean> {
        const [result] = await this.db.query<ResultSetHeader>(
            'DELETE FROM trainings WHERE id = ?',
            [id]
        );
        return result.affectedRows === 1;
    }
}

export class FeeModel {
    constructor(private db: Pool) {}

    async findAll(): Promise<Fee[]> {
        const [rows] = await this.db.query<RowDataPacket[]>(
            `SELECT fees.*, courses.title AS course_title, members.full_name AS member_name
             FROM fees
             JOIN courses ON courses.id = fees.course_id
             LEFT JOIN members ON members.id = fees.member_id
             ORDER BY fees.due_date`
        );
        return rows as Fee[];
    }

    async findById(id: number): Promise<Fee | undefined> {
        const [rows] = await this.db.query<RowDataPacket[]>(
            `SELECT fees.*, courses.title AS course_title, members.full_name AS member_name
             FROM fees
             JOIN courses ON courses.id = fees.course_id
             LEFT JOIN members ON members.id = fees.member_id
             WHERE fees.id = ?`,
            [id]
        );
        return rows[0] as Fee | undefined;
    }

    async create(fee: CreateFeeDTO): Promise<Fee> {
        const [result] = await this.db.query<ResultSetHeader>(
            'INSERT INTO fees(course_id, member_id, title, amount, due_date, paid) VALUES (?, ?, ?, ?, ?, ?)',
            [fee.course_id, fee.member_id ?? null, fee.title, fee.amount, fee.due_date, fee.paid]
        );
        const created = await this.findById(result.insertId);
        if (!created) {
            throw new Error('Fee was not created');
        }
        return created;
    }

    async update(id: number, data: Partial<CreateFeeDTO>): Promise<Fee | undefined> {
        const existing = await this.findById(id);
        if (!existing) {
            return undefined;
        }
        const updated = { ...existing, ...data };
        await this.db.query<ResultSetHeader>(
            `UPDATE fees
             SET course_id = ?, member_id = ?, title = ?, amount = ?, due_date = ?, paid = ?
             WHERE id = ?`,
            [
                updated.course_id,
                updated.member_id ?? null,
                updated.title,
                updated.amount,
                updated.due_date,
                updated.paid,
                id,
            ]
        );
        return this.findById(id);
    }

    async delete(id: number): Promise<boolean> {
        const [result] = await this.db.query<ResultSetHeader>(
            'DELETE FROM fees WHERE id = ?',
            [id]
        );
        return result.affectedRows === 1;
    }
}

export class EnrollmentModel {
    constructor(private db: Pool) {}

    async findAll(): Promise<Enrollment[]> {
        const [rows] = await this.db.query<RowDataPacket[]>(
            `SELECT enrollments.*, members.full_name AS member_name, courses.title AS course_title
             FROM enrollments
             JOIN members ON members.id = enrollments.member_id
             JOIN courses ON courses.id = enrollments.course_id
             ORDER BY enrollments.enrolled_at DESC, enrollments.id DESC`
        );
        return rows as Enrollment[];
    }

    async findById(id: number): Promise<Enrollment | undefined> {
        const [rows] = await this.db.query<RowDataPacket[]>(
            `SELECT enrollments.*, members.full_name AS member_name, courses.title AS course_title
             FROM enrollments
             JOIN members ON members.id = enrollments.member_id
             JOIN courses ON courses.id = enrollments.course_id
             WHERE enrollments.id = ?`,
            [id]
        );
        return rows[0] as Enrollment | undefined;
    }

    async create(enrollment: CreateEnrollmentDTO): Promise<Enrollment> {
        const [result] = await this.db.query<ResultSetHeader>(
            `INSERT INTO enrollments(member_id, course_id, status, enrolled_at)
             VALUES (?, ?, ?, ?)`,
            [
                enrollment.member_id,
                enrollment.course_id,
                enrollment.status,
                enrollment.enrolled_at,
            ]
        );
        const created = await this.findById(result.insertId);
        if (!created) {
            throw new Error('Enrollment was not created');
        }
        return created;
    }

    async update(id: number, data: Partial<CreateEnrollmentDTO>): Promise<Enrollment | undefined> {
        const existing = await this.findById(id);
        if (!existing) {
            return undefined;
        }
        const updated = { ...existing, ...data };
        await this.db.query<ResultSetHeader>(
            `UPDATE enrollments
             SET member_id = ?, course_id = ?, status = ?, enrolled_at = ?
             WHERE id = ?`,
            [updated.member_id, updated.course_id, updated.status, updated.enrolled_at, id]
        );
        return this.findById(id);
    }

    async delete(id: number): Promise<boolean> {
        const [result] = await this.db.query<ResultSetHeader>(
            'DELETE FROM enrollments WHERE id = ?',
            [id]
        );
        return result.affectedRows === 1;
    }
}

export class DashboardModel {
    constructor(private db: Pool) {}

    async getStats(): Promise<DashboardStats> {
        const [memberRows] = await this.db.query<RowDataPacket[]>('SELECT COUNT(*) AS total FROM members');
        const [courseRows] = await this.db.query<RowDataPacket[]>('SELECT COUNT(*) AS total FROM courses');
        const [trainingRows] = await this.db.query<RowDataPacket[]>('SELECT COUNT(*) AS total FROM trainings');
        const [enrollmentRows] = await this.db.query<RowDataPacket[]>('SELECT COUNT(*) AS total FROM enrollments');
        const [feeRows] = await this.db.query<RowDataPacket[]>(
            'SELECT COUNT(*) AS total FROM fees WHERE paid = FALSE'
        );
        const [upcomingRows] = await this.db.query<RowDataPacket[]>(
            `SELECT trainings.*, courses.title AS course_title, courses.language
             FROM trainings
             JOIN courses ON courses.id = trainings.course_id
             WHERE trainings.starts_at >= NOW()
             ORDER BY trainings.starts_at
             LIMIT 3`
        );

        return {
            members: Number(memberRows[0]?.total ?? 0),
            courses: Number(courseRows[0]?.total ?? 0),
            trainings: Number(trainingRows[0]?.total ?? 0),
            enrollments: Number(enrollmentRows[0]?.total ?? 0),
            unpaidFees: Number(feeRows[0]?.total ?? 0),
            upcomingTrainings: upcomingRows as Training[],
        };
    }
}
