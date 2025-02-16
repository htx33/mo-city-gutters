const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');

// Create a new quote
router.post('/', async (req, res) => {
    try {
        const quote = new Quote(req.body);
        await quote.save();
        res.status(201).json(quote);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all quotes with optional filtering
router.get('/', async (req, res) => {
    try {
        const { status, email } = req.query;
        const filter = {};
        
        if (status) filter.status = status;
        if (email) filter.email = email;

        const quotes = await Quote.find(filter).sort({ createdAt: -1 });
        res.json(quotes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific quote
router.get('/:id', async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id);
        if (!quote) {
            return res.status(404).json({ message: 'Quote not found' });
        }
        res.json(quote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update quote status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const quote = await Quote.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!quote) {
            return res.status(404).json({ message: 'Quote not found' });
        }
        res.json(quote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update quote details
router.put('/:id', async (req, res) => {
    try {
        const quote = await Quote.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!quote) {
            return res.status(404).json({ message: 'Quote not found' });
        }
        res.json(quote);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
