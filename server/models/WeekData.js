const mongoose = require('mongoose');

const weekDataSchema = new mongoose.Schema({
    clubId: {
        type: String,
        required: true,
        index: true
    },
    weekId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Week',
        required: true
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
    totalFee: {
        type: Number,
        default: 0
    },
    totalPL: {
        type: Number,
        default: 0
    },
    activePlayers: {
        type: Number,
        default: 0
    },
    totalHands: {
        type: Number,
        default: 0
    },
    playersData: [{
        nickname: String,
        agent: String,
        rake: Number,
        rakebackPercent: Number,
        rakebackAmount: Number,
        superAgent: String
    }],
    agentsData: [{
        nickname: String,
        totalRake: Number,
        rakebackPercent: Number,
        rakebackAmount: Number,
        playersCount: Number,
        superAgent: String,
        downlinePlayers: [{
            username: String,
            rake: Number,
            contribution: Number
        }]
    }],
    superAgentsData: [{
        nickname: String,
        totalRake: Number,
        rakebackPercent: Number,
        rakebackAmount: Number,
        agentsCount: Number,
        playersCount: Number,
        downlineAgents: [{
            username: String,
            rake: Number,
            contribution: Number
        }],
        downlinePlayers: [{
            username: String,
            rake: Number,
            contribution: Number
        }]
    }],
    totalPlayerRakeback: {
        type: Number,
        default: 0
    },
    totalAgentRakeback: {
        type: Number,
        default: 0
    },
    totalRakeback: {
        type: Number,
        default: 0
    },
    totalSuperAgentRakeback: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for efficient club-specific queries
weekDataSchema.index({ clubId: 1, weekNumber: 1 });

module.exports = mongoose.model('WeekData', weekDataSchema);
