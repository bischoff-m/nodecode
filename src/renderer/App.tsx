import NodeCanvas from '@/components/NodeCanvas';
import theme from '@/styles/theme';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import store from '@/redux/store';
import { Button } from '@mui/material';

type ToBackendEvent = {
  name: string,
  args?: any[],
  timeout?: number,
}

// register listener for incoming events from backend if not already registered
if (window.api.listenerCount('fromBackend') === 0) {
  window.api.on('fromBackend', (event, data) => {
    console.log('sent from backend to renderer:', data)
  })
}

// TODO: check if backend is connected before sending by implementing an event from main to renderer on disconnect
function sendBackend(event: ToBackendEvent): void {
  window.api.send('toBackend', event)
}
function invokeBackend(event: ToBackendEvent): Promise<any> {
  return window.api.invoke('toBackend', event)
}

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
            <Button onClick={() => {
              invokeBackend({
                'name': 'run',
                'args': ['hallo hier mein programm'],
              }).then((data) => {
                console.log('antwort ist zurück: ', data)
              })
            }}>RUN</Button>
            <Button onClick={() => sendBackend({ 'name': 'quit' })}>QUIT</Button>
          </div>
          <NodeCanvas />
        </ThemeProvider>
      </Provider>
    </div>
  )
}