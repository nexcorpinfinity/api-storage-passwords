import { Router } from 'express';

import { EmailController } from '../controller/EmailsController';
import AdminRequired from '../middleware/AdminRequired';
import AuthLoginRequired from '../middleware/AuthLoginRequired';

const emailsRouter = Router();

const emailsController = new EmailController();

emailsRouter.get('/', AuthLoginRequired, AdminRequired, (req, res) =>
    emailsController.index(req, res),
);

emailsRouter.delete('/:id', AuthLoginRequired, AdminRequired, (req, res) =>
    emailsController.delete(req, res),
);

export { emailsRouter };
