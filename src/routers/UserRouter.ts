import { Router } from 'express';

import { UserController } from '../controller/UsersController';
import AdminRequired from '../middleware/AdminRequired';
import AuthLoginRequired from '../middleware/AuthLoginRequired';

const userRouter = Router();

const userController = new UserController();

userRouter.post('/set-code', AuthLoginRequired, (req, res) =>
    userController.setSecureCode(req, res),
);

userRouter.get('/get-code', AuthLoginRequired, (req, res) =>
    userController.getSecureCode(req, res),
);

userRouter.get('/count', AuthLoginRequired, AdminRequired, (req, res) =>
    userController.countAllUsers(req, res),
);
userRouter.post('/', AuthLoginRequired, AdminRequired, (req, res) =>
    userController.store(req, res),
);
userRouter.get('/profile-user', AuthLoginRequired, (req, res) =>
    userController.getDataUser(req, res),
);
userRouter.get('/', AuthLoginRequired, AdminRequired, (req, res) =>
    userController.getAllUsers(req, res),
);

userRouter.put('/', AuthLoginRequired, (req, res) => userController.update(req, res));
userRouter.delete('/', AuthLoginRequired, (req, res) => userController.delete(req, res));

export { userRouter };
