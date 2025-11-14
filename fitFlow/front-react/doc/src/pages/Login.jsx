import React, { useContext, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Button
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, authenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated) {
      navigate('/');
    }
  }, [authenticated, navigate]);

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="sm">
        <Paper elevation={4} sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h5" mb={3} color="primary" align="center">
            Iniciar Sesión
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Serás redirigido al portal de autenticación de Keycloak para iniciar sesión de forma segura.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={async () => {
              console.log('Login button clicked');
              try {
                await login();
              } catch (error) {
                console.error('Error in login button:', error);
              }
            }}
          >
            Iniciar sesión
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
