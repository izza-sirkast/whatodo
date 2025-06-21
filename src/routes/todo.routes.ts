import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', verifyToken,  async (req: Request, res: Response) => {
    try {
        const todos = await prisma.todo.findMany();
        res.status(200).json(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
