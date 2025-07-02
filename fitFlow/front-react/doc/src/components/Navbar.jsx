import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, IconButton, Avatar, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ textDecoration: 'none' }}
          component={Link}
          to="/"
          color="inherit"
        >
          Fit Flow
        </Typography>

        {/* ✅ Si es admin, mostrar botón Usuarios */}
        {user && user.role === "Administrador" && (
          <Button color="inherit" component={Link} to="/users" sx={{ ml: 2 }}>
            Usuarios
          </Button>
        )}

        {user && user.role === "Administrador" && (
          <Button color="inherit" component={Link} to="/food-manager" sx={{ ml: 2 }}>
            Alimentos
          </Button>
        )}
        {user && user.role === "Cliente" && (
          <>
            <Button color="inherit" component={Link} to="/my-plans" sx={{ ml: 2 }}>
              Mis Planes
            </Button>
            <Button color="inherit" component={Link} to="/food-log" sx={{ ml: 2 }}>
              Mi Diario
            </Button>
            <Button color="inherit" component={Link} to="/enhanced-planner"  sx={{ ml: 2 }}>
              Planificador Avanzado
            </Button>
          </>
        )}

        {user && user.role === "Nutricionista" && (
          <>
            <Button color="inherit" component={Link} to="/create-plan" sx={{ ml: 2 }}>
              Crear Plan
            </Button>
            <Button color="inherit" component={Link} to="/food-manager" sx={{ ml: 2 }}>
              Alimentos
            </Button>
          </>
        )}


        <Box sx={{ flexGrow: 1 }} /> {/* Esto empuja el contenido siguiente (avatar o botones) a la derecha */}

        {/* ✅ Mostrar avatar y menú si está logueado */}
        {user ? (
          <>
            <IconButton onClick={handleMenuOpen}>
              <Avatar>{user.first_name[0]}</Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
              <MenuItem onClick={handleProfile}>Mi Perfil</MenuItem>
              <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
            </Menu>
          </>
        ) : (
          <>
            {/* ✅ Mostrar botones solo si NO está logueado */}
            <Button color="inherit" onClick={handleMenuOpen}>
              Registrar
            </Button>
            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
              <MenuItem component={Link} to="/register-client" onClick={handleMenuClose}>
                Cliente
              </MenuItem>
              <MenuItem component={Link} to="/register-nutritionist" onClick={handleMenuClose}>
                Nutricionista
              </MenuItem>
              <MenuItem component={Link} to="/register-admin" onClick={handleMenuClose}>
                Administrador
              </MenuItem>
            </Menu>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
