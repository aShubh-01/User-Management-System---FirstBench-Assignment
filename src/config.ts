import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.join(__dirname, '../.env')})

export const prisma = new PrismaClient();

export const port = Number(process.env.PORT) || 3000;

export const jwtSecret = process.env.JWT_SECRET || '123secret';