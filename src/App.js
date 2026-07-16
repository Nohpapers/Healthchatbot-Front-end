import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import ChatStart from './components/ChatStart';
import CoachingAI from './components/CoachingAI';
import NutritionAI from './components/NutritionAI';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/chat" element={<ChatStart />} />
        <Route path="/coaching" element={<CoachingAI />} />
        <Route path="/nutrition" element={<NutritionAI />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
