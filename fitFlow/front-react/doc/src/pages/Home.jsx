import { Box, Typography, Button, Paper, Avatar, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Lottie from 'lottie-react';
import medicalAnimation from '../assets/homePageMainAnimationDOC.json';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const goToProfile = () => {
    navigate('/profile');
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
            <IconButton onClick={goToProfile}>
              <Avatar alt={user.first_name} src="/user-icon.png" /> {/* usa una imagen estática o deja el Avatar con iniciales */}
            </IconButton>
          </>
        ) : (
          <>
            <Button variant="contained" component={Link} to="/register" sx={{ mr: 2 }}>
              Registrar Usuario
            </Button>
            <Button variant="outlined" color="secondary" component={Link} to="/login">
              Iniciar Sesión
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Home;
