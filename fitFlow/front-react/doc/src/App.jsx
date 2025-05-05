import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Users from './pages/Users';
import Login from './pages/Login';
import Medicos from './pages/Medicos';
import Perfil from './pages/Perfil';

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/users" element={<Users />} />
            <Route path="/medicos" element={<Medicos />} />
            <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
