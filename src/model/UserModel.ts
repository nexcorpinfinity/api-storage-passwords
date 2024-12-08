import mongoose, { Schema } from 'mongoose';

import { Permissions } from '../enums/Permissions';

const UserSchema = new Schema(
    {
        name: {
            type: String,
            default: '',
            required: [true, 'Campo nome é obrigatório'],
            validate: {
                validator: function (v: string) {
                    return v.length >= 3 && v.length <= 255;
                },
                message: 'Campo nome precisa ter entre 3 a 255 caracteres',
            },
            trim: true,
        },
        email: {
            type: String,
            default: '',
            required: [true, 'Campo e-mail é obrigatório'],
            unique: true,
            validate: {
                validator: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
                message: 'Email inválido',
            },
        },
        permission: {
            type: String,
            default: Permissions.User,
            enum: {
                values: [Permissions.Admin, Permissions.User],
                message: 'Permissão inválida',
            },
        },
        password: {
            type: String,
            required: [true, 'Campo senha é obrigatório'],
        },
    },
    { timestamps: true },
);

const UserModel = mongoose.model('users', UserSchema);

export { UserModel };
