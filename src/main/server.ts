

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
      ipcMain.removeAllListeners('toBackend')
      ipcMain.removeHandler('toBackend')
    });

    socket.onAny((eventName, ...args) => {
      win.webContents.send('fromBackend', ...args)
      console.log('event from backend: ', args)
    })

    // TODO: check if toBackend handler has already been registered and never unregister
    //       check if backend is connected before socket.emit

    // SEND WITHOUT RETURN VALUE
    // relay event from renderer process to backend without expecting a response
    ipcMain.on('toBackend', (ipcEvent, backendEvent) => {
      // check if object given by the renderer process has needed properties 
      if (!backendEvent.hasOwnProperty('name'))
        throw new Error('Did not provide name property in toBackend event.')
      let args = backendEvent.hasOwnProperty('args') ? backendEvent.args : []

      // send event to backend without callback
      socket.emit(
        backendEvent.name,
        ...args
      )
    })

    // SEND WITH RETURN VALUE
    // relay event from renderer process to backend and pass response from backend back to renderer
    ipcMain.handle('toBackend', (ipcEvent, backendEvent) => {
      // return a promise that resolves to the data returned by the backend on success
      return new Promise((resolve, reject) => {
        // check if object given by the renderer process has needed properties 
        if (!backendEvent.hasOwnProperty('name'))
          reject(new Error('Did not provide name property in toBackend event.'))
        let args = backendEvent.hasOwnProperty('args') ? backendEvent.args : []

        // send event to backend and resolve using the data returned by the backend
        socket.emit(
          backendEvent.name,
          ...args,
          (data: any) => resolve(data)
        )
        // if the given timeout expires, reject the promise
        if (backendEvent.hasOwnProperty('timeout'))
          setTimeout(() => reject(new Error('Timeout when sending event from main to backend.')), backendEvent.timeout)
      })
    })
  });

  // start express server
  httpServer.listen(5000);
}