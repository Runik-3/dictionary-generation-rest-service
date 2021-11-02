import { Request, Response, NextFunction } from 'express';

import UserService from '../services/user.service';

export default class UserController {
    public static handleRegisterUser = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { name, email } = req.body;

            const user = await UserService.createUser(name, email);
            res.json(user);
        } catch (error) {
            next(error);
        }
    };

    public static handleGetUsers = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const users = await UserService.getAllUsers();
            res.json(users);
        } catch (error) {
            next(error);
        }
    };

    public static handleDeleteUser = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { id } = req.params;

            const user = await UserService.deleteUser(id);
            res.json(user);
        } catch (error) {
            next(error);
        }
    };
}
