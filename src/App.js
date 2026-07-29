import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import ChatStart from './components/ChatStart';
import CoachingAI from './components/CoachingAI';
import NutritionAI from './components/NutritionAI';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Signup from './components/Signup';
import OAuthCallback from './components/OAuthCallback';
import ApiTester from './components/ApiTester';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/chat" element={<ChatStart />} />
        <Route path="/coaching" element={<CoachingAI />} />
        <Route path="/nutrition" element={<NutritionAI />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/api-test" element={<ApiTester />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
