import bcrypt from 'bcrypt';
import CryptoJS from 'crypto-js';
import { Request, Response } from 'express';

import { Permissions } from '../enums/Permissions';
import { ResponseHTTP } from '../helpers/ResponseHTTP';
import { UserModel } from '../model/UserModel';

class UserController {
    private readonly secrectCode: string | undefined = process.env.DECRYPT_SECURE_CODE;

    public async store(req: Request, res: Response): Promise<Response> {
        try {
            const { name, email, password, permission } = req.body;

            if (!name || !email || !password || !permission) {
                return ResponseHTTP.error(res, 400, 'Preencha todos os campos', []);
            }

            const findUser = await UserModel.findOne({ email: email });

            if (findUser) {
                return ResponseHTTP.error(res, 400, 'Usuário já existe', []);
            }

            if (permission !== 'admin' && permission !== 'user') {
                return ResponseHTTP.error(res, 403, 'Permissão inválida', []);
            }

            const hashPasswd = bcrypt.hashSync(password, 12);

            const createModelUser = new UserModel({
                name: name,
                email: email,
                password: hashPasswd,
                permission: permission,
            });

            await createModelUser.validate();

            const createdUser = await createModelUser.save();

            return ResponseHTTP.success(res, 201, 'Usuário criado com sucesso', [
                { user: createdUser },
            ]);
        } catch (error) {
            return ResponseHTTP.error(res, 500, 'Erro Interno store', []);
        }
    }

    // metodo q n faz tanto sentido
    public async getDataUser(req: Request, res: Response): Promise<Response> {
        try {
            const idUserByUpdate = req.query.id;

            if (idUserByUpdate) {
                const getprofileUser = await UserModel.findById(idUserByUpdate, {
                    password: 0,
                    __v: 0,
                });

                return ResponseHTTP.success(res, 200, 'Sucesso ao trazer os dados do usuário', [
                    { user: getprofileUser },
                ]);
            }

            const idUser = res.locals.user.id;

            const dataFromUser = await UserModel.findById(idUser, {
                password: 0,
                __v: 0,
            }).exec();

            return ResponseHTTP.success(res, 200, 'Sucesso ao trazer os dados do usuário', [
                { user: dataFromUser },
            ]);
        } catch (error) {
            return ResponseHTTP.error(res, 500, 'Erro Interno getDataUser', []);
        }
    }

    public async getAllUsers(req: Request, res: Response): Promise<Response> {
        try {
            const users = await UserModel.find(
                {},
                {
                    password: 0,
                    __v: 0,
                },
            ).exec();

            return ResponseHTTP.success(res, 200, 'Sucesso ao trazer todos os usuários', [
                { users: users },
            ]);
        } catch (error) {
            return ResponseHTTP.error(res, 500, 'Erro Interno getAllUsers', []);
        }
    }

    public async update(req: Request, res: Response) {
        try {
            const idUserByUpdate = req.query.id;

            const dataUserForUpdate = req.body;

            const filteredUpdates: Record<string, string> = {};
            Object.keys(dataUserForUpdate).forEach((key) => {
                if (dataUserForUpdate[key] !== undefined && dataUserForUpdate[key] !== '') {
                    filteredUpdates[key] = dataUserForUpdate[key];
                }
            });

            if (filteredUpdates.password) {
                filteredUpdates.password = await bcrypt.hash(filteredUpdates.password, 12);
            }

            if (filteredUpdates.permission && res.locals.user.permission !== Permissions.Admin) {
                return ResponseHTTP.error(
                    res,
                    403,
                    'Apenas administradores podem alterar a permissão de um usuário.',
                    [],
                );
            }

            if (idUserByUpdate && res.locals.user.permission === Permissions.Admin) {
                const confirmedPermissionUserAdmin = await UserModel.findById(res.locals.user.id, {
                    password: 0,
                    __v: 0,
                });

                if (confirmedPermissionUserAdmin?.permission !== Permissions.Admin) {
                    return ResponseHTTP.error(
                        res,
                        403,
                        'Você não é um administrador para poder atualizar os dados de outro usuário.',
                        [],
                    );
                }

                const getDataUser = await UserModel.findById(idUserByUpdate, {
                    password: 0,
                    __v: 0,
                });

                if (getDataUser !== null) {
                    const updatedUser = await UserModel.findByIdAndUpdate(
                        idUserByUpdate,
                        filteredUpdates,
                        {
                            new: true,
                            fields: { password: 0, __v: 0 },
                        },
                    ).exec();

                    return ResponseHTTP.success(res, 200, 'Usuário atualizado com sucesso!', [
                        { user: updatedUser },
                    ]);
                }

                return ResponseHTTP.error(res, 404, 'Usuário não encontrado', []);
            }

            const updateUserLogged = await UserModel.findByIdAndUpdate(
                res.locals.user.id,
                filteredUpdates,
                {
                    new: true,
                },
            ).exec();

            if (!updateUserLogged) {
                return ResponseHTTP.error(res, 404, 'Usuário não encontrado', []);
            }

            const { _id, name, email } = updateUserLogged;

            return ResponseHTTP.success(res, 200, 'Usuário atualizado com sucesso!', [
                { user: { _id, name, email } },
            ]);
        } catch (error) {
            return ResponseHTTP.error(res, 500, 'Erro Interno update', []);
        }
    }

