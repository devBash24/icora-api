import { Request, Response, NextFunction } from 'express';

export const cacheControl = async(req: Request, res: Response, next: NextFunction) => {
    // Cache successful responses for 1 hour
    res.set('Cache-Control', 'public, max-age=3600');
    next();
}; 