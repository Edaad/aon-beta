const express = require('express');
const router = express.Router({ mergeParams: true });
const SuperAgent = require('../models/SuperAgent');

// Get all super agents for a club
router.get('/', async (req, res) => {
    try {
        const superAgents = await SuperAgent.find({ clubId: req.params.clubId }).sort({ nickname: 1 });
        res.json(superAgents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a new super agent
router.post('/', async (req, res) => {
    try {
        const superAgent = new SuperAgent({
            clubId: req.params.clubId,
            ...req.body
        });
        const savedSuperAgent = await superAgent.save();
        res.status(201).json(savedSuperAgent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a super agent
router.patch('/:id', async (req, res) => {
    try {
        const superAgent = await SuperAgent.findOneAndUpdate(
            { _id: req.params.id, clubId: req.params.clubId },
            req.body,
            { new: true }
        );
        if (!superAgent) {
            return res.status(404).json({ error: 'Super agent not found' });
        }
        res.json(superAgent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a super agent
router.delete('/:id', async (req, res) => {
    try {
        const superAgent = await SuperAgent.findOneAndDelete({
            _id: req.params.id,
            clubId: req.params.clubId
        });
        if (!superAgent) {
            return res.status(404).json({ error: 'Super agent not found' });
        }
        res.json({ message: 'Super agent deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
