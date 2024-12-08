/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export default (req: Request, res: Response, next: NextFunction): Response | void => {
    const authorization: string | undefined = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    if (authorization && authorization.startsWith('Bearer ')) {
        const token = authorization.split(' ')[1];

        try {
            const data: string | JwtPayload = jwt.verify(token, process.env.TOKEN_SECRET as string);

            const { id, name, permission } = data as JwtPayload;

            res.locals.user = { id, name, permission };

            res.setHeader('Cache-Control', 'no-store');
            res.setHeader('Pragma', 'no-cache');

            return next();
        } catch (error) {
            return res.status(500).json({ error: 'Ocorreu um erro interno.' });
        }
    }
};
