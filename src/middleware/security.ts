import helmet from 'helmet';
import cors from 'cors';

export const securityMiddleware = [
    helmet(), // Adds various HTTP headers for security
    cors({
        // origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        origin: '*',
        methods: ['GET'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }),
]; 