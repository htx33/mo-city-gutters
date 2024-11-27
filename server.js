require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const session = require('express-session');
const csrf = require('csurf');
const winston = require('winston');
const https = require('https');
const fs = require('fs');

const securityConfig = require('./config/security');
const securityMiddleware = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Logger configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (!isProduction) {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Apply security middleware
app.use(securityMiddleware.helmetConfig);
app.use(securityMiddleware.generalLimiter);
app.use('/api', securityMiddleware.apiLimiter);
app.use('/api/contact', securityMiddleware.loginLimiter);

// CORS configuration
app.use(cors(isProduction ? securityConfig.corsConfig.production : securityConfig.corsConfig.development));

// Session configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET || securityConfig.generateSessionSecret(),
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
    cookie: isProduction ? securityConfig.cookieConfig.production : securityConfig.cookieConfig.development
};

if (isProduction) {
    app.set('trust proxy', 1);
    sessionConfig.cookie.secure = true;
}

app.use(session(sessionConfig));

// CSRF protection
app.use(csrf());

// Compression
app.use(compression());

// Body parser with size limits and sanitization
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(securityMiddleware.sanitizeData);

// Serve static files
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    etag: true,
    lastModified: true
}));

// CSRF token middleware
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Contact form endpoint with validation
app.post('/api/contact', 
    securityMiddleware.validateContactForm,
    async (req, res) => {
        try {
            // Contact form logic here
            res.status(200).json({
                status: 'success',
                message: 'Message sent successfully'
            });
        } catch (error) {
            logger.error('Contact form error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to send message'
            });
        }
    }
);

// Error handling
app.use(securityMiddleware.errorHandler);

// Start server
if (isProduction && securityConfig.sslConfig.production.enabled) {
    // HTTPS server for production
    const httpsOptions = {
        key: fs.readFileSync(path.join(__dirname, 'ssl', 'private.key')),
        cert: fs.readFileSync(path.join(__dirname, 'ssl', 'certificate.crt')),
        ...securityConfig.sslConfig.production.options
    };

    https.createServer(httpsOptions, app).listen(PORT, () => {
        logger.info(`HTTPS Server running on port ${PORT}`);
    });

    // Redirect HTTP to HTTPS
    const http = require('http');
    http.createServer((req, res) => {
        res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
        res.end();
    }).listen(80);
} else {
    // HTTP server for development
    app.listen(PORT, () => {
        logger.info(`HTTP Server running on port ${PORT}`);
    });
}

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received. Closing HTTP server...');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});
