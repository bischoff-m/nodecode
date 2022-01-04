import Node from './Node';
import theme from './styles/theme';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const useStyles = makeStyles(() => ({
  container: {
    'height': '100%',
    backgroundColor: theme.palette.background.default,
  },
  panWrapper: {
    'width': '100vw',
    'height': '100vh',
    backgroundColor: theme.palette.background.default,
  },
}));

export default function App() {
  const classes = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <div className={classes.container}>
        <TransformWrapper
          limitToBounds={false}
          minScale={0.5}
          maxScale={3}
        >
          <TransformComponent>
            <div className={classes.panWrapper}>
            <Node></Node>
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </ThemeProvider>
  )
}