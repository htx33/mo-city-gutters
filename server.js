require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const winston = require('winston');
const mongoose = require('mongoose');

const securityConfig = require('./config/security');
const securityMiddleware = require('./middleware/security');
const apiRoutes = require('./routes/api');
const estimatesRoutes = require('./routes/estimates');
const quotesRoutes = require('./routes/quotes');

const app = express();
const PORT = process.env.NODE_ENV === 'production' ? (process.env.PORT || 443) : 3000;
const isProduction = process.env.NODE_ENV === 'production';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mo-city-gutters';

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

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        logger.info('Connected to MongoDB successfully');
    })
    .catch((err) => {
        logger.error('MongoDB connection error:', err);
    });

// Basic middleware
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET));

// CORS configuration
app.use(cors({
    origin: isProduction ? process.env.PRODUCTION_DOMAIN : 'http://localhost:3000',
    credentials: true
}));

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

// Security middleware
app.use(securityMiddleware.helmetConfig);
app.use(securityMiddleware.sanitizeData);
app.use(securityMiddleware.generalLimiter);
app.use('/api', securityMiddleware.apiLimiter);
app.use('/api/contact', securityMiddleware.loginLimiter);

// Serve static files
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    etag: true,
    lastModified: true
}));

// Initialize CSRF protection
const csrfProtection = csrf({
    cookie: {
        key: '_csrf',
        path: '/',
        httpOnly: true,
        secure: isProduction,
        sameSite: 'Lax'
    }
});

// CSRF Token endpoint (no CSRF protection here)
app.get('/api/csrf-token', (req, res) => {
    csrfProtection(req, res, () => {
        res.json({ csrfToken: req.csrfToken() });
    });
});

// Apply CSRF protection to API routes except the token endpoint
app.use('/api', (req, res, next) => {
    if (req.path === '/csrf-token') {
        return next();
    }
    csrfProtection(req, res, next);
});

// API Routes
app.use('/api', apiRoutes);
app.use('/api/estimates', estimatesRoutes);
app.use('/api/quotes', quotesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        logger.error('CSRF token validation failed');
        return res.status(403).json({
            message: 'Form has expired. Please refresh the page.',
            error: err.message
        });
    }
    logger.error('Server error:', err);
    res.status(500).json({
        message: 'Something went wrong!',
        error: isProduction ? null : err.message
    });
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
    const https = require('https');
    const fs = require('fs');
    const privateKey = fs.readFileSync(path.join(__dirname, 'ssl', 'private.key'), 'utf8');
    const certificate = fs.readFileSync(path.join(__dirname, 'ssl', 'certificate.crt'), 'utf8');
    const credentials = { key: privateKey, cert: certificate };
    
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(PORT, () => {
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
