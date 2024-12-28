/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';

class ResponseHTTP {
    public static success(res: Response, statusCode: number, message: string, data: any) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }

    public static error(res: Response, statusCode: number, message: string, data: any) {
        return res.status(statusCode).json({
            success: false,
            message,
            data,
        });
    }
}

export { ResponseHTTP };
