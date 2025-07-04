const express = require('express');
const router = express.Router({ mergeParams: true });
const Player = require('../models/Player');

// Get all players for a club
router.get('/', async (req, res) => {
    try {
        const players = await Player.find({ clubId: req.params.clubId }).sort({ nickname: 1 });
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a new player
router.post('/', async (req, res) => {
    try {
        const player = new Player({
            clubId: req.params.clubId,
            ...req.body
        });
        const savedPlayer = await player.save();
        res.status(201).json(savedPlayer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a player
router.patch('/:id', async (req, res) => {
    try {
        const player = await Player.findOneAndUpdate(
            { _id: req.params.id, clubId: req.params.clubId },
            req.body,
            { new: true }
        );
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.json(player);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a player
router.delete('/:id', async (req, res) => {
    try {
        const player = await Player.findOneAndDelete({
            _id: req.params.id,
            clubId: req.params.clubId
        });
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.json({ message: 'Player deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
