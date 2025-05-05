import {
  AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, IconButton
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileMenu, setProfileMenu] = useState(null);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleHover = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleProfileOpen = (e) => setProfileMenu(e.currentTarget);
  const handleProfileClose = () => setProfileMenu(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'primary.main', boxShadow: 'none' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'background.default' }}>
          .doc
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button component={Link} to="/" sx={{ color: 'background.default', mx: 1 }}>
            Inicio
          </Button>

          {user?.role === 'paciente' && (
            <Button component={Link} to="/medicos" sx={{ color: 'background.default', mx: 1 }}>
              Médicos
            </Button>
          )}

          {!user ? (
            <>
              <Button component={Link} to="/login" sx={{ color: 'background.default', mx: 1 }}>
                Iniciar Sesión
              </Button>
              <Box onMouseEnter={handleHover} onMouseLeave={handleClose}>
                <Button sx={{ color: 'background.default', mx: 1 }}>
                  Registrarse
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  MenuListProps={{ onMouseLeave: handleClose }}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                >
                  <MenuItem component={Link} to="/register?role=paciente" onClick={handleClose}>Pacientes</MenuItem>
                  <MenuItem component={Link} to="/register?role=medico" onClick={handleClose}>Médicos</MenuItem>
                </Menu>
              </Box>
            </>
          ) : (
            <>
              <IconButton onClick={handleProfileOpen} sx={{ color: 'background.default' }}>
                <AccountCircleIcon />
              </IconButton>
              <Menu
                anchorEl={profileMenu}
                open={Boolean(profileMenu)}
                onClose={handleProfileClose}
              >
                <MenuItem onClick={handleProfileClose}>Mi Perfil</MenuItem>
                <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
              </Menu>
            </>
          )}

          <Button component={Link} to="/users" sx={{ color: 'background.default', mx: 1 }}>
            Usuarios
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
