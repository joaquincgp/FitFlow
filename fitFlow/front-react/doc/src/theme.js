// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#002333', // Azul Marino
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#159A9C',
    },
    background: {
      default: '#DEEFE7', // fondo general
      paper: '#FFFFFF',
    },
    text: {
      primary: '#002333',
      secondary: '#6c757d',
    },
    info: {
      main: '#B4BEC9',
    },
  },
  typography: {
    fontFamily: ['"Roboto"', '"Source Sans Pro"', 'sans-serif'].join(','),
    h4: {
      fontWeight: 700,
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
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
