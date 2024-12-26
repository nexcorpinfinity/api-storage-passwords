import { Request, Response } from 'express';

import { NotesModel } from '../model/NotesModel';

class NotesController {
    public async store(req: Request, res: Response) {
        try {
            const { name, description } = req.body;

            if (!name) {
                return res.status(400).json({ error: 'Nome é obrigatorio' });
            }

            const findName = await NotesModel.findOne({
                name: name,
            });

            if (findName) {
                return res.status(400).json({ message: 'Esse nome já existe' });
            }

            const notes = await NotesModel.create({
                name,
                description,
                user_id: res.locals.user.id,
            });

            res.status(201).json({ success: true, notes });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error store' });
        }
    }

    public async index(req: Request, res: Response) {
        try {
            const { id } = req.query;

            if (id) {
                const notes = await NotesModel.findOne({
                    _id: String(id),
                    user_id: res.locals.user.id,
                });

                return res.status(200).json({ success: true, notes });
            }

            const notes = await NotesModel.find({ user_id: res.locals.user.id });

            res.status(200).json({ success: true, notes });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error index' });
        }
    }

    public async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, description } = req.body;

            const note = await NotesModel.findOne({
                _id: String(id),
                user_id: res.locals.user.id,
            });

            const verifyName = await NotesModel.findOne({
                name: name,
                user_id: res.locals.user.id,
            });

            if (verifyName) {
                return res.status(400).json({ message: 'Já possui uma nota com esse nome' });
            }

            if (!note) {
                res.status(404).json({ message: 'Nota não encontrada' });
                return;
            }

            if (name !== undefined) {
                note.name = name;
            }
            if (description !== undefined) {
                note.description = description;
            }

            await note.save();

            res.status(200).json({ success: true, note });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro interno ao atualizar a nota' });
        }
    }

    public async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const note = await NotesModel.findOne({
                _id: id,
                user_id: res.locals.user.id,
            });

            if (!note) {
                res.status(404).json({ message: 'Nota não encontrada' });
                return;
            }

            await note.deleteOne();

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro interno ao atualizar a nota' });
        }
    }
}

export { NotesController };
