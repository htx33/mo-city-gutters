const mongoose = require('mongoose');

// Calculate expiration date (30 days from now)
const calculateExpirationDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
};

const estimateSchema = new mongoose.Schema({
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
        enum: ['pending', 'contacted', 'scheduled', 'completed', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
        default: calculateExpirationDate
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Estimate', estimateSchema);
