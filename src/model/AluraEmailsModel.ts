import mongoose from 'mongoose';

const AluraEmailsSchema = new mongoose.Schema({
    plataforma: {
        type: String,
        default: '',
        trim: true,
    },
    email: {
        type: String,
        default: '',
        required: [true, 'Campo e-mail é obrigatorio'],
        unique: true,
    },
    senha: {
        type: String,
        default: '',
        required: [true, 'Campo senha é obrigatorio'],
        trim: true,
    },
    expiracao: {
        type: String,
        default: '',
        required: [true, 'Campo expiração é obrigatorio'],
        trim: true,
    },
});

const AluraEmailsModel = mongoose.model('emails', AluraEmailsSchema);

export { AluraEmailsModel };
