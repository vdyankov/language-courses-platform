import { UserModel } from '../models/user.model';
import {CreateUserDTO, User} from '../types/User';

export class UserService {
    constructor(private userModel: UserModel) {}

    async getAllUsers(): Promise<User[]> {
        return await this.userModel.findAll();
    }

    async getUserById(id: number): Promise<User | undefined> {
        return await this.userModel.findById(id);
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        return await this.userModel.findByEmail(email);
    }

    async createUser(data: CreateUserDTO): Promise<User> {
        return await this.userModel.create(data);
    }

    async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
        return await this.userModel.update(id, data);
    }

    async deleteUser(id: number): Promise<boolean> {
        return this.userModel.delete(id);
    }
}
