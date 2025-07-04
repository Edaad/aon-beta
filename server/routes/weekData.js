const express = require('express');
const router = express.Router({ mergeParams: true });
const WeekData = require('../models/WeekData');

// Get all week data for a club
router.get('/', async (req, res) => {
    try {
        const weekData = await WeekData.find({ clubId: req.params.clubId }).sort({ weekNumber: -1 });
        res.json(weekData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new week data
router.post('/', async (req, res) => {
    try {
        const weekData = new WeekData({
            clubId: req.params.clubId,
            ...req.body
        });
        const savedWeekData = await weekData.save();
        res.status(201).json(savedWeekData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update week data
router.patch('/:id', async (req, res) => {
    try {
        const weekData = await WeekData.findOneAndUpdate(
            { _id: req.params.id, clubId: req.params.clubId },
            req.body,
            { new: true }
        );
        if (!weekData) {
            return res.status(404).json({ error: 'Week data not found' });
        }
        res.json(weekData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete week data
router.delete('/:id', async (req, res) => {
    try {
        const weekData = await WeekData.findOneAndDelete({
            _id: req.params.id,
            clubId: req.params.clubId
        });
        if (!weekData) {
            return res.status(404).json({ error: 'Week data not found' });
        }
        res.json({ message: 'Week data deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
