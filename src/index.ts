import express from 'express';
import { PrismaClient } from './generated/prisma';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import todoRoutes from './routes/todo.routes';
import { JwtPayload } from 'jsonwebtoken';
dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload ;
    }
  }
}

export const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/todos', todoRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})