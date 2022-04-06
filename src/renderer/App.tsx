import NodeCanvas from '@/components/NodeCanvas';
import theme from '@/styles/theme';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import store from '@/redux/store';




// import WebSocket from 'ws';
// console.log(WebSocket);

// // from https://www.npmjs.com/package/ws - Simple Server
// const wss = new WebSocket.Server({ port: 8080 });

// wss.on('connection', (ws) => {
//   ws.on('message', (data) => {
//     console.log('received: %s', data);
//   });

//   ws.send('something');
// });

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