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
    // Store all extracted data for routing calculations
    extractedData: [{
        nickname: String,
        agent: String,
        superAgent: String,
        rake: Number,
        pl: Number
    }],
    playersData: [{
        nickname: String,
        agent: String,
        rake: Number,
        pl: Number,
        rakebackPercent: Number,
        rakebackAmount: Number,
        superAgent: String,
        taxRebate: { type: Boolean, default: false },
        routing: [{
            type: { type: String },
            username: { type: String },
            percentage: { type: Number }
        }],
        routingRakeback: { type: Number, default: 0 }
    }],
    agentsData: [{
        nickname: String,
        totalRake: Number,
        totalPL: Number,
        rakebackPercent: Number,
        rakebackAmount: Number,
        playersCount: Number,
        superAgent: String,
        taxRebate: { type: Boolean, default: false },
        routing: [{
            type: { type: String },
            username: { type: String },
            percentage: { type: Number }
        }],
        routingRakeback: { type: Number, default: 0 },
        downlinePlayers: [{
            username: String,
            rake: Number,
            pl: Number,
            contribution: Number
        }]
    }],
    superAgentsData: [{
        nickname: String,
        totalRake: Number,
        totalPL: Number,
        rakebackPercent: Number,
        rakebackAmount: Number,
        agentsCount: Number,
        playersCount: Number,
        taxRebate: { type: Boolean, default: false },
        routing: [{
            type: { type: String },
            username: { type: String },
            percentage: { type: Number }
        }],
        routingRakeback: { type: Number, default: 0 },
        downlineAgents: [{
            username: String,
            rake: Number,
            contribution: Number
        }],
        downlinePlayers: [{
            username: String,
            rake: Number,
            pl: Number,
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
