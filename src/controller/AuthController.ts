import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { UserModel } from '../model/UserModel';

class AuthController {
    public async store(req: Request, res: Response): Promise<Response> {
        const { email = '', password = '' } = req.body;

        if (!email || !password) {
            return res.status(401).json({ error: ['Preencha todos os campos'] });
        }

        const user = await UserModel.findOne({ email }).exec();

        if (!user) {
            return res.status(401).json({ error: ['Usuário não existe'] });
        }

        const checkPassValid = await this.verifyPasswordAndCompare(password, user.password);

        if (!checkPassValid) {
            return res.status(401).json({ error: ['Senha inválida'] });
        }

        const getToken = this.generateToken(
            String(user._id),
            user.name,
            user.email,
            user.permission,
        );

        return res.json({ token: getToken });
    }

    private async verifyPasswordAndCompare(
        password: string,
        hashPassword: string,
    ): Promise<boolean> {
        return await bcrypt.compare(password, hashPassword);
    }

    private generateToken(id: string, name: string, email: string, permission: string) {
        const token = jwt.sign(
            {
                id,
                name,
                permission,
            },
            process.env.TOKEN_SECRET as string,
        );

        return token;
    }
}

export { AuthController };
