import { Router } from 'express';
import pool from '../config/db';
import { CrudController, DashboardController } from '../controllers/platform.controller';
import {
    CourseModel,
    DashboardModel,
    EnrollmentModel,
    FeeModel,
    MemberModel,
    TrainingModel,
} from '../models/platform.model';
import {
    CourseService,
    DashboardService,
    EnrollmentService,
    FeeService,
    MemberService,
    TrainingService,
} from '../services/platform.service';
import {
    Course,
    CreateCourseDTO,
    CreateEnrollmentDTO,
    CreateFeeDTO,
    CreateMemberDTO,
    CreateTrainingDTO,
    Enrollment,
    Fee,
    Member,
    Training,
} from '../types/platform';

const platformRoutes = Router();

const memberController = new CrudController<Member, CreateMemberDTO>(
    new MemberService(new MemberModel(pool)),
    'Member'
);
const courseController = new CrudController<Course, CreateCourseDTO>(
    new CourseService(new CourseModel(pool)),
    'Course'
);
const trainingController = new CrudController<Training, CreateTrainingDTO>(
    new TrainingService(new TrainingModel(pool)),
    'Training'
);
const feeController = new CrudController<Fee, CreateFeeDTO>(
    new FeeService(new FeeModel(pool)),
    'Fee'
);
const enrollmentController = new CrudController<Enrollment, CreateEnrollmentDTO>(
    new EnrollmentService(new EnrollmentModel(pool)),
    'Enrollment'
);
const dashboardController = new DashboardController(
    new DashboardService(new DashboardModel(pool))
);

platformRoutes.get('/dashboard', dashboardController.getStats);

platformRoutes.get('/members', memberController.getAll);
platformRoutes.get('/members/:id', memberController.getById);
platformRoutes.post('/members', memberController.create);
platformRoutes.put('/members/:id', memberController.update);
platformRoutes.delete('/members/:id', memberController.delete);

platformRoutes.get('/courses', courseController.getAll);
platformRoutes.get('/courses/:id', courseController.getById);
platformRoutes.post('/courses', courseController.create);
platformRoutes.put('/courses/:id', courseController.update);
platformRoutes.delete('/courses/:id', courseController.delete);

platformRoutes.get('/trainings', trainingController.getAll);
platformRoutes.get('/trainings/:id', trainingController.getById);
platformRoutes.post('/trainings', trainingController.create);
platformRoutes.put('/trainings/:id', trainingController.update);
platformRoutes.delete('/trainings/:id', trainingController.delete);

platformRoutes.get('/fees', feeController.getAll);
platformRoutes.get('/fees/:id', feeController.getById);
platformRoutes.post('/fees', feeController.create);
platformRoutes.put('/fees/:id', feeController.update);
platformRoutes.delete('/fees/:id', feeController.delete);

platformRoutes.get('/enrollments', enrollmentController.getAll);
platformRoutes.get('/enrollments/:id', enrollmentController.getById);
platformRoutes.post('/enrollments', enrollmentController.create);
platformRoutes.put('/enrollments/:id', enrollmentController.update);
platformRoutes.delete('/enrollments/:id', enrollmentController.delete);

export default platformRoutes;
