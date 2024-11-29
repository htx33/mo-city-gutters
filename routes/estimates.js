const express = require('express');
const router = express.Router();
const Estimate = require('../models/Estimate');
const { isAuthenticated } = require('../middleware/auth');

// Get all estimates (admin only)
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const estimates = await Estimate.find().sort({ createdAt: -1 });
        res.json(estimates);
    } catch (error) {
        console.error('Error fetching estimates:', error);
        res.status(500).json({ message: 'Error fetching estimates' });
    }
});

// Create new estimate
router.post('/', async (req, res) => {
    try {
        const estimate = new Estimate(req.body);
        await estimate.save();
        res.status(201).json(estimate);
    } catch (error) {
        console.error('Error creating estimate:', error);
        res.status(500).json({ message: 'Error creating estimate' });
    }
});

// Update estimate status (admin only)
router.patch('/:id/status', isAuthenticated, async (req, res) => {
    try {
        const { status } = req.body;
        const estimate = await Estimate.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!estimate) {
            return res.status(404).json({ message: 'Estimate not found' });
        }
        
        res.json(estimate);
    } catch (error) {
        console.error('Error updating estimate status:', error);
        res.status(500).json({ message: 'Error updating estimate status' });
    }
});

// Delete estimate (admin only)
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const estimate = await Estimate.findByIdAndDelete(req.params.id);
        
        if (!estimate) {
            return res.status(404).json({ message: 'Estimate not found' });
        }
        
        res.json({ message: 'Estimate deleted successfully' });
    } catch (error) {
        console.error('Error deleting estimate:', error);
        res.status(500).json({ message: 'Error deleting estimate' });
    }
});

module.exports = router;
