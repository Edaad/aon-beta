const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
    clubId: {
        type: String,
        required: true,
        index: true
    },
    nickname: {
        type: String,
        required: true
    },
    rakeback: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for efficient club-specific queries
agentSchema.index({ clubId: 1, nickname: 1 });

module.exports = mongoose.model('Agent', agentSchema);
