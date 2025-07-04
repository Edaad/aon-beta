const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const Club = require('./models/Club');
const Player = require('./models/Player');
const Agent = require('./models/Agent');
const Week = require('./models/Week');
const WeekData = require('./models/WeekData');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DATABASE_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

async function migrateData() {
    try {
        console.log('Starting data migration...');

        // Read existing data
        const dbData = JSON.parse(fs.readFileSync('./db.json', 'utf8'));

        // Create clubs
        console.log('Creating clubs...');
        const clubs = [
            { name: 'round-table', displayName: 'Round Table' },
            { name: 'aces-table', displayName: 'Aces Table' }
        ];

        for (const clubData of clubs) {
            try {
                const club = new Club(clubData);
                await club.save();
                console.log(`Created club: ${clubData.displayName}`);
            } catch (error) {
                if (error.code === 11000) {
                    console.log(`Club ${clubData.displayName} already exists`);
                } else {
                    console.error(`Error creating club ${clubData.displayName}:`, error.message);
                }
            }
        }

        // Migrate players to Round Table
        console.log('Migrating players...');
        if (dbData.players) {
            for (const playerData of dbData.players) {
                try {
                    const player = new Player({
                        clubId: 'round-table',
                        nickname: playerData.username,
                        rakeback: playerData.percentage || 0
                    });
                    await player.save();
                    console.log(`Migrated player: ${playerData.username}`);
                } catch (error) {
                    console.error(`Error migrating player ${playerData.username}:`, error.message);
                }
            }
        }

        // Migrate agents to Round Table
        console.log('Migrating agents...');
        if (dbData.agents) {
            for (const agentData of dbData.agents) {
                try {
                    const agent = new Agent({
                        clubId: 'round-table',
                        nickname: agentData.username,
                        rakeback: agentData.percentage || 0
                    });
                    await agent.save();
                    console.log(`Migrated agent: ${agentData.username}`);
                } catch (error) {
                    console.error(`Error migrating agent ${agentData.username}:`, error.message);
                }
            }
        }

        // Migrate weeks to Round Table
        console.log('Migrating weeks...');
        if (dbData.weeks) {
            for (const weekData of dbData.weeks) {
                try {
                    const week = new Week({
                        clubId: 'round-table',
                        weekNumber: weekData.weekNumber,
                        startDate: weekData.startDate,
                        endDate: weekData.endDate,
                        status: weekData.status || 'completed'
                    });
                    await week.save();
                    console.log(`Migrated week: ${weekData.weekNumber}`);
                } catch (error) {
                    console.error(`Error migrating week ${weekData.weekNumber}:`, error.message);
                }
            }
        }

        // Migrate week data to Round Table
        console.log('Migrating week data...');
        if (dbData.weekData) {
            for (const weekDataItem of dbData.weekData) {
                try {
                    const weekData = new WeekData({
                        clubId: 'round-table',
                        weekNumber: weekDataItem.weekNumber,
                        startDate: weekDataItem.startDate,
                        endDate: weekDataItem.endDate,
                        totalFee: weekDataItem.totalFee || 0,
                        totalPL: weekDataItem.totalPL || 0,
                        activePlayers: weekDataItem.activePlayers || 0,
                        totalHands: weekDataItem.totalHands || 0,
                        playersData: weekDataItem.playersData || [],
                        agentsData: weekDataItem.agentsData || [],
                        totalPlayerRakeback: weekDataItem.totalPlayerRakeback || 0,
                        totalAgentRakeback: weekDataItem.totalAgentRakeback || 0,
                        totalRakeback: weekDataItem.totalRakeback || 0
                    });
                    await weekData.save();
                    console.log(`Migrated week data: Week ${weekDataItem.weekNumber}`);
                } catch (error) {
                    console.error(`Error migrating week data ${weekDataItem.weekNumber}:`, error.message);
                }
            }
        }

        console.log('Migration completed successfully!');

        // Create backup of original files
        const backupDir = './backup';
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }

        fs.copyFileSync('./db.json', `${backupDir}/db.json.backup`);
        if (fs.existsSync('./rtlist.json')) {
            fs.copyFileSync('./rtlist.json', `${backupDir}/rtlist.json.backup`);
        }
        if (fs.existsSync('./aceslist.json')) {
            fs.copyFileSync('./aceslist.json', `${backupDir}/aceslist.json.backup`);
        }

        console.log('Original files backed up to ./backup/ directory');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
}

migrateData();
