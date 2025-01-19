import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { jwtSecret, prisma } from '../config';

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    const token = req.headers.authorization;
    if(!token) {
        res.status(401).json({
            message: 'auth token not found'
        })
        return
    }

    try {
        const decodedJwt = jwt.verify(token, jwtSecret) as JwtPayload;
        if(!decodedJwt.userId) {
            console.log(decodedJwt);
            res.status(403).json({
                message: 'Unauthorized access'
            })
            return
        }
        (req as any).userId = decodedJwt.userId;
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({
            message: 'Unable to authorize user'
        })
    }
}

export const checkUser = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    const { email } = req.body;
    try {
        const existingUser = await prisma.user.findFirst({
            where: { email }
        })

        if(existingUser) {
            res.status(409).json({
                message: 'Email already registered'
            })
            return
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Server error'
        })
    }
}

export const checkIsAccountActive = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    const userId = (req as any).userId;
    try {
        const { isAccountActive } : any= await prisma.user.findFirst({
            where: { id: userId },
            select: { isAccountActive: true }
        });

        if(!isAccountActive) {
            res.status(404).json({
                message: 'User not found'
            })
            return
        }

        next();

    } catch (err) {
        console.error(err)
        res.status(401).json({
            message: 'Unable to authorize user'
        })
    }
}

export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    const token = req.headers.authorization;
    if(!token) {
        res.status(401).json({
            message: 'auth token not found'
        })
        return
    }

    const decodedJwt = jwt.verify(token, jwtSecret) as JwtPayload;
    if(decodedJwt.role != 'SUPERADMIN') {
        res.status(403).json({
            message: 'Unauthorized access'
        })
        return
    }

    next();
}