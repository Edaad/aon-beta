const mongoose = require('mongoose');

const superAgentSchema = new mongoose.Schema({
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
superAgentSchema.index({ clubId: 1, nickname: 1 });

module.exports = mongoose.model('SuperAgent', superAgentSchema);
