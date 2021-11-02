import { PrismaClient, Post } from '@prisma/client';
import DatabaseException from '../errors/database.exception';
import { logger } from '../utils/logger.util';

const prisma = new PrismaClient();

export default class PostService {
    public static createPost = async (
        title: string,
        content: string,
        authorEmail: string,
    ): Promise<Post> => {
        try {
            const post = await prisma.post.create({
                data: {
                    title,
                    content,
                    author: { connect: { email: authorEmail } },
                },
            });

            logger.info(
                `Successfully created post for user with email: ${authorEmail}`,
            );
            return post;
        } catch (error) {
            logger.error(error);
            throw new DatabaseException('Create Post');
        }
    };

    public static incrementViews = async (id: string): Promise<Post> => {
        try {
            const post = await prisma.post.update({
                where: { id: Number(id) },
                data: {
                    viewCount: {
                        increment: 1,
                    },
                },
            });

            logger.info(
                `Successfully incremented views on post with ID: ${id}`,
            );
            return post;
        } catch (error) {
            logger.error(error);
            throw new DatabaseException('Increment Views');
        }
    };

    public static publishPost = async (id: string): Promise<Post> => {
        try {
            const postData = await prisma.post.findUnique({
                where: { id: Number(id) },
                select: {
                    published: true,
                },
            });

            const updatedPost = await prisma.post.update({
                where: { id: Number(id) || undefined },
                data: { published: !postData?.published },
            });

            logger.info(`Successfully published post with ID: ${id}`);
            return updatedPost;
        } catch (error) {
            logger.error(error);
            throw new DatabaseException('Publish Post');
        }
    };

    public static getUnpublishedPosts = async (id: string): Promise<Post[]> => {
        try {
            const drafts = await prisma.user
                .findUnique({
                    where: {
                        id: Number(id),
                    },
                })
                .posts({
                    where: { published: false },
                });

            logger.info(
                `Successfully retrieved unpublished posts for user with ID: ${id}`,
            );
            return drafts;
        } catch (error) {
            logger.error(error);
            throw new DatabaseException('Get Unpublished Posts');
        }
    };

    public static getPost = async (id: string): Promise<Post | null> => {
        try {
            const post = await prisma.post.findUnique({
                where: { id: Number(id) },
            });

            logger.info(`Successfully retrieved post with ID: ${id}`);
            return post;
        } catch (error) {
            logger.error(error);
            throw new DatabaseException('Get Specific Post');
        }
    };

    public static deletePost = async (id: string): Promise<Post | null> => {
        try {
            const post = await prisma.post.delete({
                where: { id: Number(id) },
            });

            logger.info(`Successfully deleted post with ID: ${id}`);
            return post;
        } catch (error) {
            logger.error(error);
            throw new DatabaseException('Delete Specific Post');
        }
    };
}
