import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import RegisterClient from './pages/RegisterClient';
import RegisterNutritionist from './pages/RegisterNutritionist';
import RegisterAdmin from './pages/RegisterAdmin';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Nutritionists from './pages/Nutritionists';
import Admins from './pages/Admins';
import Foods from './pages/Foods';
import CreatePlan from './pages/CreateNutritionalPlan';
import FoodLog from './pages/FoodLog';
import CreateNutritionalPlan from "./pages/CreateNutritionalPlan";
import MyPlans from "./pages/MyPlans.jsx";

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
          <Route path="/profile" element={<Profile />} />
          <Route path="/users" element={<Users />} />
          <Route path="/nutritionists" element={<Nutritionists />} />
          <Route path="/admins" element={<Admins />} />

          <Route path="/food-manager" element={<Foods />} />
          <Route path="/create-plan" element={<CreateNutritionalPlan />} />
          <Route path="/food-log" element={<FoodLog />} />
          <Route path="/my-plans" element={<MyPlans />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
