import mongoose, { Schema } from 'mongoose';

const Passwd = new Schema(
    {
        name: {
            type: String,
            default: '',
            required: [true, 'O nome é obrigatorio'],
            validate: {
                validator: function (v: string) {
                    return v.length >= 3 && v.length <= 255;
                },
                message: 'Campo dono conta tem que ter entre 3 a 255 caracteres',
            },
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
