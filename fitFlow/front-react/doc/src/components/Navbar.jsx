import { AppBar, Toolbar, Typography, Button, Menu, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import React, { useState } from 'react';

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

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

        <Button color="inherit" onClick={handleOpen}>Registrar</Button>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem component={Link} to="/register-client" onClick={handleClose}>Cliente</MenuItem>
          <MenuItem component={Link} to="/register-nutritionist" onClick={handleClose}>Nutricionista</MenuItem>
          <MenuItem component={Link} to="/register-admin" onClick={handleClose}>Administrador</MenuItem>
        </Menu>
        <Button color="inherit" component={Link} to="/login">Login</Button>
      </Toolbar>
    </AppBar>
  );
}
