import {
  Container, Typography, Grid, Card, CardContent, Chip
} from '@mui/material';
import { useState, useEffect } from 'react';

export default function Users() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch("http://localhost:8000/auth/users")
      .then(r => r.json()).then(setUsers);
  }, []);

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
