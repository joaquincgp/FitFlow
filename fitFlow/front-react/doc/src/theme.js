// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF6F00',        // Naranja principal
      contrastText: '#FFFFFF', // Texto en botones primarios
    },
    secondary: {
      main: '#1976D2',         // Azul (secundario)
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',      // Fondo general blanco
      paper: '#F9F9F9',        // Papel ligeramente gris claro
    },
    text: {
      primary: '#002333',      // Azul marino oscuro
      secondary: '#6c757d',    // Gris secundario
    },
    info: {
      main: '#FFB74D',         // Naranja claro para mensajes/info
    },
  },
  typography: {
    fontFamily: ['"Roboto"', '"Source Sans Pro"', 'sans-serif'].join(','),
    h4: {
      fontWeight: 700,
      color: '#FF6F00',        // Encabezados h4 en naranja
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
        containedPrimary: {
          backgroundColor: '#FF6F00',
          '&:hover': { backgroundColor: '#E65100' }, // Más oscuro al pasar mouse
        },
        outlinedSecondary: {
          borderColor: '#1976D2',
          color: '#1976D2',
          '&:hover': { borderColor: '#115293', color: '#115293' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
        },
      },
    },
  },
});

export default theme;
