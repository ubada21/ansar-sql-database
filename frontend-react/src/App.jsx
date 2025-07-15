import { Navigate, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Profile from './Profile';

function App() {
  return (
    <Router>
    <Routes>
    <Route path="/login" element={<Login/>} />
    <Route path="/profile" element={<Profile/>} />
    <Route path="/" element={<Navigate to = '/login' />} />
    </Routes>
    </Router>
  );
}

export default App;
