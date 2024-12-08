import { Router } from 'express';

import { PasswdController } from '../controller/PasswdController';
import AuthLoginRequired from '../middleware/AuthLoginRequired';

const passwdRouter = Router();

const passwdController = new PasswdController();

passwdRouter.post('/', AuthLoginRequired, (req, res) => passwdController.store(req, res));
passwdRouter.get('/', AuthLoginRequired, (req, res) => passwdController.index(req, res));
passwdRouter.put('/:id', AuthLoginRequired, (req, res) => passwdController.update(req, res));
passwdRouter.delete('/:id', AuthLoginRequired, (req, res) => passwdController.delete(req, res));

export { passwdRouter };
