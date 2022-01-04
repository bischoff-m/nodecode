import Node from './Node';
import theme from './styles/theme';
import './styles/App.css';

import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';


export default function App() {
  return (
    <Container className='canvas'>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <Node></Node>
      </ThemeProvider>
    </Container>
  )
}