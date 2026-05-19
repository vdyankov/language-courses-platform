import { Router } from 'express';
import {UserModel} from "../models/user.model";
import {UserService} from "../services/user.service";
import {UserController} from "../controllers/user.controller";
import pool from "../config/db"


const userModel = new UserModel(pool);
const userService = new UserService(userModel);
const userController = new UserController(userService);

const userRoutes = Router();

userRoutes.get('/users', userController.getAll);
userRoutes.get('/users/:id', userController.getById);
userRoutes.get('/users/by-email/:email', userController.getByEmail);
userRoutes.post('/users', userController.create);
userRoutes.put('/users/:id', userController.update);
userRoutes.delete('/users/:id', userController.delete);

export default userRoutes;
