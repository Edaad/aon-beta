const mongoose = require('mongoose');

const thresholdSchema = new mongoose.Schema({
    start: {
        type: Number,
        required: true,
        min: 0
    },
    end: {
        type: Number,
        required: true,
        min: 0
    },
    percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    }
}, { _id: false });

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
    rakebackType: {
        type: String,
        enum: ['flat', 'threshold'],
        default: 'flat'
    },
    rakeback: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    thresholds: [thresholdSchema],
    taxRebate: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for efficient club-specific queries
superAgentSchema.index({ clubId: 1, nickname: 1 });

module.exports = mongoose.model('SuperAgent', superAgentSchema);
