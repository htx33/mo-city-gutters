const mongoose = require('mongoose');

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
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Estimate', estimateSchema);
