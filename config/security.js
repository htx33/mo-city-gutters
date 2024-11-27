const crypto = require('crypto');

// Generate secure session secret if not provided
const generateSessionSecret = () => {
    return crypto.randomBytes(32).toString('hex');
};

// SSL Configuration for production
const sslConfig = {
    production: {
        enabled: true,
        options: {
            minVersion: 'TLSv1.2',
            cipherSuites: [
                'ECDHE-ECDSA-AES128-GCM-SHA256',
                'ECDHE-RSA-AES128-GCM-SHA256',
                'ECDHE-ECDSA-AES256-GCM-SHA384',
                'ECDHE-RSA-AES256-GCM-SHA384'
            ],
            honorCipherOrder: true,
            ecdhCurve: 'secp384r1'
        }
    }
};

// Security Headers Configuration
const securityHeaders = {
    strictTransportSecurity: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                'https://www.google.com',
                'https://www.gstatic.com',
                'https://cdnjs.cloudflare.com',
                'https://www.google-analytics.com'
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                'https://fonts.googleapis.com',
                'https://cdnjs.cloudflare.com'
            ],
            fontSrc: [
                "'self'",
                'https://fonts.gstatic.com',
                'https://cdnjs.cloudflare.com'
            ],
            imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
            connectSrc: [
                "'self'",
                'https://maps.googleapis.com',
                'https://www.google-analytics.com'
            ],
            frameSrc: ["'self'", 'https://www.google.com'],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            workerSrc: ["'self'", 'blob:'],
            childSrc: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: [],
            blockAllMixedContent: []
        }
    }
};

// Rate Limiting Configuration
const rateLimiting = {
    general: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    api: {
        windowMs: 15 * 60 * 1000,
        max: 50,
        standardHeaders: true,
        legacyHeaders: false,
        message: 'Too many API requests from this IP, please try again later.'
    },
    login: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5, // 5 attempts per hour
        message: 'Too many login attempts, please try again later.'
    }
};

// Cookie Security Configuration
const cookieConfig = {
    production: {
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
        domain: '.mocitygutters.com'
    },
    development: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
    }
};

// CORS Configuration
const corsConfig = {
    production: {
        origin: 'https://mocitygutters.com',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
        credentials: true,
        maxAge: 600 // 10 minutes
    },
    development: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
        credentials: true,
        maxAge: 600
    }
};

// Sanitization and Validation Rules
const validationRules = {
    contact: {
        name: {
            min: 2,
            max: 50,
            pattern: /^[a-zA-Z\s'-]+$/
        },
        email: {
            max: 100,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        phone: {
            pattern: /^\+?1?\d{9,15}$/
        },
        message: {
            min: 10,
            max: 1000
        }
    }
};

module.exports = {
    generateSessionSecret,
    sslConfig,
    securityHeaders,
    rateLimiting,
    cookieConfig,
    corsConfig,
    validationRules
};
