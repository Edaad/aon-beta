# AON Rakeback Management

A full-stack poker rakeback management application with multi-club support.

## Features

- Multi-club support
- Player, Agent, and Super Agent management
- Excel file upload and processing
- Rakeback calculation and reporting
- Edit functionality for all entities

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Deployment**: Vercel (Frontend), Railway (Backend)

## Environment Variables

### Backend (Railway)
- `MONGODB_URI`: MongoDB connection string
- `DATABASE_NAME`: Database name
- `NODE_ENV`: production
- `FRONTEND_URL`: Your Vercel frontend URL

### Frontend (Vercel)
- `REACT_APP_API_URL`: Your Railway backend API URL
- `NODE_ENV`: production

## Deployment

This application is configured for automatic deployment via GitHub integration:
- **Backend**: Railway automatically deploys from the `/server` directory
- **Frontend**: Vercel automatically deploys from the `/client` directory
