import { Request, Response } from 'express';

import { ResponseHTTP } from '../helpers/ResponseHTTP';
import { AluraEmailsModel } from '../model/AluraEmailsModel';

class EmailController {
    public async index(req: Request, res: Response) {
        try {
            const listarContas = await AluraEmailsModel.find({}, { __v: 0 });
            return ResponseHTTP.success(res, 200, 'Sucesso ao listar contas', [
                { emails: listarContas },
            ]);
        } catch (e) {
            return ResponseHTTP.error(res, 400, 'Não possui nenhum Email', [{ emails: null }]);
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
