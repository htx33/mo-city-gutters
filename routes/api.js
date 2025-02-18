const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const sheets = require('../utils/sheets');
const hubspot = require('../utils/hubspot');

// Validation middleware
const estimateValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('homeLength').isNumeric().withMessage('Home length must be a number'),
    body('stories').isNumeric().withMessage('Number of stories must be a number'),
    body('gutterType').isIn(['standard', 'premium']).withMessage('Invalid gutter type'),
    body('estimateAmount').isNumeric().withMessage('Estimate amount must be a number'),
    body('additionalServices').isArray().withMessage('Additional services must be an array')
];

const contactValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').trim().notEmpty().withMessage('Message is required')
];

// Submit estimate
router.post('/estimate', estimateValidation, async (req, res) => {
    try {
        console.log('Received estimate submission:', req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        // Add quote to Google Sheets
        const quote = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            homeLength: req.body.homeLength,
            gutterType: req.body.gutterType,
            additionalServices: req.body.additionalServices,
            estimateAmount: req.body.estimateAmount,
            stories: req.body.stories
        };

        console.log('Adding quote to Google Sheets:', quote);
        await sheets.appendQuote(quote);
        console.log('Quote added to Google Sheets');

        // Sync with HubSpot
        try {
            const hubspotDeal = await hubspot.syncQuoteAsDeal(quote);
            console.log('Successfully synced with HubSpot:', hubspotDeal.id);
        } catch (hubspotError) {
            console.error('Error syncing with HubSpot:', hubspotError);
            // Don't fail the request if HubSpot sync fails
        }

        // Send email notification (implement this later)
        
        res.status(201).json({
            message: 'Estimate submitted successfully',
            estimateId: estimate._id,
            estimate: estimate
        });
    } catch (error) {
        console.error('Error submitting estimate:', error);
        res.status(500).json({ 
            message: 'Error submitting estimate',
            error: error.message 
        });
    }
});

// Submit contact form
router.post('/contact', contactValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const contact = new Contact(req.body);
        await contact.save();

        // Send email notification (implement this later)

        res.status(201).json({
            message: 'Message sent successfully',
            contactId: contact._id
        });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({ message: 'Error sending message' });
    }
});

// Get all estimates (protected route - add authentication later)
router.get('/estimates', async (req, res) => {
    try {
        const estimates = await Estimate.find().sort({ createdAt: -1 });
        res.json(estimates);
    } catch (error) {
        console.error('Error fetching estimates:', error);
        res.status(500).json({ message: 'Error fetching estimates' });
    }
});

// Get all contacts (protected route - add authentication later)
router.get('/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ message: 'Error fetching contacts' });
    }
});

module.exports = router;
