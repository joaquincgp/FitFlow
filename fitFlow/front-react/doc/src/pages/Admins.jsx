import { Container, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetch(`${API_URL}/auth/admins`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setAdmins);
  }, [token]);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Lista de Administradores
      </Typography>
      <Grid container spacing={2}>
        {admins.map(a => (
          <Grid item xs={12} md={4} key={a.user_id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{a.first_name} {a.last_name}</Typography>
                <Typography>Cédula: {a.cedula}</Typography>
                <Typography>Email: {a.email}</Typography>
                <Chip label={a.role} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
