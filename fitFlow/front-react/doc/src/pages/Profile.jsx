import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Box, Typography, Paper } from '@mui/material';

export default function Profile() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <Typography variant="h6" align="center" mt={4}>
        No has iniciado sesión.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Paper sx={{ p: 4, maxWidth: 500 }}>
        <Typography variant="h4" gutterBottom>Perfil</Typography>
        <Typography>Nombre: {user.first_name} {user.last_name}</Typography>
        <Typography>Email: {user.email}</Typography>
        <Typography>Cédula: {user.cedula}</Typography>
        <Typography>Rol: {user.role}</Typography>
        {/* Aquí puedes mostrar más datos si necesitas */}
      </Paper>
    </Box>
  );
}
