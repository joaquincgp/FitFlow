import { Box, Typography, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import medicalAnimation from '../assets/homePageMainAnimationDOC.json';

const Home = () => (
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
      <Button variant="contained" component={Link} to="/register" sx={{ mr: 2 }}>
        Registrar Usuario
      </Button>
      <Button variant="outlined" color="secondary" component={Link} to="/users">
        Ver Usuarios
      </Button>
    </Paper>
  </Box>
);

export default Home;