    public async delete(req: Request, res: Response) {
        try {
            const idUserDeleteByAdmin = req.query.id;

            const userLogged = res.locals.user;

            if (idUserDeleteByAdmin && res.locals.user.permission === Permissions.Admin) {
                const confirmedPermissionUserAdmin = await UserModel.findById(res.locals.user.id, {
                    password: 0,
                    __v: 0,
                });

                if (confirmedPermissionUserAdmin?.permission !== Permissions.Admin) {
                    return ResponseHTTP.error(
                        res,
                        403,
                        'Você não é um administrador para poder apagar outro usuário.',
                        [],
                    );
                }

                const getDataUser = await UserModel.findById(idUserDeleteByAdmin, {
                    password: 0,
                    __v: 0,
                });

                if (getDataUser !== null) {
                    await UserModel.deleteOne({ _id: getDataUser._id }).exec();

                    return ResponseHTTP.success(res, 200, 'Usuário deletado com sucesso!', []);
                }

                return ResponseHTTP.error(res, 404, 'Usuário não encontrado', []);
            }

            const userExists = await UserModel.findById(userLogged.id).exec();

            if (!userExists) {
                return ResponseHTTP.error(res, 404, 'Usuário não encontrado', []);
            }

            await UserModel.deleteOne({ _id: userExists._id }).exec();

            return ResponseHTTP.success(res, 200, 'Usuário deletado com sucesso!', []);
        } catch (error) {
            return ResponseHTTP.error(res, 500, 'Erro Interno delete', []);
        }
    }

    public async setSecureCode(req: Request, res: Response) {
        try {
            const { secure_code } = req.body;

            const idUserLogged = res.locals.user.id;

            const user = await UserModel.findById(idUserLogged);

            if (!user) {
                return ResponseHTTP.error(res, 404, 'Usuário não encontrado', []);
            }

            // if (user.security_code) {
            //     return ResponseHTTP.error(res, 400, 'Código de segurança já cadastrado', []);
            // }

            if (!secure_code || secure_code.length < 4) {
                return ResponseHTTP.error(
                    res,
                    400,
                    'O código de segurança deve ter pelo menos 4 caracteres',
                    [],
                );
            }

            const hashSecureCode = bcrypt.hashSync(secure_code, 12);

            const encryptSecureCode = await this.encryptSecretCode(String(secure_code));
            console.log(encryptSecureCode);

            await UserModel.findByIdAndUpdate(
                idUserLogged,
                {
                    security_code: hashSecureCode,
                },
                { new: true },
            ).exec();

            return ResponseHTTP.success(res, 200, 'Código de segurança cadastrado com sucesso', [
                { secure_code: encryptSecureCode },
            ]);
        } catch (error) {
            return ResponseHTTP.error(res, 500, 'Erro Interno setSecureCode', []);
        }
    }

    public async getSecureCode(req: Request, res: Response) {
        try {
            const { code } = req.query;

            if (!code) {
                return ResponseHTTP.error(res, 400, 'Envie o codigo secreto', []);
            }

            const idUser = res.locals.user.id;

            const findUser = await UserModel.findOne({ _id: idUser }).exec();

            if (!findUser) {
                return res.status(400).json({ errors: ['Usuário não encontrado'] });
            }

            if (!bcrypt.compareSync(String(code), findUser.security_code)) {
                return ResponseHTTP.error(res, 400, 'Código de segurança inválido', []);
            }

            const encryptSecureCode = await this.encryptSecretCode(String(code));

            return ResponseHTTP.success(res, 200, 'Seu Código de segurança', [
                { secure_code: encryptSecureCode },
            ]);
        } catch (error) {
            return ResponseHTTP.error(res, 500, 'Erro Interno getSecureCode', []);
        }
    }

    private async encryptSecretCode(secretCode: string) {
        const encrypted = CryptoJS.AES.encrypt(secretCode, String(this.secrectCode)).toString();
        return encrypted;
    }

    public async countAllUsers(req: Request, res: Response) {
        try {
            const countUsers = await UserModel.countDocuments({}).exec();

            return ResponseHTTP.success(res, 200, 'Sucesso ao contar usuários', [
                { count: countUsers },
            ]);
        } catch (error) {
            return ResponseHTTP.error(res, 500, 'Erro Interno countAllUsers', []);
        }
    }
}

export { UserController };
