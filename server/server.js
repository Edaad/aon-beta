const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [
            process.env.FRONTEND_URL || 'https://aon-rakeback.vercel.app',
            'https://aon-rakeback-git-main.vercel.app',
            'https://aon-rakeback-preview.vercel.app'
        ]
        : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
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
    res.json({
        message: 'AON Rakeback Management API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
