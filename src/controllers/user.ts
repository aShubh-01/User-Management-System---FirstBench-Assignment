import { jwtSecret, prisma } from '../config';
import { Request, Response } from 'express';
import { userDataSchema, userDataSchemaOptional } from '../validators/userSchema';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

function createJwt(payload: any) {
    return jwt.sign(payload, jwtSecret)
}

export const loginUser = async (req : Request, res : Response) => {

    const { email, password } = req.body;

    try {
        const userData = await prisma.user.findFirst({              // SEARCH THE USER IN DB
            where: { email: email, role: 'USER' }
        });

        if(!userData || !userData.isAccountActive) {
            res.status(404).json({         // RETURN IF USER DATA IS NOT FOUND
                message: "User not found"
            })
            return
        }

        const matchPassword  = bcrypt.compareSync(password, userData?.password || '')  // MATCH THE ENCRYPTED AND RECEIVED PASSWORD
        
        if(matchPassword) {
            const token = createJwt({userId: userData.id, role: userData.role})

            delete (userData as any).password;
            delete (userData as any).isAccountActive;
            delete (userData as any).id;
            delete (userData as any).role;

            res.status(200).json({                          // IF PASSWORD MATCHED, SEND THE USER DATA IN RESPONSE
                message: 'User Logged In',
                userData,
                token
            });

            return
        } else {
            res.status(400).json({                      // RESPONSE FOR INCORRECT PASSWORD
                message: 'Incorrect Password'
            })
            return
        }

    } catch (err) {
        console.error(err);
    }

    res.status(500).json({
        message: "Unable to login user"
    })
}

export const loginAdmin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const adminData = await prisma.user.findFirst({              // SEARCH THE USER IN DB
            where: { email: email, role: 'SUPERADMIN' },
        });

        if(!adminData || !adminData.isAccountActive) {
            res.status(404).json({         // RETURN IF USER DATA IS NOT FOUND
                message: "Admin not found"
            })
            return
        }

        const matchPassword  = bcrypt.compareSync(password, adminData?.password || '')  // MATCH THE ENCRYPTED AND RECEIVED PASSWORD
        if(matchPassword) {
            const token = createJwt({userId: adminData.id, role: adminData.role})

            delete (adminData as any).password;
            delete (adminData as any).isAccountActive;
            delete (adminData as any).id;
            delete (adminData as any).role;

            res.status(200).json({                          // IF PASSWORD MATCHED, SEND THE USER DATA IN RESPONSE
                message: 'Admin Logged In',
                adminData,
                token
            }) 
            return
        } else {
            res.status(400).json({                      // RESPONSE FOR INCORRECT PASSWORD
                message: 'Incorrect Password for admin'
            })
            return
        }

    } catch (err) {
        console.error(err);
    }

    res.status(500).json({
        message: "Unable to login admin"
    })
}

export const createUser = async (req: Request, res: Response) => {

    const { username, email, password, phoneNumber } = req.body;

    const parseResponse = userDataSchema.safeParse(req.body);

    if(!parseResponse.success) {
        res.status(400).json({
            message: 'Invalid Data Schema',
            issues: parseResponse.error.issues.map((issue) => (issue.message))
        })
        return
    } 

    try {
        const { id: userId, role } = await prisma.user.create({               // ADD THE USER IN THE DB
            data: {
                username: username,
                email: email,
                password: bcrypt.hashSync(password, 10),         // ENCRYPT THE PASSWORD BEFORE STORING IT IN THE DB
                phoneNumber: phoneNumber
            },
            select: { id: true, role: true }
        })

        const token = createJwt({userId, role})

        res.status(200).json({                       // RETURN A JWT TOKEN TO THE CLIENT
            message: 'User created succesfully',
            token
        })
        return

    } catch (err) { 
        console.error(err);
    }

    res.status(500).json({
        message: "Unable to create user"
    })
}

export const createAdmin = async (req: Request, res: Response) => {

    const { username, email, password, phoneNumber } = req.body;            // GET ADMIN DETAILS FROM THE CLIENT

    const parseResponse = userDataSchema.safeParse(req.body);               // PARSE THE DATA

    if(!parseResponse.success) {
        res.status(400).json({
            message: 'Invalid Data Schema',
            issues: parseResponse.error.issues.map((issue) => (issue.message))
        })
        return
    } 

    try {
        const { id: userId, role } = await prisma.user.create({               // ADD THE ADMIN IN THE DB
            data: {
                username: username,
                email: email,
                password: bcrypt.hashSync(password, 10),         // ENCRYPT THE PASSWORD BEFORE STORING IT IN THE DB
                phoneNumber: phoneNumber,
                role: 'SUPERADMIN'
            },
            select: { id: true, role: true }
        })

        const token = jwt.sign({userId, role}, jwtSecret);

        res.status(200).json({                       // RETURN A JWT TOKEN TO THE CLIENT
            message: 'Admin created succesfully',
            token
        })

        return

    } catch (err) { 
        console.error(err);
    }

    res.status(500).json({
        message: "Unable to create admin"
    })
}

export const updateUser = async (req: Request, res: Response) => {

    const parseResponse = userDataSchemaOptional.safeParse(req.body);         // PARSE THE USER DATA

    if(!parseResponse.success) {
        res.status(400).json({
            message: 'Invalid Data Schema',
            issues: parseResponse.error.issues.map((message) => (message))
        })
        return
    }

    const userId = (req as any).userId;                                    // GET THE USER ID FROM MIDDLEWARE

    try {
        if(req.body.password) req.body.password = bcrypt.hashSync(req.body.password, 10);       // ENCRYPT THE NEW PASSWORD
        await prisma.user.update({                                                          // UPDATE THE USER DATA IN DB
            where: { id: userId },
            data: req.body
        });

        res.status(200).json({                       // RETURN A RESPONSE
            message: 'User data updated!'
        })
        return
    } catch (err) {
        console.error(err)
    }
    res.status(500).json({
        message: 'Unable to update user data'
    })
}

export const deactivateUser = async (req: Request, res: Response) => {

    const userId = (req as any).userId;

    try {
        await prisma.user.update({                                  // DEACTIVATE THE USER ACCOUNT BY USING THE USER ID FROM MIDDLEWARE
            where: { id: userId },                                  // NOTE - IF PRESERVING DATA IS AN PRIORITY THEN ITS BETTER TO JUST FLAG THE ACCOUNT AS DELETED,
            data: { isAccountActive: false }                            // RATHER THAN DELETING THE ACCOUNT FROM DB ITSELF
        });

        res.status(200).json({                               // RETURN APPROPRIATE RESPONSES
            message: 'User account deactivated'
        });
        return

    } catch (err) {
        console.error(err)
    }
    res.status(500).json({
        message: 'Unable to deactivate user'
    })
}

export const getUsers = async (req: Request, res: Response) => {            // GET ALL USERS FOR ADMIN REQUEST

    try {
        const allUsers = await prisma.user.findMany({               // GET USERS WITH ROLE 'USER', i.e dont fetch admins
            where: { role: 'USER' },
            select: {
                username: true,
                email: true,
                phoneNumber: true,
                isAccountActive: true
            }
        })

        if(allUsers.length < 1) {                   // SEND RESPONSE BASED ON FETCHED DATA
            res.status(404).json({            
                message: 'No users found'
            })
            return
        }

        res.status(500).json({
            message: 'Users found',
            allUsers
        })

        return
    } catch (err) {
        console.error(err)
    }
    res.status(500).json({
        message: 'Unable to fetch all users'
    })
}