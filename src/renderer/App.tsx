import NodeCanvas from '@/components/NodeCanvas';
import theme from '@/styles/theme';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import store from '@/redux/store';
import { Button } from '@mui/material';

// TODO: connect http server and socket.io to frontend via ipc

window.api.on('fromBackend', (data) => {
  console.log('sent from backend to renderer:', data)
})

export default function App() {
  return (
    <div style={{ overflow: 'hidden' }}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          <div style={{
            position: 'absolute',
            zIndex: 10000,
            right: 0,
            backgroundColor: '#202020',
          }}>
            <Button onClick={() => window.api.send('runBackend')}>RUN</Button>
            <Button onClick={() => window.api.send('quitBackend')}>QUIT</Button>
          </div>
          <NodeCanvas />
        </ThemeProvider>
      </Provider>
    </div>
  )
}