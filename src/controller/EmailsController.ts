import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { AluraEmailsModel } from '../model/AluraEmailsModel';

class EmailController {
    public async index(req: Request, res: Response) {
        try {
            const listarContas = await AluraEmailsModel.find({}, { senha_conta: 0, __v: 0 });
            return res.status(200).json(listarContas);
        } catch (e) {
            return res.json(null);
        }
    }

    public async update(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const contaAtualizada = await AluraEmailsModel.findByIdAndUpdate(id, req.body, {
                new: true,
            });

            if (!contaAtualizada) {
                return res.status(404).json({ errors: ['Conta não encontrada'] });
            }

            const { plataforma, email, senha, expiracao } = contaAtualizada;

            return res.status(200).json({
                msg: 'Conta atualizada com sucesso',
                conta_atualizada: { plataforma, email, senha, expiracao },
            });
        } catch (error) {
            if (error instanceof mongoose.Error.CastError && error.kind === 'ObjectId') {
                return res.status(400).json({ error: 'Este ID não existe.' });
            } else {
                return res.status(500).json({ error: 'Ocorreu um erro interno.' });
            }
        }
    }

    public async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const conta = await AluraEmailsModel.findById(id);

            if (!conta) {
                return res.status(404).json({ errors: ['Conta não encontrada'] });
            }

            await AluraEmailsModel.deleteOne({ _id: id });

            return res.status(200).json({
                msg: 'Conta deletada com sucesso',
                conta_deletada: conta.email,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Ocorreu um erro interno.' });
        }
    }
}

export { EmailController };
