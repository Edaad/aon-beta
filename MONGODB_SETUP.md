# AON Rakeback Management - MongoDB Setup Guide

## Setup Instructions

### 1. Install Backend Dependencies
```bash
cd /Users/edaad/Desktop/aon-beta/server
npm install
```

### 2. Run Data Migration
```bash
cd /Users/edaad/Desktop/aon-beta/server
node migrate.js
```

### 3. Start the Backend Server
```bash
cd /Users/edaad/Desktop/aon-beta/server
npm run dev
```

### 4. Update Frontend App.js
You need to wrap your App component with the ClubProvider in `/Users/edaad/Desktop/aon-beta/client/src/App.js`:

```javascript
import { ClubProvider } from './contexts/ClubContext';

function App() {
  return (
    <ClubProvider>
      {/* Your existing App content */}
    </ClubProvider>
  );
}
```

### 5. Add ClubSelector to Sidebar
Add the ClubSelector component to your sidebar component:

```javascript
import ClubSelector from '../ClubSelector/ClubSelector';

// In your sidebar component
<ClubSelector />
```

### 6. Update Components to Use Club Context
Update your components to use the club context:

```javascript
import { useClub } from '../contexts/ClubContext';

// In your component
const { currentClub } = useClub();

// Use currentClub.name when calling API functions
const players = await fetchPlayers(currentClub.name);
```

## What's Been Implemented

### Backend:
- ✅ MongoDB connection with Atlas
- ✅ Express.js server with routes
- ✅ Club-aware API endpoints
- ✅ Data migration script
- ✅ Models for all entities

### Frontend:
- ✅ Updated API functions to be club-aware
- ✅ Club context for state management
- ✅ Club selector component
- ✅ Club switching functionality

### Data Structure:
- **Clubs**: `round-table`, `aces-table`
- **All existing data** migrated to `round-table`
- **Aces Table** starts with empty data
- **Original files** backed up to `server/backup/`

## Next Steps Required

1. **Install dependencies** and **run migration**
2. **Update App.js** to use ClubProvider
3. **Add ClubSelector** to sidebar
4. **Update all components** to use `useClub()` hook
5. **Test the application** with both clubs

## API Endpoints

### Clubs:
- `GET /api/clubs` - Get all clubs
- `POST /api/clubs` - Add new club
- `DELETE /api/clubs/:clubId` - Delete club

### Club-specific endpoints:
- `GET /api/:clubId/players` - Get players for club
- `POST /api/:clubId/players` - Add player to club
- `DELETE /api/:clubId/players/:id` - Delete player from club
- Similar patterns for agents, weeks, weekData

The system is now ready for multi-club functionality with MongoDB backend!
