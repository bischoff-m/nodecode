import Node from './Node';
import theme from './styles/theme';
import { DragEvent, MouseEvent } from 'react';

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
  },
  draggable: {
    'width': '100vw',
    'height': '100vh',
    transform: 'matrix(1, 0, 0, 1, 20, 0)',
    backgroundColor: 'red'
  }
}));
var isDragging = false;

export default function App() {
  const panContainer = useRef(null);
  const [num, setNum] = useState(1);
  const [origin, setOrigin] = useState({ x: 50, y: 50 })

  const classes = useStyles();

  // TODO: replace library with own script similar to:
  // panzoom/lib/domController/makeDomController/applyTransform
  // - listener 'onMouseDown' -> activate 'onMouseMove' and 'onMouseUp'
  // - listener 'onMouseMove' -> check if mouse down, then transform
  // - listener 'onMouseUp' -> deactivate 'onMouseMove'
  // https://www.npmjs.com/package/direct-styled
  // https://react-dnd.github.io/react-dnd/about

  function handleMouseMove(e: MouseEvent) {
    e.preventDefault()
    if (!isDragging)
      return
    setOrigin({ x: e.clientX, y: e.clientY })
  }

  return (
    <div style={{ overflow: 'hidden' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <div
          className={classes.container}
          ref={panContainer}
          onMouseDown={(e) => { isDragging = e.button === 1 }}
          onMouseUp={(e) => { isDragging = false }}
          onMouseMove={handleMouseMove}
        >
          <div
            className={classes.draggable}
            style={{ transform: `matrix(1, 0, 0, 1, ${origin.x}, ${origin.y})` }}
          >
            <button onClick={() => setNum(num + 1)}>Hier</button>
            {
              Array(num).fill(0).map((_, i) => (
                <Node
                  key={i}
                  x={0}
                  y={120 * i + 30}
                ></Node>
              ))
            }
          </div>
        </div>
      </ThemeProvider>
    </div>
  )
}