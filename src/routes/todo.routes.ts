import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { verifyToken } from '../middlewares/auth.middleware';
import { validatePostTodo } from '../utils/validator';

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

router.post('/', verifyToken, async (req: Request, res: Response) => {
    const { error, value } = validatePostTodo({
        title: req.body.title,
        content: req.body.content});
    
    if (error) {
        res.status(400).json({ error });
        return;
    }

    const { title, content } = value;

    
    if (!req.user?.id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const todo = await prisma.todo.create({
            data: {
                title,
                content,
                userId: req.user?.id
            }
        });
        res.status(201).json(todo);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/toggle_complete/:id', verifyToken, async (req: Request, res: Response) => {
    const todoId = req.params.id;

    try {
        const todo = await prisma.todo.findUnique({
            where: {
                id: todoId,
                userId: req.user?.id
            }
        })

        if (!todo) {
            res.status(404).json({ error: 'Todo not found' });
            return;
        }

        const updatedTodo = await prisma.todo.update({
            where: { id: todoId },
            data: { completed: !todo.completed }
        });

        res.status(200).json(updatedTodo);
    } catch (error) {
        console.error('Error toggling todo completion:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
});

router.delete('/:id', verifyToken, async (req: Request, res: Response) => {
    const todoId = req.params.id;
    
    try {
        const todo = await prisma.todo.findUnique({
            where: {
                id: todoId,
                userId: req.user?.id
            }
        });

        if (!todo) {
            res.status(404).json({ error: 'Todo not found' });
            return;
        }

        await prisma.todo.delete({
            where: { id: todoId }
        });

        res.status(201).json({ message: 'Todo deleted successfully' });
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
