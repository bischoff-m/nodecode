

const express = require('express');
import { createServer } from 'http';
import { Server } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '@/types/server';
import { BrowserWindow, ipcMain } from 'electron';

// Doc: https://stackoverflow.com/questions/66686377/how-to-tie-socket-io-width-express-an-typescript
export default function startServer(win: BrowserWindow) {
  // Express server
  const expressApp = express();
  const httpServer = createServer(expressApp);

  expressApp.get('/', (req: any, res: any) => {
    console.log('get /');
    res.send({ uptime: process.uptime() });
  });

  // Socket.io server
  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer);

  io.on('connection', (socket) => {
    console.log('connected!')

    socket.on('disconnect', () => {
      console.log('user disconnected');
      ipcMain.removeHandler('quitBackend')
      ipcMain.removeHandler('runBackend')
    });
    ipcMain.on('quitBackend', () => socket.emit('quit'))
    // TODO: how does this 'callback' argument work? the backend doesnt use it
    ipcMain.on('runBackend', () => socket.emit(
      'run',
      '...program to run...',
      data => win.webContents.send('fromBackend', data)
    ))
  });

  // start express server
  httpServer.listen(5000);
}