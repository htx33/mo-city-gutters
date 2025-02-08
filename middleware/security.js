const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const { validationResult } = require('express-validator');
const config = require('../config/security');

// Custom error handler for validation
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            status: 'error',
            message: 'Invalid input data',
            errors: errors.array()
        });
    }
    next();
};

// Custom security middleware
const securityMiddleware = {
    // Rate limiters
    generalLimiter: rateLimit(config.rateLimiting.general),
    apiLimiter: rateLimit(config.rateLimiting.api),
    loginLimiter: rateLimit(config.rateLimiting.login),

    // Helmet configuration
    helmetConfig: helmet({
        contentSecurityPolicy: config.securityHeaders.contentSecurityPolicy,
        crossOriginEmbedderPolicy: { policy: "credentialless" },
        crossOriginOpenerPolicy: { policy: "same-origin" },
        crossOriginResourcePolicy: { policy: "same-site" },
        dnsPrefetchControl: { allow: false },
        frameguard: { action: "deny" },
        hsts: config.securityHeaders.strictTransportSecurity,
        ieNoOpen: true,
        noSniff: true,
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
        xssFilter: true
    }),

    // Input sanitization
    sanitizeData: [
        mongoSanitize(),
        xss(),
        hpp()
    ],

    // Request validation
    validateContactForm: (req, res, next) => {
        const { name, email, phone, message } = req.body;
        const rules = config.validationRules.contact;
        
        // Validate name
        if (!name || !rules.name.pattern.test(name) || 
            name.length < rules.name.min || name.length > rules.name.max) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid name format'
            });
        }

        // Validate email
        if (!email || !rules.email.pattern.test(email) || 
            email.length > rules.email.max) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid email format'
            });
        }

        // Validate phone (optional)
        if (phone && !rules.phone.pattern.test(phone)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid phone number format'
            });
        }

        // Validate message
        if (!message || message.length < rules.message.min || 
            message.length > rules.message.max) {
            return res.status(400).json({
                status: 'error',
                message: 'Message must be between 10 and 1000 characters'
            });
        }

        next();
    },

    // Error handler
    errorHandler: (err, req, res, next) => {
        console.error(err.stack);
        res.status(err.status || 500).json({
            status: 'error',
            message: process.env.NODE_ENV === 'development' 
                ? err.message 
                : 'Something went wrong!'
        });
    }
};

module.exports = securityMiddleware;
