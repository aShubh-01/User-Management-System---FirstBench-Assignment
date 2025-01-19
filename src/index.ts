import express from 'express';
import cors from 'cors';
import { port } from './config';
import { getUsers, createUser, loginUser, updateUser, deactivateUser, loginAdmin, createAdmin } from './controllers/user';
import { authenticateAdmin, authenticateUser, checkIsAccountActive, checkUser } from './middlewares/auth';

const appRouter = express();

appRouter.use(express.json());
appRouter.use(cors())

appRouter.post('/signup', checkUser, createUser);
appRouter.post('/admin-signup', checkUser, createAdmin);
appRouter.post('/login', loginUser);
appRouter.post('/admin-login', loginAdmin);

appRouter.use(authenticateUser);
appRouter.put('/update', checkIsAccountActive, updateUser);
appRouter.delete('/deactivate', deactivateUser);

appRouter.use(authenticateAdmin);
appRouter.get('/list', getUsers);

appRouter.listen(port, () => console.log(`Running on port ${port}`))