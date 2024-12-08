/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from 'express';

import { authRouter } from './AuthRouter';
import { passwdRouter } from './PasswdRouter';
import { userRouter } from './UserRouter';

class Routers {
    private router: Router = Router();
    private versionApiV1: string = '/api/v1';

    public constructor() {
        this.initializeRoutes(this.versionApiV1);
    }

    private initializeRoutes(versionApi: string): void {
        this.router.get('/', (_req, res) => res.json('Hello World!'));

        this.router.use(`${versionApi}/users`, userRouter);

        this.router.use(`${versionApi}/auth`, authRouter);

        this.router.use(`${versionApi}/passwd`, passwdRouter);
    }

    public getRouter(): Router {
        return this.router;
    }
}

export { Routers };
