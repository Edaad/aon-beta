const express = require('express');
const router = express.Router({ mergeParams: true });
const Week = require('../models/Week');

// Get all weeks for a club
router.get('/', async (req, res) => {
    try {
        const weeks = await Week.find({ clubId: req.params.clubId }).sort({ weekNumber: -1 });
        res.json(weeks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a new week
router.post('/', async (req, res) => {
    try {
        const week = new Week({
            clubId: req.params.clubId,
            ...req.body
        });
        const savedWeek = await week.save();
        res.status(201).json(savedWeek);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a week
router.patch('/:id', async (req, res) => {
    try {
        const week = await Week.findOneAndUpdate(
            { _id: req.params.id, clubId: req.params.clubId },
            req.body,
            { new: true }
        );
        if (!week) {
            return res.status(404).json({ error: 'Week not found' });
        }
        res.json(week);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a week
router.delete('/:id', async (req, res) => {
    try {
        const week = await Week.findOneAndDelete({
            _id: req.params.id,
            clubId: req.params.clubId
        });
        if (!week) {
            return res.status(404).json({ error: 'Week not found' });
        }
        res.json({ message: 'Week deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
