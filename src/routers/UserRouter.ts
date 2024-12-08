import { Router } from 'express';

import { UserController } from '../controller/UsersController';
import AdminRequired from '../middleware/AdminRequired';
import AuthLoginRequired from '../middleware/AuthLoginRequired';

const userRouter = Router();

const userController = new UserController();

userRouter.post('/', AuthLoginRequired, (req, res) => userController.store(req, res));
userRouter.get('/profile-user', AuthLoginRequired, (req, res) =>
    userController.getDataUser(req, res),
);
userRouter.get('/', AuthLoginRequired, AdminRequired, (req, res) =>
    userController.getAllUsers(req, res),
);

export { userRouter };
