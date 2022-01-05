import Node from './components/Node';
import NodeCanvas from './components/NodeCanvas';
import theme from './styles/theme';
import { useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
}));

export default function App() {
  const [num, setNum] = useState(1);

  const classes = useStyles();

  // TODO:
  // https://react-dnd.github.io/react-dnd/about

  return (
    <div style={{ overflow: 'hidden' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <NodeCanvas>
          <button onClick={() => setNum(num == 1 ? 2 : 1)}>Hier</button>
          {
            Array(num).fill(0).map((_, i) => (
              <Node
                key={i}
                x={0}
                y={120 * i + 30}
              ></Node>
            ))
          }
        </NodeCanvas>
      </ThemeProvider>
    </div>
  )
}