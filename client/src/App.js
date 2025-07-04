import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClubProvider } from './contexts/ClubContext';
import MainLayout from './layouts/MainLayout/MainLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import PlayersList from './pages/Rakeback/PlayersList/PlayersList';
import AgentsList from './pages/Rakeback/AgentsList/AgentsList';
import RakebackData from './pages/Rakeback/RakebackData/RakebackData';
import './App.css';

function App() {
  return (
    <ClubProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="players-rb-list" element={<PlayersList />} />
            <Route path="agents-rb-list" element={<AgentsList />} />
            <Route path="rakeback-data" element={<RakebackData />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ClubProvider>
  );
}

export default App;
