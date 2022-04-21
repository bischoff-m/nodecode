import NodeCanvas from '@/components/NodeCanvas';
import theme from '@/styles/theme';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import store from '@/redux/store';

// TODO: connect http server and socket.io to frontend via ipc

export default function App() {
  return (
    <div style={{ overflow: 'hidden' }}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          <NodeCanvas />
        </ThemeProvider>
      </Provider>
    </div>
  )
}