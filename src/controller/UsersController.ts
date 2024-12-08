import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { Permissions } from '../enums/Permissions';
import { UserModel } from '../model/UserModel';

interface MongoError extends Error {
    code?: number;
    kind?: string;
}

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
            return res.status(400).json(error);
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

                const verifyExistsUser = await UserModel.findById(idUserByUpdate, {
                    password: 0,
                    __v: 0,
                });

                if (verifyExistsUser !== null) {
                    const updatedDataUser = await UserModel.findByIdAndUpdate(
                        verifyExistsUser._id,
                        req.body,
                        {
                            new: true,
                        },
                    ).exec();

                    return updatedDataUser;
                }
            }

            const atualizarUsuario = await UserModel.findByIdAndUpdate(12, req.body, {
                new: true,
            }).exec();

            if (!atualizarUsuario) {
                return res.status(404).json({ errors: ['Conta não encontrada'] });
            }

            // const { _id, email } = atualizarUsuario;

            return res.status(200).json({
                msg: 'Usuário atualizado com sucesso!',
                usuario_atualizado: 1123,
            });
        } catch (error) {
            const mongoError = error as MongoError;
            console.log(mongoError);
            if (mongoError instanceof mongoose.Error.CastError && mongoError.kind === 'ObjectId') {
                return res.status(400).json({ error: 'Este ID não existe.' });
            } else {
                return res.status(500).json({ error: 'Ocorreu um erro interno.' });
            }
        }
    }

    //     public async delete(req: Request, res: Response): Promise<Response> {
    //         try {
    //             if (!) {
    //                 return res.status(400).json({ errors: ['ID não informado'] });
    //             }

    //             const user = await UserModel.findById(req.userId).exec();

    //             if (!user) {
    //                 return res.status(404).json({ errors: ['Usuário não encontrado'] });
    //             }

    //             await UserModel.deleteOne({ _id: req.userId }).exec();

    //             return res.status(200).json({
    //                 msg: 'Usuário deletado com sucesso',
    //                 usuario_deletado: user.email,
    //             });
    //         } catch (error) {
    //             const mongoError = error as MongoError;
    //             console.log(mongoError);
    //             if (mongoError instanceof mongoose.Error.CastError && mongoError.kind === 'ObjectId') {
    //                 return res.status(400).json({ error: 'Este ID não existe.' });
    //             } else {
    //                 return res.status(500).json({ error: 'Ocorreu um erro interno.' });
    //             }
    //         }
    //     }
    // }

    public async updateUser(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            const atualizarUsuario = await UserModel.findByIdAndUpdate(id, req, {
                new: true,
            }).exec();

            if (!atualizarUsuario) {
                return res.status(404).json({ errors: ['Conta não encontrada'] });
            }

            return res.status(200).json({
                msg: 'Usuário atualizado com sucesso!',
                usuario_atualizado: 'asd',
            });
        } catch (error) {
            const mongoError = error as MongoError;
            // console.log(mongoError);
            if (mongoError instanceof mongoose.Error.CastError && mongoError.kind === 'ObjectId') {
                return res.status(400).json({ error: 'Este ID não existe.' });
            } else {
                return res.status(500).json({ error: 'Ocorreu um erro interno.' });
            }
        }
    }

    public async deleteUser(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            console.log(id);

            if (!id) {
                return res.status(400).json({ errors: ['ID não informado'] });
            }

            const user = await UserModel.findById(id).exec();

            if (!user) {
                return res.status(404).json({ errors: ['Usuário não encontrado'] });
            }

            await UserModel.deleteOne({ _id: user }).exec();

            return res.status(200).json({
                msg: 'Usuário deletado com sucesso',
                usuario_deletado: user.email,
            });
        } catch (error) {
            const mongoError = error as MongoError;
            console.log(mongoError);
            if (mongoError instanceof mongoose.Error.CastError && mongoError.kind === 'ObjectId') {
                return res.status(400).json({ error: 'Este ID não existe.' });
            } else {
                return res.status(500).json({ error: 'Ocorreu um erro interno.' });
            }
        }
    }
}
export { UserController };
