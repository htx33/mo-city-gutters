const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Load environment variables directly from .env file
const envPath = path.join(__dirname, '..', '.env');
const envConfig = {};

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            envConfig[key.trim()] = valueParts.join('=').trim();
        }
    });
}

// Set environment variables
Object.assign(process.env, envConfig);

console.log('Loaded environment variables:', Object.keys(envConfig));

class GoogleSheetsService {
    constructor() {
        // Debug: Check environment variables
        console.log('Loading environment variables...');
        console.log('GOOGLE_SHEETS_CLIENT_EMAIL:', process.env.GOOGLE_SHEETS_CLIENT_EMAIL ? 'Set' : 'Not set');
        console.log('GOOGLE_SHEETS_PRIVATE_KEY:', process.env.GOOGLE_SHEETS_PRIVATE_KEY ? 'Set' : 'Not set');
        console.log('GOOGLE_SHEETS_SPREADSHEET_ID:', process.env.GOOGLE_SHEETS_SPREADSHEET_ID ? 'Set' : 'Not set');

        // Configure Google Sheets credentials
        // Check for required environment variables
        if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL) {
            throw new Error('GOOGLE_SHEETS_CLIENT_EMAIL is not set in environment variables');
        }
        if (!process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
            throw new Error('GOOGLE_SHEETS_PRIVATE_KEY is not set in environment variables');
        }
        if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
            throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID is not set in environment variables');
        }

        // Format private key - handle both \n and actual newlines
        const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY
            .replace(/\\n/g, '\n')  // Handle escaped newlines
            .replace(/"|'/g, '');    // Remove any quotes

        this.auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        this.sheets = google.sheets({ version: 'v4', auth: this.auth });
        this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    }

    async appendQuote(quote) {
        try {
            const date = new Date().toLocaleDateString();
            const time = new Date().toLocaleTimeString();

            // Format data for sheet
            const row = [
                date,                              // Date
                time,                              // Time
                quote.name,                        // Name
                quote.email,                       // Email
                quote.phone,                       // Phone
                quote.address,                     // Address
                quote.gutterType,                  // Gutter Type
                quote.homeLength.toString(),       // Linear Feet
                quote.stories.toString(),          // Stories
                quote.additionalServices.includes('gutterGuards') ? 'Yes' : 'No',    // Standard Guards
                quote.additionalServices.includes('premiumGutterGuards') ? 'Yes' : 'No', // Premium Guards
                quote.additionalServices.includes('cleaningService') ? 'Yes' : 'No',    // Cleaning Service
                quote.estimateAmount.toFixed(2)    // Total Amount
            ];

            // Append to sheet
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: 'Quotes!A:M', // Assumes sheet is named "Quotes"
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [row]
                }
            });

            console.log('Quote added to Google Sheets:', quote.name);
            return true;
        } catch (error) {
            console.error('Error adding quote to Google Sheets:', error);
            throw error;
        }
    }
}

module.exports = new GoogleSheetsService();
