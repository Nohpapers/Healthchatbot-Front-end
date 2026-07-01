import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import ChatStart from './components/ChatStart';
import CoachingAI from './components/CoachingAI';
import NutritionAI from './components/NutritionAI';
import WorkoutAI from './components/WorkoutAI';
import WorkoutHistory from './components/WorkoutHistory';
import DataManagement from './components/DataManagement';
import Settings from './components/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/chat" element={<ChatStart />} />
        <Route path="/coaching" element={<CoachingAI />} />
        <Route path="/nutrition" element={<NutritionAI />} />
        <Route path="/workout" element={<WorkoutAI />} />
        <Route path="/history" element={<WorkoutHistory />} />
        <Route path="/insights" element={<DataManagement />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
