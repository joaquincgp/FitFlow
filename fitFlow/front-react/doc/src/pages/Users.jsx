import {
  Container, Typography, Grid, Card, CardContent, Chip
} from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Users() {
  const [users, setUsers] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetch("http://localhost:8000/auth/users", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json()).then(setUsers);
  }, [token]);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Registered Users
      </Typography>
      <Grid container spacing={2}>
        {users.map(u => (
          <Grid item xs={12} md={4} key={u.user_id}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  {u.first_name} {u.last_name}
                </Typography>
                <Typography variant="body2">Cédula: {u.cedula}</Typography>
                <Typography variant="body2">Email: {u.email}</Typography>
                <Chip label={u.role} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
