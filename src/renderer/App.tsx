import { useState } from 'react';
import Node from './Node';
import './styles/App.css';
import theme from './styles/theme';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';


export default function App() {
  const [count, setCount] = useState(0)

  return (
    <Container className='canvas'>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <div>
          {count}
        </div>
        <Button variant='contained' onClick={() => setCount(count + 1)}>
          Mein Knopf
        </Button>
        <Node></Node>
      </ThemeProvider>
    </Container>
  )
}