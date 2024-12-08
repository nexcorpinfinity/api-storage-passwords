/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';

import { Permissions } from '../enums/Permissions';
import { UserModel } from '../model/UserModel';

export default async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const userInfo = res.locals.user;

        if (!userInfo) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const getDataUser = await UserModel.findById(userInfo.id, {
            password: 0,
            __v: 0,
        }).exec();

        if (!getDataUser || getDataUser === null) {
            return res.status(401).json({ message: 'Usuário não encontrado.' });
        }

        if (userInfo.permission !== Permissions.Admin) {
            return res.status(401).json({ message: 'Usuário não autorizado.' });
        }

        if (Permissions.Admin === getDataUser.permission) {
            return next();
        }

        return res.status(401).json({ message: 'Usuário não autorizado.' });
    } catch (error: any) {
        return res.status(401).json({ message: 'Erro ao verificar permissões', error });
    }
};
