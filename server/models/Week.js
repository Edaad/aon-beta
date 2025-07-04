const mongoose = require('mongoose');

const weekSchema = new mongoose.Schema({
    clubId: {
        type: String,
        required: true,
        index: true
    },
    weekNumber: {
        type: Number,
        required: true
    },
    startDate: {
        type: String,
        required: true
    },
    endDate: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'archived'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for efficient club-specific queries
weekSchema.index({ clubId: 1, weekNumber: 1 });

module.exports = mongoose.model('Week', weekSchema);
