import { Router, Request, Response} from 'express';
// import { PrismaClient } from '../generated/prisma';
import { genSalt, hash, compare } from 'bcryptjs';
import { validateRegister } from '../utils/validator';
import { sign } from 'jsonwebtoken';
import { prisma } from '../index';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();
// const prisma = new PrismaClient();

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

        await prisma.user.create({
            data: {
                username,
                hashed_password: hashedPassword
            }
        });

        res.status(201).json({ message: 'User registered successfully' });
        return;
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
})

router.post('/login', async (req: Request, res: Response) => {
    const { error, value } = validateRegister({ username: req.body.username, password: req.body.password });

    if (error) {
        res.status(400).json({ error });
        return;
    }

    const { username, password } = value;

    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const isPasswordValid = await compare(password, user.hashed_password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid password' });
            return;
        }

        if(process.env.ACC_SECRET === undefined || process.env.REF_SECRET === undefined) {
            res.status(500).json({ error: 'Server configuration error' });
            return;
        }

        const accessToken = sign({ id: user.id, username: user.username, fromLogin: true}, process.env.ACC_SECRET, { expiresIn: '15m' });

        const refreshToken = sign({ id: user.id, username: user.username}, process.env.REF_SECRET, { expiresIn: '1d' });

        res.cookie('ref', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        
        res.status(200).json({ accessToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

export default router;