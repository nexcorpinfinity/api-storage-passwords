/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';

import { Permissions } from '../enums/Permissions';
import { ResponseHTTP } from '../helpers/ResponseHTTP';
import { UserModel } from '../model/UserModel';

export default async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const userInfo = res.locals.user;

        if (!userInfo) {
            return ResponseHTTP.error(res, 401, 'Usuário não autenticado', []);
        }

        const getDataUser = await UserModel.findById(userInfo.id, {
            password: 0,
            __v: 0,
        }).exec();

        if (!getDataUser || getDataUser === null) {
            return ResponseHTTP.error(res, 404, 'Usuário não encontrado', []);
        }

        if (userInfo.permission !== Permissions.Admin) {
            return ResponseHTTP.error(res, 403, 'Usuário não autorizado', []);
        }

        if (Permissions.Admin === getDataUser.permission) {
            return next();
        }

        return ResponseHTTP.error(res, 403, 'Usuário não autorizado', []);
    } catch (error) {
        return ResponseHTTP.error(res, 403, 'Erro ao verificar permissões', []);
    }
};
