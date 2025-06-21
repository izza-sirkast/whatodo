import { Request, Response, NextFunction } from "express";
import { verify, sign, JwtPayload } from "jsonwebtoken";

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

    const accSecret = process.env.ACC_SECRET;
    const refSecret = process.env.REF_SECRET;

    if(!accSecret || !refSecret) {
        res.status(500).json({ error: 'Server configuration error' });
        return;
    }

    verify(token, accSecret, (error, payload) => {
        if (error) {
            console.error('Token verification error:', error)
            res.status(401).json({ error: 'Invalid access token' });
            return;

            // // Try using the refresh token;
            // const refreshToken = req.cookies['ref'];
            // if (!refreshToken) {
            //     res.status(401).json({ error: 'Unauthorized' });
            //     return;
            // }

            // verify(refreshToken, refSecret, (refreshError : any, refreshPayload : any) => {
            //     if (refreshError) {
            //         console.error('Refresh token verification error:', refreshError);
            //         res.status(401).json({ error: 'Invalid refresh token' });
            //         return;
            //     }
                
            //     // If refresh token is valid, we can issue a new access token
            //     const newAccessToken = sign({ id: (refreshPayload as JwtPayload).id, username: (refreshPayload as JwtPayload).username, fromLogin: false }, accSecret, { expiresIn: '15m' });
            //     res.status(200).json({ accessToken: newAccessToken });
            //     return;
            // });
        }

        req.user = payload as JwtPayload;
        next();
    });
}

