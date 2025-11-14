import { Box, Typography, Paper, Button, IconButton, Avatar } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import Lottie from 'lottie-react';
import medicalAnimation from '../assets/homePageMainAnimationDOC.json';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [apiResult, setApiResult] = useState(null);
  const [error, setError] = useState("");

  const callApi = async (endpoint) => {
    setError("");
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No hay token en localStorage.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const text = await res.text();
        setError(`Error ${res.status}: ${text}`);
        setApiResult(null);
      } else {
        const data = await res.json();
        setApiResult(data);
      }
    } catch (err) {
      setError("Error de red: " + err.message);
      setApiResult(null);
    }
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'background.default',
        padding: 4,
      }}
    >
      <Paper elevation={6} sx={{ p: 6, borderRadius: 4, maxWidth: 700, width: '100%', textAlign: 'center' }}>
        <Lottie animationData={medicalAnimation} loop style={{ height: 300, marginBottom: 24 }} />

        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Bienvenido a FitFlow
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 4 }}>
          Tu plataforma para gestionar tus objetivos de salud y bienestar.
        </Typography>

        {user ? (
          <>
            <Typography variant="h6" gutterBottom>
              Sesión iniciada como {user.first_name} {user.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Rol: {user.role || 'Sin rol asignado'}
            </Typography>
            {(!user.role || user.role === 'Sin rol') && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                <Typography variant="body2" color="warning.dark">
                  ⚠️ No tienes un rol asignado. Por favor, regístrate como Cliente, Nutricionista o Administrador para acceder a todas las funcionalidades.
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <Button variant="outlined" size="small" component={Link} to="/register-client">
                    Registrarse como Cliente
                  </Button>
                  <Button variant="outlined" size="small" component={Link} to="/register-nutritionist">
                    Registrarse como Nutricionista
                  </Button>
                  <Button variant="outlined" size="small" component={Link} to="/register-admin">
                    Registrarse como Admin
                  </Button>
                </Box>
              </Box>
            )}
            <IconButton onClick={() => navigate('/profile')} sx={{ mt: 2 }}>
              <Avatar>{user.first_name[0]}</Avatar>
            </IconButton>
          </>
        ) : (
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" component={Link} to="/login" sx={{ mr: 2 }}>
              Iniciar Sesión
            </Button>
            <Button variant="outlined" component={Link} to="/register-client">
              Registrarse
            </Button>
          </Box>
        )}

        {/*/!* 🚨 Debug buttons *!/*/}
        {/*<Box sx={{ mt: 4 }}>*/}
        {/*  <Typography variant="h6" gutterBottom>Pruebas manuales de API:</Typography>*/}
        {/*  <Button variant="contained" onClick={() => callApi("/auth/users")} sx={{ m: 1 }}>Probar /auth/users</Button>*/}
        {/*  <Button variant="contained" onClick={() => callApi("/auth/nutritionists")} sx={{ m: 1 }}>Probar /auth/nutritionists</Button>*/}
        {/*  <Button variant="contained" onClick={() => callApi("/auth/admins")} sx={{ m: 1 }}>Probar /auth/admins</Button>*/}
        {/*</Box>*/}

        {/*{error && (*/}
        {/*  <Typography variant="body2" color="error" sx={{ mt: 2 }}>*/}
        {/*    {error}*/}
        {/*  </Typography>*/}
        {/*)}*/}
        {/*{apiResult && (*/}
        {/*  <Paper elevation={2} sx={{ p: 2, mt: 2, textAlign: 'left', maxHeight: 200, overflow: 'auto' }}>*/}
        {/*    <Typography variant="subtitle2">Respuesta JSON:</Typography>*/}
        {/*    <pre>{JSON.stringify(apiResult, null, 2)}</pre>*/}
        {/*  </Paper>*/}
        {/*)}*/}

        {/* 🚨 Debug buttons */}
<Box sx={{ mt: 4 }}>
  <Typography variant="h6" gutterBottom>Pruebas manuales de API:</Typography>
  <Button variant="contained" onClick={() => callApi("/auth/users")} sx={{ m: 1 }}>Probar /auth/users</Button>
  <Button variant="contained" onClick={() => callApi("/auth/nutritionists")} sx={{ m: 1 }}>Probar /auth/nutritionists</Button>
  <Button variant="contained" onClick={() => callApi("/auth/admins")} sx={{ m: 1 }}>Probar /auth/admins</Button>
</Box>

{error && (
  <Typography variant="body2" color="error" sx={{ mt: 2 }}>
    {error}
  </Typography>
)}
{apiResult && (
  <Paper elevation={2} sx={{ p: 2, mt: 2, textAlign: 'left', maxHeight: 200, overflow: 'auto' }}>
    <Typography variant="subtitle2">Respuesta JSON:</Typography>
    <pre>{JSON.stringify(apiResult, null, 2)}</pre>
  </Paper>
)}

      </Paper>
    </Box>
  );
};

export default Home;
