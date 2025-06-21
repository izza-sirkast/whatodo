import { Request, Response, NextFunction } from "express";
import { verify, JwtPayload } from "jsonwebtoken";

export const verifyToken = (req: Request, res: Response, next: NextFunction ) => {
    const headerAuth = req.headers['authorization'];
    if (!headerAuth) {
        res.status(401).json({ error: 'Authorization header is missing' });
        return;
    }

    const token = headerAuth.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Token is missing' });
        return;
    }

    if(!process.env.ACC_SECRET) {
        res.status(500).json({ error: 'Server configuration error' });
        return;
    }

    try {
        const payload = verify(token, process.env.ACC_SECRET);

        req.user = payload as JwtPayload;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({ error: 'Invalid token' });
        return;
    }
}