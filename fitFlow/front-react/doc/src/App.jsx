import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import RegisterClient from './pages/RegisterClient';
import RegisterNutritionist from './pages/RegisterNutritionist';
import RegisterAdmin from './pages/RegisterAdmin.jsx';

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-client" element={<RegisterClient />} />
          <Route path="/register-nutritionist" element={<RegisterNutritionist />} />
          <Route path="/register-admin" element={<RegisterAdmin />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
