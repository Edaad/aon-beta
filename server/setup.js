const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Club = require('./models/Club');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DATABASE_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

async function setupInitialClubs() {
    try {
        console.log('Setting up initial clubs...');

        // Create clubs
        const clubs = [
            { name: 'round-table', displayName: 'Round Table' },
            { name: 'aces-table', displayName: 'Aces Table' }
        ];

        for (const clubData of clubs) {
            try {
                const existingClub = await Club.findOne({ name: clubData.name });
                if (!existingClub) {
                    const club = new Club(clubData);
                    await club.save();
                    console.log(`✅ Created club: ${clubData.displayName}`);
                } else {
                    console.log(`⚠️  Club ${clubData.displayName} already exists`);
                }
            } catch (error) {
                console.error(`❌ Error creating club ${clubData.displayName}:`, error.message);
            }
        }

        console.log('✅ Setup completed successfully!');
        console.log('Both clubs are ready with empty data for testing.');

    } catch (error) {
        console.error('❌ Setup failed:', error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
}

setupInitialClubs();
