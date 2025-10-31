# Local Setup Guide

This guide will help you run the AON Rakeback Management application locally on your machine.

## Prerequisites

- Node.js 18 or higher
- MongoDB Atlas account (or local MongoDB installation)
- Git

## Quick Start

### 1. Environment Configuration

#### Backend (Server)
The server `.env` file has been configured with:
```env
MONGODB_URI=mongodb+srv://admin:admin@aon.8kcahgl.mongodb.net/Aon?retryWrites=true&w=majority&appName=Aon
DATABASE_NAME=Aon
PORT=3002
NODE_ENV=development
```

#### Frontend (Client)
The client `.env` file has been configured with:
```env
REACT_APP_API_URL=http://localhost:3002/api
NODE_ENV=development
```

### 2. Install Dependencies

Both frontend and backend dependencies are already installed. If you need to reinstall:

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 3. Start the Application

**Backend Server:**
```bash
cd server
npm run dev
```
Server will run on `http://localhost:3002`

**Frontend Application:**
```bash
cd client
npm start
```
Frontend will run on `http://localhost:3000` and automatically open in your browser.

### 4. Access the Application

1. Open your browser and navigate to `http://localhost:3000`
2. Enter PIN: **8104** (for Dashboard access)
3. Select a club: **Round Table** or **Aces Table**

## Available Scripts

### Backend (server/)
- `npm start` - Run server in production mode
- `npm run dev` - Run server in development mode with auto-reload (nodemon)
- `node setup.js` - Initialize clubs in database
- `node migrate.js` - Migrate data from db.json to MongoDB

### Frontend (client/)
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests

## Database Setup

The application connects to MongoDB Atlas. The database setup has already been completed:
- ✅ Clubs initialized (Round Table, Aces Table)
- ✅ MongoDB connection configured
- ✅ All models ready

## Troubleshooting

### Port Already in Use
If port 3002 or 3000 is already in use:
1. Kill the process using that port
2. Or update the PORT in `.env` files

**Mac/Linux:**
```bash
# Kill process on port 3002
lsof -ti:3002 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Issues
- Verify MongoDB Atlas cluster is running
- Check network access settings in MongoDB Atlas
- Ensure your IP is whitelisted

### CORS Errors
- Verify `FRONTEND_URL` in server `.env`
- Check that frontend is running on the correct port

### Missing Dependencies
Run these commands to reinstall:
```bash
cd server && rm -rf node_modules && npm install
cd ../client && rm -rf node_modules && npm install
```

## Development Workflow

1. Make changes to code
2. Frontend: Auto-reloads when you save (thanks to react-scripts)
3. Backend: Auto-reloads when you save (thanks to nodemon)
4. Test your changes in the browser

## Application Structure

```
aon-beta/
├── server/           # Backend (Node.js, Express, MongoDB)
│   ├── models/      # Database models
│   ├── routes/      # API routes
│   └── server.js    # Main server file
├── client/          # Frontend (React)
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── services/    # API calls
│   └── public/      # Static assets
└── README.md
```

## Features

- ✅ Multi-club support
- ✅ Player, Agent, and Super Agent management
- ✅ Excel file upload and processing
- ✅ Threshold-based rakeback calculation
- ✅ Tax/Rebate calculation
- ✅ Routing configuration
- ✅ Weekly rakeback reports
- ✅ Dashboard with analytics
- ✅ PIN-protected dashboard

## Need Help?

Check the main README.md for more information about the application features and architecture.

