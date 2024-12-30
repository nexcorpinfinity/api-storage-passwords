import CryptoJS from 'crypto-js';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { ResponseHTTP } from '../helpers/ResponseHTTP';
import { PasswdModel } from '../model/PasswdModel';
import { UserModel } from '../model/UserModel';

class PasswdController {
    private readonly secretKey: string | undefined = process.env.CRYPTO_HASH_PASSWORDS;

    public async store(req: Request, res: Response) {
        try {
            const { name, login_email, password } = req.body;

            if (!name || !password) {
                return ResponseHTTP.error(res, 400, 'Preencha o nome e passwd', []);
            }

            const idUser = res.locals.user.id;

            if (await PasswdModel.findOne({ name: name, user_id: idUser })) {
                return ResponseHTTP.error(res, 400, 'Este nome já existe', []);
            }

            const findUser = await UserModel.findOne({ _id: idUser }).exec();

            if (!findUser) {
                return ResponseHTTP.error(res, 400, 'Usuário não encontrado', []);
            }

            const getSecretKey = this.generateSecretKey(findUser?.security_code);
            const encryptName = await this.encryptData(name, getSecretKey);
            const encryptEmailAndLogin = login_email
                ? await this.encryptData(login_email, getSecretKey)
                : '';
            const encryptPassword = await this.encryptData(password, getSecretKey);

            const createNewPass = new PasswdModel({
                name: encryptName,
                login_email: encryptEmailAndLogin,
                password: encryptPassword,
                user_id: idUser,
            });

            await createNewPass.validate();

            const created = await createNewPass.save();

            return ResponseHTTP.success(res, 201, 'Sucesso ao criar uma senha', [
                { passwd: created },
            ]);
        } catch (error) {
            return ResponseHTTP.error(res, 500, 'Erro Interno store', []);
        }
    }

    public async index(req: Request, res: Response): Promise<Response> {
        try {
            const findUser = await UserModel.findOne({ _id: res.locals.user.id }).exec();

            if (!findUser) {
                return ResponseHTTP.error(res, 400, 'Usuário não encontrado', []);
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filter: any = {};

            if (typeof req.query.id === 'string') {
                filter._id = new mongoose.Types.ObjectId(req.query.id);
            }

            const listPasswords = await PasswdModel.find(
                { ...filter, user_id: res.locals.user.id },
                { __v: 0 },
            )
                .sort({ createdAt: -1 })
                .exec();

            await Promise.all(
                listPasswords.map(async (psswd) => {
                    const getSecretKey = this.generateSecretKey(findUser?.security_code);

                    const decryptedName = await this.decryptData(String(psswd.name), getSecretKey);
                    const decryptedEmail =
                        psswd.login_email && psswd.login_email.trim() !== ''
                            ? await this.decryptData(String(psswd.login_email), getSecretKey)
                            : '';
                    const decryptedPassword = await this.decryptData(
                        String(psswd.password),
                        getSecretKey,
                    );

                    psswd.name = String(decryptedName);
                    psswd.login_email = String(decryptedEmail);
                    psswd.password = String(decryptedPassword);
                }),
            );

            return ResponseHTTP.success(res, 200, 'Sucesso ao listar senhas', [
                { passwords: listPasswords },
            ]);
        } catch (error) {
            console.log(error);
            return ResponseHTTP.error(res, 500, 'Erro Interno index', []);
        }
    }

    public async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, login_email, password } = req.body;

            const idUser = res.locals.user.id;
            const findUser = await UserModel.findOne({ _id: idUser }).exec();

            if (!findUser) {
                return ResponseHTTP.error(res, 404, 'Usuário não encontrado', []);
            }

            const getSecretKey = this.generateSecretKey(findUser?.security_code);

            const verify = await PasswdModel.findOne({ _id: id, user_id: idUser }).exec();

            if (!verify) {
                return ResponseHTTP.error(res, 404, 'Password não encontrada', []);
            }

            const existingPassword = await PasswdModel.findOne({ name, user_id: idUser }).exec();
            if (existingPassword && existingPassword._id.toString() !== id) {
                return ResponseHTTP.error(res, 400, 'Nome de senha já existe', []);
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const obj: any = {
                name: name || verify.name,
                login_email: login_email
                    ? await this.encryptData(login_email, getSecretKey)
                    : verify.login_email,
                password: password
                    ? await this.encryptData(password, getSecretKey)
                    : verify.password,
            };

            const passwdUpdate = await PasswdModel.findByIdAndUpdate(id, obj, { new: true }).exec();

            return ResponseHTTP.success(res, 200, 'Sucesso ao atualizar senha', [
                { passwd: passwdUpdate },
            ]);
        } catch (error) {
            console.log(error);
            return ResponseHTTP.error(res, 500, 'Erro Interno update', []);
        }
    }

    public async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const idUser = res.locals.user.id;

            const verifyExists = await PasswdModel.findOne({ _id: id, user_id: idUser }).exec();

            if (!verifyExists) {
                return ResponseHTTP.error(res, 404, 'Password não encontrada', []);
            }

            await PasswdModel.deleteOne({ _id: id }).exec();

            return ResponseHTTP.success(res, 200, 'Sucesso ao deletar senha', []);
        } catch (error) {
            console.log(error);
            return ResponseHTTP.error(res, 500, 'Erro Interno delete', []);
        }
    }

    private async decryptData(data: string, secretKey: string) {
        try {
            const decrypt = CryptoJS.AES.decrypt(data, secretKey);

            const decryptedData = decrypt.toString(CryptoJS.enc.Utf8);
            if (!decryptedData) {
                throw new Error('Dados descriptografados estão vazios ou malformados');
            }

            return decryptedData;
        } catch (error) {
            // console.error('Erro ao descriptografar dados:', error);
            throw new Error('Erro ao descriptografar dados');
        }
    }

    private async encryptData(data: string, secretKey: string): Promise<string> {
        return CryptoJS.AES.encrypt(data, secretKey).toString();
    }

    private generateSecretKey(secureCodeHash: string): string {
        const keyHash = CryptoJS.enc.Utf8.parse(secureCodeHash);
        const iterations = 10000;
        const keyLength = 32;

        const key = CryptoJS.PBKDF2(keyHash, String(this.secretKey), {
            keySize: keyLength / 4,
            iterations: iterations,
        });

        return key.toString(CryptoJS.enc.Hex);
    }

    public async countAllPasswdAdmin(req: Request, res: Response) {
        try {
            const count = await PasswdModel.countDocuments().exec();

            return ResponseHTTP.success(res, 200, 'Sucesso ao contar todas as senhas', [
                { count: count },
            ]);
        } catch (error) {
            return ResponseHTTP.error(res, 500, 'Erro Interno countAllPasswdAdmin', []);
        }
    }

    public async countAllPasswd(req: Request, res: Response) {
        try {
            const count = await PasswdModel.countDocuments({ user_id: res.locals.user.id }).exec();

            return ResponseHTTP.success(res, 200, 'Sucesso ao contar todas as senhas', [
                { count: count },
            ]);
        } catch (error) {
            return ResponseHTTP.error(res, 500, 'Erro Interno countAllPasswd', []);
        }
    }
}

export { PasswdController };
