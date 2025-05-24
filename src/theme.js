import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#003366', // глубокий синий
      contrastText: '#fff',
    },
    secondary: {
      main: '#2ECC40', // зелёный акцент
    },
    background: {
      default: '#F5F7FA', // светлый фон
      paper: '#fff',
    },
    error: {
      main: '#D32F2F',
    },
    warning: {
      main: '#FF9800',
    },
    success: {
      main: '#2ECC40',
    },
    text: {
      primary: '#222',
      secondary: '#555',
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 24px 0 rgba(0,51,102,0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          boxShadow: '0 2px 8px 0 rgba(0,51,102,0.08)',
          transition: 'background 0.2s',
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #003366 0%, #00539B 100%)',
          '&:hover': {
            background: 'linear-gradient(90deg, #00539B 0%, #003366 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 24px 0 rgba(0,51,102,0.10)',
        },
      },
    },
  },
  typography: {
    fontFamily: 'Segoe UI, Arial, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600 },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
      contrastText: '#fff',
    },
    secondary: {
      main: '#2ECC40',
    },
    background: {
      default: '#181C24',
      paper: '#1a1d23',
    },
    error: {
      main: '#EF5350',
    },
    warning: {
      main: '#FFB300',
    },
    success: {
      main: '#43a047',
    },
    text: {
      primary: '#fff',
      secondary: '#b0b8c9',
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 24px 0 rgba(25,118,210,0.10)',
          background: '#1a1d23',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          boxShadow: '0 2px 8px 0 rgba(25,118,210,0.08)',
          transition: 'background 0.2s',
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #1976d2 0%, #003366 100%)',
          '&:hover': {
            background: 'linear-gradient(90deg, #003366 0%, #1976d2 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 24px 0 rgba(25,118,210,0.10)',
          background: '#1a1d23',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          color: '#fff',
        },
      },
    },
  },
  typography: {
    fontFamily: 'Segoe UI, Arial, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600 },
  },
});

export function getTheme(mode) {
  return mode === 'dark' ? darkTheme : lightTheme;
}

export { lightTheme, darkTheme };
export default getTheme; 