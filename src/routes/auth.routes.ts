import express, { Router, Request, Response} from 'express';
import { PrismaClient } from '../generated/prisma';
import { genSalt, hash } from 'bcryptjs';
import { validateRegister } from '../utils/validator';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/register', async (req: Request, res: Response)  => {
    const { error, value } = validateRegister({ username: req.body.username, password: req.body.password });
    if (error) {
        res.status(400).json({ error });
        return;
    }

    const { username, password } = value;

    try {
        const salt = await genSalt(10);
        const hashedPassword = await hash(password, salt);

        const user = await prisma.user.create({
            data: {
                username,
                hashed_password: hashedPassword
            }
        });

        res.status(201).json({ message: 'User registered successfully', user });
        return;
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
})

export default router;