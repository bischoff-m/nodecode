import Node from './Node';
import theme from './styles/theme';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';

import panzoom from 'panzoom';
import { useState, useEffect, useRef } from "react";

const useStyles = makeStyles(() => ({
  container: {
    'width': '100%',
    'height': '100%',
    backgroundColor: theme.palette.background.default,
    '& > div': {
      'width': '100vw',
      'height': '100vh',
    }
  },
}));

export default function App() {
  const panContainer = useRef(null);
  const [num, setNum] = useState(1);

  // TODO: replace library with own script similar to:
  // panzoom/lib/domController/makeDomController/applyTransform
  // https://react-dnd.github.io/react-dnd/about
  useEffect(() => {
    console.log('Called panzoom.')
    if (panContainer.current)
      panzoom(panContainer.current, {
        zoomDoubleClickSpeed: 1,
        onDoubleClick: (e) => false,
        beforeMouseDown: (e) => e.button !== 1,
        filterKey: () => true,
      });
  });

  const classes = useStyles();
  return (
    <div style={{ overflow: 'hidden' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <div className={classes.container} ref={panContainer}>
          <div>
            <button onClick={() => setNum(num + 1)}>Hier</button>
            {
              Array(num).fill(0).map((_, i) => (
                <Node
                  key={i}
                  x={Math.floor(Math.random() * 500)}
                  y={Math.floor(Math.random() * 500)}
                ></Node>
              ))
            }
          </div>
        </div>
      </ThemeProvider>
    </div>
  )
}