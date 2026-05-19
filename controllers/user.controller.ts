import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

interface IdParams {
    id: string;
}

interface EmailParams {
    email: string;
}

export class UserController {
    constructor(private userService: UserService) {}

    getAll = async (req: Request, res: Response): Promise <void> => {
        const users = await this.userService.getAllUsers();
        res.json({ message: 'Users found', data: users });
    };

    getById = async (req: Request<IdParams>, res: Response): Promise<void> => {
        const id = Number(req.params.id);
        const user = await this.userService.getUserById(id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ message: 'User found', data: user });
    };

    getByEmail = async (req: Request<EmailParams>, res: Response): Promise<void> => {
        const user = await this.userService.getUserByEmail(req.params.email);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ message: 'User found', data: user });
    };

    create = async (req: Request, res: Response): Promise<void> => {
        const { name, email } = req.body;
        const user = await this.userService.createUser({ name, email });
        res.status(201).json({ message: 'User created', data: user });
    };

    update = async (req: Request<IdParams>, res: Response): Promise<void> => {
        const id = Number(req.params.id);
        const user = await this.userService.updateUser(id, req.body);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ message: 'User updated', data: user });
    };

    delete = async (req: Request<IdParams>, res: Response): Promise<void> => {
        const id = Number(req.params.id);
        const deleted = await this.userService.deleteUser(id);
        if (!deleted) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ message: 'User deleted' });
    };
}
