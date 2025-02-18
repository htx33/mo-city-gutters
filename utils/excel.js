const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

class ExcelService {
    constructor() {
        this.filePath = path.join(__dirname, '..', 'data', 'quotes.xlsx');
        this.sheetName = 'Quotes';
        
        // Create data directory if it doesn't exist
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }
        
        // Create or load workbook
        this.workbook = this.loadOrCreateWorkbook();
    }

    loadOrCreateWorkbook() {
        if (fs.existsSync(this.filePath)) {
            return XLSX.readFile(this.filePath);
        } else {
            // Create new workbook with headers
            const workbook = XLSX.utils.book_new();
            const headers = [
                'Date',
                'Time',
                'Name',
                'Email',
                'Phone',
                'Address',
                'Gutter Type',
                'Linear Feet',
                'Stories',
                'Standard Guards',
                'Premium Guards',
                'Cleaning Service',
                'Total Amount'
            ];
            const worksheet = XLSX.utils.aoa_to_sheet([headers]);
            XLSX.utils.book_append_sheet(workbook, worksheet, this.sheetName);
            return workbook;
        }
    }

    async appendQuote(quote) {
        try {
            const date = new Date().toLocaleDateString();
            const time = new Date().toLocaleTimeString();

            // Format data for Excel
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

            // Get the worksheet
            const worksheet = this.workbook.Sheets[this.sheetName];
            
            // Find the next empty row
            const range = XLSX.utils.decode_range(worksheet['!ref']);
            const nextRow = range.e.r + 1;
            
            // Add the new row
            XLSX.utils.sheet_add_aoa(worksheet, [row], { origin: nextRow });
            
            // Auto-size columns
            const maxWidth = 50;
            const columnsWidth = row.map(cell => {
                const width = cell ? cell.toString().length : 10;
                return width > maxWidth ? maxWidth : width;
            });
            worksheet['!cols'] = columnsWidth.map(width => ({ width }));

            // Save the workbook
            XLSX.writeFile(this.workbook, this.filePath);

            console.log('Quote added to Excel:', quote.name);
            return true;
        } catch (error) {
            console.error('Error adding quote to Excel:', error);
            throw error;
        }
    }
}

module.exports = new ExcelService();
