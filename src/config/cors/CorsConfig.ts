import cors, { CorsOptions } from 'cors';
import { Request, Response, NextFunction } from 'express';

export class CorsConfig {
    private whitelist: string[];

    public constructor(whitelist: string[]) {
        this.whitelist = whitelist;
    }

    public getCorsMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
        const corsOptions: CorsOptions = {
            origin: (origin, callback) => this.checkOrigin(origin, callback),
            credentials: true,
        };

        return cors(corsOptions);
    }

    private checkOrigin(
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void,
    ): void {
        if (!origin || this.whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS Error: Origin not allowed'));
        }
    }
}
