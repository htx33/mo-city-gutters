const axios = require('axios');

async function verifyRecaptcha(token) {
    try {
        const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: token
            }
        });

        return response.data;
    } catch (error) {
        console.error('reCAPTCHA verification failed:', error);
        return { success: false, error: 'Failed to verify reCAPTCHA' };
    }
}

module.exports = { verifyRecaptcha };
