export default {
  async fetch(request, env) {
    try {
      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      }

      // Only handle POST requests to /api/estimate
      if (request.method !== 'POST' || !request.url.endsWith('/api/estimate')) {
        return new Response('Not found', { status: 404 });
      }

      // Parse request body
      const data = await request.json();
      
      // Format data for sheet
      const row = [
        new Date().toLocaleDateString(),    // Date
        new Date().toLocaleTimeString(),    // Time
        data.name,                          // Name
        data.email,                         // Email
        data.phone,                         // Phone
        data.address,                       // Address
        data.gutterType,                    // Gutter Type
        data.homeLength.toString(),         // Linear Feet
        data.stories.toString(),            // Stories
        data.additionalServices.includes('gutterGuards') ? 'Yes' : 'No',     // Standard Guards
        data.additionalServices.includes('premiumGutterGuards') ? 'Yes' : 'No',  // Premium Guards
        data.additionalServices.includes('cleaningService') ? 'Yes' : 'No',     // Cleaning Service
        data.estimateAmount.toFixed(2)      // Total Amount
      ];

      // Initialize Google Sheets API
      const auth = new GoogleAuth({
        credentials: {
          client_email: env.GOOGLE_SHEETS_CLIENT_EMAIL,
          private_key: env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });
      
      // Append to sheet
      await sheets.spreadsheets.values.append({
        spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: 'Quotes!A:M',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [row]
        }
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
