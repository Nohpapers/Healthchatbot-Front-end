import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import ChatStart from './components/ChatStart';
import WorkoutHistory from './components/WorkoutHistory';
import DataManagement from './components/DataManagement';
import Settings from './components/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/chat" element={<ChatStart />} />
        <Route path="/history" element={<WorkoutHistory />} />
        <Route path="/insights" element={<DataManagement />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
