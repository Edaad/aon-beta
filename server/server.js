const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DATABASE_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Import routes
const clubRoutes = require('./routes/clubs');
const playerRoutes = require('./routes/players');
const agentRoutes = require('./routes/agents');
const superAgentRoutes = require('./routes/superAgents');
const weekRoutes = require('./routes/weeks');
const weekDataRoutes = require('./routes/weekData');

// Routes
app.use('/api/clubs', clubRoutes);
app.use('/api/:clubId/players', playerRoutes);
app.use('/api/:clubId/agents', agentRoutes);
app.use('/api/:clubId/super-agents', superAgentRoutes);
app.use('/api/:clubId/weeks', weekRoutes);
app.use('/api/:clubId/weekData', weekDataRoutes);

// Default route
app.get('/', (req, res) => {
    res.json({ message: 'AON Rakeback Management API' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
