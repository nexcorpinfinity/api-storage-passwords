import mongoose, { Schema } from 'mongoose';

const Passwd = new Schema(
    {
        name: {
            type: String,
            required: [true, 'O nome é obrigatorio'],
            trim: true,
        },
        login_email: {
            type: String,
            trim: true,
        },
        password: {
            type: String,
            default: '',
            required: [true, 'O passwd é obrigatorio'],
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

const PasswdModel = mongoose.model('passwds', Passwd);

export { PasswdModel };
