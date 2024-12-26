import mongoose, { Schema } from 'mongoose';

const Notes = new Schema(
    {
        name: {
            type: String,
            required: [true, 'O nome é obrigatório'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
    },
    { timestamps: true },
);

const NotesModel = mongoose.model('notes', Notes);

export { NotesModel };
