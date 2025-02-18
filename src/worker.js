async function getAccessToken(clientEmail, privateKey) {
  const jwtHeader = btoa(JSON.stringify({
    alg: 'RS256',
    typ: 'JWT'
  }));

  const now = Math.floor(Date.now() / 1000);
  const oneHour = 60 * 60;
  const jwtClaimSet = btoa(JSON.stringify({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + oneHour,
    iat: now
  }));

  const signatureInput = `${jwtHeader}.${jwtClaimSet}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(signatureInput);

  const privateKeyBinary = atob(privateKey.replace(/-----BEGIN PRIVATE KEY-----\n/, '').replace(/\n-----END PRIVATE KEY-----\n?/, ''));
  const binaryKey = Uint8Array.from(privateKeyBinary, c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    data
  );

  const jwt = `${signatureInput}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

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

      console.log('Environment variables:', {
        clientEmail: env.GOOGLE_SHEETS_CLIENT_EMAIL,
        spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
        // Don't log the full private key
        hasPrivateKey: !!env.GOOGLE_SHEETS_PRIVATE_KEY
      });

      // Get access token
      console.log('Getting access token...');
      const accessToken = await getAccessToken(
        env.GOOGLE_SHEETS_CLIENT_EMAIL,
        env.GOOGLE_SHEETS_PRIVATE_KEY
      );
      console.log('Got access token:', accessToken ? 'yes' : 'no');

      console.log('Appending to sheet...');
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEETS_SPREADSHEET_ID}/values/Quotes!A:M:append?valueInputOption=USER_ENTERED`;
      console.log('API URL:', url);

      // Append to sheet using Sheets API directly
      const appendResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [row]
        })
      });

      const responseText = await appendResponse.text();
      console.log('Append response:', {
        status: appendResponse.status,
        ok: appendResponse.ok,
        text: responseText
      });

      if (!appendResponse.ok) {
        throw new Error(`Failed to append to sheet: ${responseText}`);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      console.error('Error:', {
        message: error.message,
        stack: error.stack
      });
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
