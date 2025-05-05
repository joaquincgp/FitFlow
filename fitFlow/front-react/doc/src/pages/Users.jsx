import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, CardActions,
  Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions,
  IconButton, Snackbar, Chip, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Users = () => {
  const [userType, setUserType] = useState('paciente');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '', password: '' });
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchUsers = async () => {
    const endpoint = userType === 'medico'
      ? 'http://localhost:8000/doctors/'
      : 'http://localhost:8000/auth/users';

    const res = await fetch(endpoint);
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    } else {
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userType]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar este usuario?');
    if (!confirmed) return;

    const url = userType === 'medico'
      ? `http://localhost:8000/doctors/${id}`
      : `http://localhost:8000/auth/users/${id}`;

    const res = await fetch(url, { method: 'DELETE' });
    if (res.ok) {
      setSnackbar({ open: true, message: 'Usuario eliminado', severity: 'success' });
      fetchUsers();
    } else {
      setSnackbar({ open: true, message: 'Error eliminando usuario', severity: 'error' });
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setVerifyPassword('');
    setVerifyDialogOpen(true);
  };

  const handleVerifyPassword = async () => {
    if (userType === 'medico') {
      // Para médicos no hay verificación de contraseña
      setEditForm({
        first_name: selectedUser.first_name,
        last_name: selectedUser.last_name,
        email: selectedUser.email,
        password: '',
      });
      setVerifyDialogOpen(false);
      setEditDialogOpen(true);
      return;
    }

    const res = await fetch('http://localhost:8000/auth/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: selectedUser.email, password: verifyPassword }),
    });

    if (!res.ok) {
      setSnackbar({ open: true, message: 'Contraseña incorrecta', severity: 'error' });
      return;
    }

    setEditForm({
      first_name: selectedUser.first_name,
      last_name: selectedUser.last_name,
      email: selectedUser.email,
      password: '',
    });
    setVerifyDialogOpen(false);
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    const url = userType === 'medico'
      ? `http://localhost:8000/doctors/${selectedUser.id}`
      : `http://localhost:8000/auth/users/${selectedUser.id}`;

    const payload = {
      first_name: editForm.first_name,
      last_name: editForm.last_name,
      email: editForm.email,
    };

    if (editForm.password.trim()) {
      payload.password = editForm.password;
    }

    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setSnackbar({ open: true, message: 'Usuario actualizado', severity: 'success' });
      setEditDialogOpen(false);
      fetchUsers();
    } else {
      setSnackbar({ open: true, message: 'Error actualizando usuario', severity: 'error' });
    }
  };

  const handleFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'paciente':
        return 'primary';
      case 'medico':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom color="primary">
        {userType === 'medico' ? 'Médicos Registrados' : 'Pacientes Registrados'}
      </Typography>

      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel>Tipo de Usuario</InputLabel>
        <Select
          value={userType}
          label="Tipo de Usuario"
          onChange={(e) => setUserType(e.target.value)}
        >
          <MenuItem value="paciente">Pacientes</MenuItem>
          <MenuItem value="medico">Médicos</MenuItem>
        </Select>
      </FormControl>

      <Grid container spacing={4}>
        {users.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user.id}>
            <Card sx={{ backgroundColor: '#ffffff', color: '#002333' }}>
              <CardContent>
                <Typography variant="h6">
                  {user.first_name} {user.last_name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6c757d' }}>{user.email}</Typography>
                <Chip
                  label={userType}
                  color={getRoleColor(userType)}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleEditClick(user)} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(user.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Diálogo de Verificación */}
      <Dialog open={verifyDialogOpen} onClose={() => setVerifyDialogOpen(false)}>
        <DialogTitle>Verifica tu contraseña</DialogTitle>
        <DialogContent>
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            value={verifyPassword}
            onChange={(e) => setVerifyPassword(e.target.value)}
            autoFocus
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleVerifyPassword} variant="contained">
            Verificar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Edición */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          <TextField label="Nombre" name="first_name" fullWidth value={editForm.first_name} onChange={handleFormChange} sx={{ mt: 2 }} />
          <TextField label="Apellido" name="last_name" fullWidth value={editForm.last_name} onChange={handleFormChange} sx={{ mt: 2 }} />
          <TextField label="Email" name="email" fullWidth value={editForm.email} onChange={handleFormChange} sx={{ mt: 2 }} />
          <TextField label="Nueva Contraseña" name="password" fullWidth type="password" value={editForm.password} onChange={handleFormChange} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
};

export default Users;
