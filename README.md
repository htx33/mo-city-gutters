# Mo City Gutters Website

Professional website for Mo City Gutters, featuring seamless gutters and home remodeling services.

## Setup Instructions

1. Install Node.js and npm:
   - Download Node.js from https://nodejs.org/
   - Choose the LTS version
   - Run the installer
   - Restart your computer

2. Install Dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   - Copy `.env.example` to `.env`
   - Update the following values in `.env`:
     * EMAIL_USER: Your Gmail address
     * EMAIL_PASS: Your Gmail app-specific password
     * RECAPTCHA_SITE_KEY: Your reCAPTCHA site key
     * RECAPTCHA_SECRET_KEY: Your reCAPTCHA secret key

4. Set up Gmail for Contact Form:
   1. Go to Google Account settings
   2. Enable 2-Step Verification
   3. Generate App Password:
      - Go to Security > App passwords
      - Select "Mail" and your device
      - Copy the generated password
      - Paste it as EMAIL_PASS in .env

5. Set up reCAPTCHA:
   1. Visit https://www.google.com/recaptcha/admin
   2. Sign in with your Google account
   3. Register a new site:
      - Label: "Mo City Gutters"
      - Type: reCAPTCHA v2
      - Domains: Add your domain
   4. Copy Site Key and Secret Key to .env

6. Start the Server:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## Security Features

- HTTPS enforcement
- Helmet security headers
- CSRF protection
- Rate limiting
- Input validation
- XSS protection
- CORS configuration
- reCAPTCHA integration
- Form validation
- Email notifications

## Directory Structure

```
mo-city-gutters/
├── public/           # Static files
│   ├── images/       # Image assets
│   ├── styles/       # CSS files
│   ├── scripts/      # JavaScript files
│   └── index.html    # Main HTML file
├── utils/            # Utility functions
├── logs/             # Application logs
├── .env              # Environment variables
├── server.js         # Express server
└── package.json      # Dependencies
```

## Development

- Node.js backend with Express
- Vanilla JavaScript frontend
- Responsive design
- Mobile-first approach
- Faith-driven business focus

## Production Deployment

1. Set NODE_ENV=production in .env
2. Update PRODUCTION_DOMAIN in .env
3. Install SSL certificate
4. Configure domain DNS
5. Set up reverse proxy (nginx recommended)
6. Deploy using PM2 or similar process manager

## Support

For technical support, contact the development team at [contact email].
