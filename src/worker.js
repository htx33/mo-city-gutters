async function getAccessToken(clientEmail, privateKey) {
  // Create JWT header
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  // Create JWT claim set
  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  // Base64url encode header and claim set
  const base64Header = btoa(JSON.stringify(header))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  const base64ClaimSet = btoa(JSON.stringify(claimSet))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // Create signature input
  const signatureInput = `${base64Header}.${base64ClaimSet}`;

  // Prepare private key
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';
  const pemContents = privateKey
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\s/g, '');

  // Convert PEM to binary
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  // Import key
  const key = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    },
    false,
    ['sign']
  );

  // Sign the input
  const encoder = new TextEncoder();
  const signatureBytes = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    encoder.encode(signatureInput)
  );

  // Base64url encode the signature
  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // Create JWT
  const jwt = `${signatureInput}.${signature}`;

  // Exchange JWT for access token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = await response.json();
  return data.access_token;
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
