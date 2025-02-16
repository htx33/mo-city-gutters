const mongoose = require('mongoose');
const hubspot = require('../utils/hubspot');

const quoteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    homeLength: {
        type: Number,
        required: true
    },
    gutterType: {
        type: String,
        enum: ['standard', 'premium'],
        required: true
    },
    additionalServices: [{
        type: String,
        enum: ['cleaningService', 'gutterGuards', 'specialRoofTypes']
    }],
    estimateAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'accepted', 'declined', 'expired'],
        default: 'pending'
    },
    validUntil: {
        type: Date,
        required: true,
        default: function() {
            // Set quote validity for 30 days from creation
            const date = new Date();
            date.setDate(date.getDate() + 30);
            return date;
        }
    },
    notes: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add index for better query performance
quoteSchema.index({ email: 1, createdAt: -1 });
quoteSchema.index({ status: 1 });

// Middleware to sync quote with HubSpot after save
quoteSchema.post('save', async function(doc) {
    try {
        await hubspot.syncQuoteAsDeal(doc);
    } catch (error) {
        console.error('Error syncing quote to HubSpot:', error);
        // Don't throw the error to prevent blocking the save operation
    }
});

// Middleware to update HubSpot deal when quote status changes
quoteSchema.pre('findOneAndUpdate', async function() {
    const update = this.getUpdate();
    if (update.status) {
        const doc = await this.model.findOne(this.getQuery());
        try {
            // Add a small delay to ensure the deal exists in HubSpot
            await new Promise(resolve => setTimeout(resolve, 1000));
            await hubspot.updateDealStatus(doc._id.toString(), update.status);
        } catch (error) {
            console.error('Error updating HubSpot deal:', error);
            // Don't throw the error to prevent blocking the update operation
        }
    }
});

const Quote = mongoose.model('Quote', quoteSchema);

module.exports = Quote;
