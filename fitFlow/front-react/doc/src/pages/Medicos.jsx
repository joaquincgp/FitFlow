import React, { useEffect, useState, useContext } from 'react';
import {
  Container, Grid, Card, CardContent, Typography,
  Avatar, Button, Box
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Medicos = () => {
  const [doctors, setDoctors] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'paciente') {
      navigate('/');
      return;
    }

    fetch('http://localhost:8000/doctors')
      .then(res => res.json())
      .then(data => setDoctors(data));
  }, [user, navigate]);

  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Médicos Disponibles
      </Typography>
      <Grid container spacing={4}>
        {doctors.map((doc) => (
          <Grid item xs={12} sm={6} md={4} key={doc.id}>
            <Card sx={{ p: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.light', width: 80, height: 80 }}>
                  <LocalHospitalIcon sx={{ fontSize: 40 }} />
                </Avatar>
              </Box>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={600}>
                  {doc.first_name} {doc.last_name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  {doc.specialty}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {doc.location}
                </Typography>
              </CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', pb: 1 }}>
                <Button startIcon={<PersonIcon />} variant="outlined">Ver perfil</Button>
                <Button startIcon={<PhoneIcon />} variant="outlined">Llamar</Button>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Button fullWidth startIcon={<VideoCallIcon />} variant="outlined">
                  TeleConsulta
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Medicos;
