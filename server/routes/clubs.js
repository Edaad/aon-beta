const express = require('express');
const router = express.Router();
const Club = require('../models/Club');

// Get all clubs
router.get('/', async (req, res) => {
    try {
        const clubs = await Club.find().sort({ name: 1 });
        res.json(clubs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new club
router.post('/', async (req, res) => {
    try {
        const { name, displayName } = req.body;

        // Create club ID from name (lowercase, replace spaces with hyphens)
        const clubId = name.toLowerCase().replace(/\s+/g, '-');

        const club = new Club({
            name: clubId,
            displayName: displayName || name
        });

        const savedClub = await club.save();
        res.status(201).json(savedClub);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ error: 'Club with this name already exists' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Get a specific club
router.get('/:clubId', async (req, res) => {
    try {
        const club = await Club.findOne({ name: req.params.clubId });
        if (!club) {
            return res.status(404).json({ error: 'Club not found' });
        }
        res.json(club);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a club
router.delete('/:clubId', async (req, res) => {
    try {
        const club = await Club.findOneAndDelete({ name: req.params.clubId });
        if (!club) {
            return res.status(404).json({ error: 'Club not found' });
        }
        res.json({ message: 'Club deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
