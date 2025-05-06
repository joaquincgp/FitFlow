import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, IconButton, Avatar } from '@mui/material';
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
          sx={{ flexGrow: 1, cursor: 'pointer', textDecoration: 'none' }}
          component={Link}
          to="/"
          color="inherit"
        >
          Fit Flow
        </Typography>

        {/* ✅ Mostrar solo si es admin */}
        {user && user.role === "Administrador" ? (
          <>
            <Button color="inherit" component={Link} to="/users">
              Usuarios
            </Button>
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
            {/* ⚠️ Esto se muestra solo si NO es admin */}
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
