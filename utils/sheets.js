const { google } = require('googleapis');
require('dotenv').config();

class GoogleSheetsService {
    constructor() {
        // Configure Google Sheets credentials
        this.auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
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
