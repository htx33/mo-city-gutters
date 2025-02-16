const axios = require('axios');
require('dotenv').config();

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
const BASE_URL = 'https://api.hubapi.com';

class HubSpotService {
    constructor() {
        this.axios = axios.create({
            baseURL: BASE_URL,
            headers: {
                'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
    }

    // Create or update a deal in HubSpot
    async syncQuoteAsDeal(quote) {
        try {
            console.log('Starting HubSpot sync for quote:', quote._id);
            if (!HUBSPOT_API_KEY) {
                throw new Error('HUBSPOT_API_KEY is not set in environment variables');
            }
            // First, find or create contact
            const contact = await this.findOrCreateContact({
                email: quote.email,
                firstname: quote.name.split(' ')[0],
                lastname: quote.name.split(' ').slice(1).join(' '),
                phone: quote.phone,
                address: quote.address
            });

            // Create deal properties
            const dealProperties = {
                dealname: `Gutter Quote for ${quote.name}`,
                amount: quote.estimateAmount,
                pipeline: 'default', // You can change this to match your HubSpot pipeline
                dealstage: 'presentationscheduled', // Customize based on your pipeline stages
                quote_id: quote._id.toString(),
                linear_feet: quote.homeLength.toString(),
                gutter_type: quote.gutterType,
                additional_services: quote.additionalServices.join(', '),
                quote_valid_until: new Date(Date.UTC(quote.validUntil.getUTCFullYear(), quote.validUntil.getUTCMonth(), quote.validUntil.getUTCDate())).toISOString(),
                quote_status: quote.status
            };

            // Create the deal
            const dealResponse = await this.axios.post('/crm/v3/objects/deals', {
                properties: dealProperties,
                associations: [{
                    to: { id: contact.id },
                    types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }] // 3 is the contact-to-deal association type
                }]
            });

            return dealResponse.data;
        } catch (error) {
            console.error('Error syncing quote to HubSpot:', {
                message: error.message,
                response: error.response?.data,
                quote: quote._id,
                stack: error.stack
            });
            throw error;
        }
    }

    // Find or create a contact in HubSpot
    async findOrCreateContact(contactData) {
        try {
            // First try to find the contact by email
            const searchResponse = await this.axios.post('/crm/v3/objects/contacts/search', {
                filterGroups: [{
                    filters: [{
                        propertyName: 'email',
                        operator: 'EQ',
                        value: contactData.email
                    }]
                }]
            });

            if (searchResponse.data.total > 0) {
                return searchResponse.data.results[0];
            }

            // If contact not found, create a new one
            const createResponse = await this.axios.post('/crm/v3/objects/contacts', {
                properties: {
                    email: contactData.email,
                    firstname: contactData.firstname,
                    lastname: contactData.lastname,
                    phone: contactData.phone,
                    address: contactData.address
                }
            });

            return createResponse.data;
        } catch (error) {
            console.error('Error finding/creating contact in HubSpot:', error.response?.data || error.message);
            throw error;
        }
    }

    // Update deal status when quote status changes
    async updateDealStatus(quoteId, newStatus) {
        try {
            // Find the deal by quote_id
            const searchResponse = await this.axios.post('/crm/v3/objects/deals/search', {
                filterGroups: [{
                    filters: [{
                        propertyName: 'quote_id',
                        operator: 'EQ',
                        value: quoteId
                    }]
                }]
            });

            if (searchResponse.data.total === 0) {
                throw new Error('Deal not found in HubSpot');
            }

            const deal = searchResponse.data.results[0];

            // Map quote status to deal stage
            const stageMap = {
                'pending': 'presentationscheduled',
                'sent': 'presentationscheduled',
                'accepted': 'contractsent',
                'declined': 'closedlost',
                'expired': 'closedlost'
            };

            // Update the deal
            await this.axios.patch(`/crm/v3/objects/deals/${deal.id}`, {
                properties: {
                    dealstage: stageMap[newStatus],
                    quote_status: newStatus
                }
            });
        } catch (error) {
            console.error('Error updating deal in HubSpot:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new HubSpotService();
