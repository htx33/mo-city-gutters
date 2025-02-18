import { google } from 'googleapis';

export async function onRequestPost(context) {
  try {
    // Parse request body
    const request = await context.request.json();
    
    // Configure Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: context.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: context.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Format data for sheet
    const row = [
      new Date().toLocaleDateString(),    // Date
      new Date().toLocaleTimeString(),    // Time
      request.name,                       // Name
      request.email,                      // Email
      request.phone,                      // Phone
      request.address,                    // Address
      request.gutterType,                 // Gutter Type
      request.homeLength.toString(),      // Linear Feet
      request.stories.toString(),         // Stories
      request.additionalServices.includes('gutterGuards') ? 'Yes' : 'No',     // Standard Guards
      request.additionalServices.includes('premiumGutterGuards') ? 'Yes' : 'No',  // Premium Guards
      request.additionalServices.includes('cleaningService') ? 'Yes' : 'No',     // Cleaning Service
      request.estimateAmount.toFixed(2)   // Total Amount
    ];

    // Append to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: context.env.GOOGLE_SHEETS_SPREADSHEET_ID,
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
}

// Handle CORS preflight requests
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
