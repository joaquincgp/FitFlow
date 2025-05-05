import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Paper, Typography, Box } from '@mui/material';

const Perfil = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch('http://localhost:8000/auth/me', {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  if (!profile) return null;

  return (
    <Container sx={{ py: 5 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Mi Perfil
        </Typography>
        <Box>
          <Typography><strong>Nombre:</strong> {profile.first_name} {profile.last_name}</Typography>
          <Typography><strong>Email:</strong> {profile.email}</Typography>
          <Typography><strong>Teléfono:</strong> {profile.phone_number}</Typography>
          <Typography><strong>Rol:</strong> {profile.role}</Typography>
          {profile.role === 'paciente' && (
            <>
              <Typography><strong>Ciudad:</strong> {profile.city}</Typography>
              <Typography><strong>Género:</strong> {profile.sexual_gender}</Typography>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Perfil;
