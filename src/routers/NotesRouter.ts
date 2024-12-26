import { Router } from 'express';

import { NotesController } from '../controller/NotesController';
import AuthLoginRequired from '../middleware/AuthLoginRequired';

const notesRouter = Router();

const notesController = new NotesController();

notesRouter.post('/', AuthLoginRequired, (req, res) => notesController.store(req, res));
notesRouter.get('/', AuthLoginRequired, (req, res) => notesController.index(req, res));
notesRouter.put('/:id', AuthLoginRequired, (req, res) => notesController.update(req, res));
notesRouter.delete('/:id', AuthLoginRequired, (req, res) => notesController.delete(req, res));

export { notesRouter };
