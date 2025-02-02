import { Request, Response, NextFunction } from 'express';

export const validateIconRequest = (req: Request, res: Response, next: NextFunction): void => {
    const { library, name } = req.query;
    
    if (!library || typeof library !== 'string') {
        res.status(400).json({
            success: false,
            error: 'library parameter is required and must be a string'
        });
        return;
    }

    if (!name || typeof name !== 'string') {
        res.status(400).json({
            success: false,
            error: 'Name parameter is required and must be a string'
        });
        return;
    }

    // Sanitize inputs
    req.query.library = library.trim().toLowerCase();
    req.query.name = name.trim()

    next();
}; 