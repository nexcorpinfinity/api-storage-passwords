import { Router } from 'express';

import { PasswdController } from '../controller/PasswdController';
import AdminRequired from '../middleware/AdminRequired';
import AuthLoginRequired from '../middleware/AuthLoginRequired';
import { verifySecretCode } from '../middleware/VerifySecretCode';

const passwdRouter = Router();

const passwdController = new PasswdController();

passwdRouter.get('/count-admin', AuthLoginRequired, AdminRequired, (req, res) =>
    passwdController.countAllPasswdAdmin(req, res),
);

passwdRouter.get('/count', AuthLoginRequired, (req, res) =>
    passwdController.countAllPasswd(req, res),
);

passwdRouter.post('/', AuthLoginRequired, (req, res) => passwdController.store(req, res));
passwdRouter.get('/', AuthLoginRequired, verifySecretCode, (req, res) =>
    passwdController.index(req, res),
);
passwdRouter.put('/:id', AuthLoginRequired, (req, res) => passwdController.update(req, res));
passwdRouter.delete('/:id', AuthLoginRequired, (req, res) => passwdController.delete(req, res));

export { passwdRouter };
