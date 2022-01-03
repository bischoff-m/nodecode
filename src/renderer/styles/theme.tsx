
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1f6b9a',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#1D1D1D',
      paper: '#303030',
    },
    text: {
      primary: '#E9E9E9',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontSize: 14,
  },
});

theme.components = {
  MuiCard: {
    styleOverrides: {
      root: {
        boxShadow: '0px 0px 5px 0px rgb(0 0 0 / 30%)',
      },
    },
  },
  MuiCardHeader: {
    styleOverrides: {
      root: {
        backgroundColor: theme.palette.primary.main,
      },
    },
  },
}

export default theme