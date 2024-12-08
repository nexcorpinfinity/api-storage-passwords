import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

import { Permissions } from '../enums/Permissions';
import { UserModel } from '../model/UserModel';

class UserController {
    public async store(req: Request, res: Response): Promise<Response> {
        try {
            const { name, email, password, permission } = req.body;

            if (!name || !email || !password || !permission) {
                return res.status(400).json({ error: 'Preencha todos os campos' });
            }

            if (await UserModel.findOne({ email })) {
                return res.status(400).json({ error: 'Email já existe' });
            }

            if (permission !== 'admin' && permission !== 'user') {
                return res.status(400).json({ error: 'Permissão inválida' });
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

            return res.status(201).json(createdUser);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Ocorreu um erro interno.' });
        }
    }

    public async getDataUser(req: Request, res: Response): Promise<Response> {
        try {
            const idUser = res.locals.user.id;

            const dataFromUser = await UserModel.findById(idUser, {
                password: 0,
                __v: 0,
            }).exec();

            return res.status(200).json(dataFromUser);
        } catch (error) {
            return res.status(500).json(null);
        }
    }

    public async getAllUsers(req: Request, res: Response): Promise<Response> {
        try {
            const dataFromUser = await UserModel.find(
                {},
                {
                    password: 0,
                    __v: 0,
                },
            ).exec();

            return res.status(200).json(dataFromUser);
        } catch (error) {
            return res.status(500).json(null);
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
                return res.status(403).json({
                    errors: 'Apenas administradores podem alterar a permissão de um usuário.',
                });
            }

            if (idUserByUpdate && res.locals.user.permission === Permissions.Admin) {
                const confirmedPermissionUserAdmin = await UserModel.findById(res.locals.user.id, {
                    password: 0,
                    __v: 0,
                });

                if (confirmedPermissionUserAdmin?.permission !== Permissions.Admin) {
                    return res.status(403).json({
                        errors: 'Você não é um administrador para poder atualizar os dados de outro usuário.',
                    });
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

                    return res.status(200).json({
                        msg: 'Usuário atualizado com sucesso!',
                        user: updatedUser,
                    });
                }

                return res.status(404).json({ errors: ['Usuário não encontrado.'] });
            }

            const updateUserLogged = await UserModel.findByIdAndUpdate(
                res.locals.user.id,
                filteredUpdates,
                {
                    new: true,
                },
            ).exec();

            if (!updateUserLogged) {
                return res.status(404).json({ errors: ['Conta não encontrada'] });
            }

            const { _id, name, email } = updateUserLogged;

            return res.status(200).json({
                msg: 'Usuário atualizado com sucesso!',
                user: { _id, name, email },
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Ocorreu um erro interno.' });
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
                    return res.status(403).json({
                        errors: 'Você não é um administrador para poder apagar outro usuário.',
                    });
                }

                const getDataUser = await UserModel.findById(idUserDeleteByAdmin, {
                    password: 0,
                    __v: 0,
                });

                if (getDataUser !== null) {
                    await UserModel.deleteOne({ _id: getDataUser._id }).exec();

                    return res.status(200).json({ success: true });
                }

                return res.status(404).json({ errors: ['Usuário não encontrado.'] });
            }

            const userExists = await UserModel.findById(userLogged.id).exec();

            if (!userExists) {
                return res.status(404).json({ errors: ['Usuário não encontrado'] });
            }

            await UserModel.deleteOne({ _id: userExists._id }).exec();

            return res.status(200).json({ success: true });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Ocorreu um erro interno.' });
        }
    }
}

export { UserController };
