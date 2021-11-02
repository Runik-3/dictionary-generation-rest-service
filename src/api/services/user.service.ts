import { PrismaClient, User } from '@prisma/client';

import { logger } from '../utils/logger.util';
import DatabaseException from '../errors/database.exception';

const prisma = new PrismaClient();

export default class UserService {
    public static createUser = async (
        name: string,
        email: string,
    ): Promise<User> => {
        try {
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                },
            });
            logger.info(`Successfully created user with email: ${email}`);
            return user;
        } catch (error) {
            logger.error(error);
            throw new DatabaseException('Create User');
        }
    };

    public static getAllUsers = async (): Promise<User[]> => {
        try {
            const users = await prisma.user.findMany();
            logger.info(`Successfully retrieved all users`);
            return users;
        } catch (error) {
            logger.error(error);
            throw new DatabaseException('Get All Users');
        }
    };

    public static deleteUser = async (id: string): Promise<User> => {
        try {
            await prisma.post.deleteMany({
                where: {
                    authorId: Number(id),
                },
            });

            const user = await prisma.user.delete({
                where: {
                    id: Number(id),
                },
            });
            logger.info(`Successfully delete user with ID: ${id}`);
            return user;
        } catch (error) {
            logger.error(error);
            throw new DatabaseException('Delete User');
        }
    };
}
