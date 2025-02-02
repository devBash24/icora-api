import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 1000 , // Limit each IP to 100 requests per windowMs
    message: {
        success: false,

        error: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers

});


// More strict limiter for sensitive routes
export const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, 
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again after an hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
}); 