import { Request, Response } from 'express';

import { ResponseHTTP } from '../helpers/ResponseHTTP';
import { NotesModel } from '../model/NotesModel';

class NotesController {
    public async store(req: Request, res: Response) {
        try {
            const { name, description } = req.body;
            console.log(123);
            if (!name) {
                return ResponseHTTP.error(res, 400, 'Nome é obrigatorio', []);
            }

            const findName = await NotesModel.findOne({
                name: name,
            });

            if (findName) {
                return ResponseHTTP.error(res, 400, 'Esse nome já existe', []);
            }

            const notes = await NotesModel.create({
                name,
                description,
                user_id: res.locals.user.id,
            });

            return ResponseHTTP.success(res, 201, 'Sucesso ao criar uma nota.', [{ notes: notes }]);
        } catch (error) {
            return ResponseHTTP.error(res, 500, 'Internal server error store', []);
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

                return ResponseHTTP.success(res, 200, 'Sucesso ao trazer a nota.', [
                    { notes: notes },
                ]);
            }

            const notes = await NotesModel.find({ user_id: res.locals.user.id });

            return ResponseHTTP.success(res, 200, 'Sucesso ao trazer todas as nota.', [
                { notes: notes },
            ]);
        } catch (error) {
            return ResponseHTTP.error(res, 500, 'Internal server error index', []);
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
                return ResponseHTTP.error(res, 400, 'Já possui uma nota com esse nome', []);
            }

            if (!note) {
                return ResponseHTTP.error(res, 404, 'Nota não encontrada', []);
            }

            if (name !== undefined) {
                note.name = name;
            }
            if (description !== undefined) {
                note.description = description;
            }

            await note.save();

            return ResponseHTTP.success(res, 200, 'Sucesso ao atualizar a nota.', [
                { notes: note },
            ]);
        } catch (error) {
            console.error(error);
            return ResponseHTTP.error(res, 500, 'Internal server error update', []);
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
                return ResponseHTTP.error(res, 404, 'Nota não encontrada', []);
            }

            await note.deleteOne();

            return ResponseHTTP.success(res, 200, 'Sucesso ao deletar a nota.', []);
        } catch (error) {
            return ResponseHTTP.error(res, 500, 'Internal server error delete', []);
        }
    }
}

export { NotesController };
