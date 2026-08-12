function pemToBinary(privateKey) {
  const normalized = (privateKey || '').replace(/\\n/g, '\n');
  const match = normalized.match(/-----BEGIN [^-]+-----([\s\S]*?)-----END [^-]+-----/);
  const body = (match ? match[1] : normalized).replace(/\s/g, '');
  if (!body) throw new Error('GOOGLE_SHEETS_PRIVATE_KEY is empty or malformed');
  return Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
}

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

  // Convert PEM to binary. The key is commonly copied straight out of the
  // service-account JSON, where newlines are escaped as literal "\n" — those
  // survive a /\s/ strip and make atob() throw, so unescape them first.
  const binaryKey = pemToBinary(privateKey);

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

function toE164(raw) {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (raw && raw.startsWith('+')) return raw;
  return `+${digits}`;
}

function guardsLabel(services) {
  if (!services) return 'no guards';
  if (services.includes('premiumGutterGuards')) return 'premium guards';
  if (services.includes('gutterGuards')) return 'standard guards';
  return 'no guards';
}

// Moved here from a client-side postMessage listener (removed from
// estimate.html / remodel-estimate.html in the "redesign" pass) that used
// to fire these webhooks directly from the browser. Doing it server-side
// instead so it can't be lost again in a front-end cleanup, and doesn't
// depend on the visitor's browser actually running the listener.
function notifyN8nGutter(data, ctx) {
  const phone = toE164(data.phone);
  if (!phone) return;

  const payload = {
    firstname: (data.name || '').trim().split(' ')[0] || 'there',
    phone,
    estimateAmount: '$' + Number(data.estimateAmount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    gutterType: data.gutterType,
    linearFeet: data.homeLength,
    stories: data.stories,
    guards: guardsLabel(data.additionalServices),
    cleaning: (data.additionalServices || []).includes('cleaningService') ? 'yes' : 'no',
  };

  ctx.waitUntil(
    fetch('https://n8n.srv1115960.hstgr.cloud/webhook/hubspot-gutter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => console.error('n8n gutter webhook error:', err.message))
  );
}

function notifyN8nRemodel(data, ctx) {
  const phone = toE164(data.phone);
  if (!phone) return;

  const payload = {
    firstname: (data.name || '').trim().split(' ')[0] || 'there',
    phone,
    message: data.message || '',
    service: data.service || '',
    estimateRange: data.estimateRange || '',
    details: data.details || '',
  };

  ctx.waitUntil(
    fetch('https://n8n.srv1115960.hstgr.cloud/webhook/hubspot-remodel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => console.error('n8n remodel webhook error:', err.message))
  );
}

function notifyN8n(data, ctx) {
  if (data.gutterType && data.gutterType.indexOf('REMODEL:') === 0) {
    notifyN8nRemodel(data, ctx);
  } else if (data.gutterType) {
    notifyN8nGutter(data, ctx);
  }
}

export default {
  async fetch(request, env, ctx) {
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

      // Trigger the lead-text automation directly, independent of HubSpot Workflows
      notifyN8n(data, ctx);

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
