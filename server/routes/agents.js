const express = require('express');
const router = express.Router({ mergeParams: true });
const Agent = require('../models/Agent');

// Get all agents for a club
router.get('/', async (req, res) => {
    try {
        const agents = await Agent.find({ clubId: req.params.clubId }).sort({ nickname: 1 });
        res.json(agents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a new agent
router.post('/', async (req, res) => {
    try {
        const agent = new Agent({
            clubId: req.params.clubId,
            ...req.body
        });
        const savedAgent = await agent.save();
        res.status(201).json(savedAgent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an agent
router.patch('/:id', async (req, res) => {
    try {
        const agent = await Agent.findOneAndUpdate(
            { _id: req.params.id, clubId: req.params.clubId },
            req.body,
            { new: true }
        );
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        res.json(agent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an agent
router.delete('/:id', async (req, res) => {
    try {
        const agent = await Agent.findOneAndDelete({
            _id: req.params.id,
            clubId: req.params.clubId
        });
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        res.json({ message: 'Agent deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
