import bcrypt from 'bcrypt';
import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

import { UserModel } from '../model/UserModel';

dotenv.config();

const secretKey = process.env.DECRYPT_SECURE_CODE;

export async function verifySecretCode(req: Request, res: Response, next: NextFunction) {
    try {
        const { secret_code } = req.query;

        if (!secret_code) {
            return res.status(400).json({ errors: ['Código secreto é necessário'] });
        }

        const decryptedCode = decryptSecretCode(String(secret_code));

        const idUser = res.locals.user.id;

        const findUser = await UserModel.findOne({ _id: idUser }).exec();

        if (!findUser) {
            return res.status(400).json({ errors: ['Usuário não encontrado'] });
        }

        console.log('Código secreto fornecido:', decryptedCode);

        const isMatch = bcrypt.compareSync(decryptedCode, findUser.security_code);

        if (!isMatch) {
            return res.status(403).json({ errors: ['Código secreto inválido'] });
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ errors: ['Erro interno ao verificar código secreto'] });
    }
}

function decryptSecretCode(encryptedCode: string): string {
    const bytes = CryptoJS.AES.decrypt(decodeURIComponent(encryptedCode), String(secretKey));
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedData) {
        throw new Error('Código secreto inválido');
    }

    return decryptedData;
}
