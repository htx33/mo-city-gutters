const Quote = require('./models/Quote');
const mongoose = require('mongoose');
const hubspot = require('./utils/hubspot');
require('dotenv').config();

// Test HubSpot connection directly
async function testHubSpotConnection() {
    try {
        const response = await hubspot.axios.get('/crm/v3/objects/deals');
        console.log('Successfully connected to HubSpot!');
        return true;
    } catch (error) {
        console.error('HubSpot connection error:', {
            message: error.message,
            response: error.response ? error.response.data : null,
            status: error.response ? error.response.status : null,
            headers: error.response ? error.response.headers : null
        });
        return false;
    }
}

async function testHubSpotIntegration() {
    // First test HubSpot connection
    console.log('Testing HubSpot connection...');
    const connected = await testHubSpotConnection();
    if (!connected) {
        console.error('Failed to connect to HubSpot. Please check your API key and permissions.');
        return;
    }
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mo-city-gutters');
        console.log('Connected to MongoDB');

        // Create a test quote
        const testQuote = new Quote({
            name: 'Test Customer',
            email: 'test@example.com',
            phone: '123-456-7890',
            address: '123 Test St, Houston, TX',
            homeLength: 100,
            gutterType: 'standard',
            additionalServices: ['gutterGuards', 'cleaningService'],
            estimateAmount: 1500,
            status: 'pending'
        });

        // Save the quote (this will trigger the HubSpot sync)
        const savedQuote = await testQuote.save();
        console.log('Quote created successfully:', savedQuote);

        // Wait a moment then update the status (this will trigger HubSpot deal update)
        await new Promise(resolve => setTimeout(resolve, 2000));
        await Quote.findByIdAndUpdate(savedQuote._id, { status: 'sent' });
        console.log('Quote status updated to sent');

        console.log('Test completed successfully!');
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

testHubSpotIntegration();
