import dotenv from 'dotenv';
import express, { Express } from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';

import { CorsConfig } from './config/cors/CorsConfig';
import { databaseConfig } from './config/db/database';
import { Routers } from './routers';

dotenv.config();

// if (!process.env.FRONT_END) {
//     throw new Error('FRONT END URL NOT CONFIGURED IN .ENV PLEASE INSERT THE URL IN .ENV');
// }

const whitelistUrlPermitted: string[] = [
    process.env.FRONT_END as string,
    process.env.APPLICATIVO as string,
];

export class App {
    public app: Express;
    private corsConfig: CorsConfig;

    public constructor(private readonly router = new Routers()) {
        this.corsConfig = new CorsConfig(whitelistUrlPermitted);
        this.connectionDatabase();
        this.app = express();
        this.middlewares();
    }

    private middlewares(): void {
        this.app.use(this.corsConfig.getCorsMiddleware());
        this.app.use(morgan('dev'));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
        this.app.use(this.router.getRouter());
    }

    private async connectionDatabase(): Promise<void> {
        try {
            await mongoose.connect(databaseConfig.url);
            console.log('[server]: Conexão feita com sucesso');
        } catch (err) {
            console.error('[server]: Erro ao conectar com o banco', err);
        }
    }

    public server(port: number): void {
        this.app.listen(port, () => {
            console.log(
                '\x1b[42m\x1b[30m%s\x1b[0m',
                `[server]: Server is running in http://localhost:${port}/api/v1`,
            );
        });
    }
}
