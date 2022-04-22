// Use the definitions in this file using
// import { Theme } from '@mui/material';
// import { makeStyles } from '@mui/styles';
// const useStyles = makeStyles((theme: Theme) => ({
//    // your styles here
// }));
//
// and in your component
// const classes = useStyles();
// return (<div className={classes.example}>)
//
// Documentation
// https://mui.com/material-ui/customization/theming/
// https://mui.com/material-ui/customization/default-theme/

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

}

export default theme