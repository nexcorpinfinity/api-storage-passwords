import CryptoJS from 'crypto-js';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { PasswdModel } from '../model/PasswdModel';
// poder compartilhar com outra pessoa
class PasswdController {
    private readonly secretKey: string | undefined = process.env.CRYPTOHASHPASSWORDS;

    public async store(req: Request, res: Response) {
        try {
            if (!req.body) {
                res.json('Preencha o nome e passwd');
            }

            const { name, password } = req.body;

            const idUser = res.locals.user.id;

            if (await PasswdModel.findOne({ name: name, user_id: idUser })) {
                return res.status(400).json({ error: 'Este nome já existe' });
            }

            const encrypts = CryptoJS.AES.encrypt(password, String(this.secretKey)).toString();

            const createNewPass = new PasswdModel({
                name: name,
                password: encrypts,
                user_id: idUser,
            });

            await createNewPass.validate();

            const created = await createNewPass.save();

            return res.status(201).json(created);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ errors: ['Erro Interno store'] });
        }
    }

    public async index(req: Request, res: Response): Promise<Response> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filter: any = {};

            if (typeof req.query.id === 'string') {
                filter._id = new mongoose.Types.ObjectId(req.query.id);
            }

            const listPasswords = await PasswdModel.find(
                { ...filter, user_id: res.locals.user.id },
                { __v: 0 },
            ).exec();
            listPasswords.map((psswd) => {
                const decrypt = CryptoJS.AES.decrypt(psswd.password, String(this.secretKey));

                psswd.password = decrypt.toString(CryptoJS.enc.Utf8);
            });

            return res.status(200).json(listPasswords);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ errors: ['Erro Interno index'] });
        }
    }

    public async update(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const encryptPassword = CryptoJS.AES.encrypt(
                req.body.password,
                String(this.secretKey),
            ).toString();

            const obj = {
                name: req.body.name,
                password: encryptPassword,
            };

            const idUser = res.locals.user.id;

            const verify = await PasswdModel.findOne({ _id: id, user_id: idUser }).exec();

            if (!verify) {
                return res.status(404).json({ errors: ['Password não encontrada'] });
            }

            const passwd = await PasswdModel.findByIdAndUpdate(id, obj, {
                new: true,
            }).exec();

            if (!passwd) {
                return res.status(404).json({ errors: ['Password não encontrada'] });
            }

            return res.status(200).json(passwd);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ errors: ['Erro Interno update'] });
        }
    }

    public async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const idUser = res.locals.user.id;

            const verifyExists = await PasswdModel.findOne({ _id: id, user_id: idUser }).exec();
            console.log(verifyExists);
            if (!verifyExists) {
                return res.status(404).json({ errors: ['Password não encontrada'] });
            }

            await PasswdModel.deleteOne({ _id: id }).exec();

            return res.status(200).json({ success: true });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ errors: ['Erro Interno delete'] });
        }
    }
}

export { PasswdController };
