

const express = require('express')
import { createServer } from 'http'
import { Server } from 'socket.io'
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '@/types/server'
import { BrowserWindow, ipcMain } from 'electron'

// Doc: https://stackoverflow.com/questions/66686377/how-to-tie-socket-io-width-express-an-typescript
export default function startServer(win: BrowserWindow) {
  // Express server
  const expressApp = express()
  const httpServer = createServer(expressApp)

  expressApp.get('/', (req: any, res: any) => {
    res.send('Please connect using <a href="https://socket.io/">socket.io</a>')
  })

  // Socket.io server
  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer)

  io.on('connection', (socket) => {
    console.log('user connected')

    // TODO: check that the listeners are always removed when the socket is disconnected
    //       check if backend is connected before socket.emit

    ////////////////////////////////////////////////////////////////////////////////
    // FROM BACKEND TO RENDERER
    ////////////////////////////////////////////////////////////////////////////////
    socket.on('disconnect', () => {
      console.log('user disconnected')
      ipcMain.removeAllListeners('toBackend')
      ipcMain.removeHandler('toBackend')
    })

    socket.onAny((channel, ...args) => {
      win.webContents.send('fromBackend', channel, ...args)
    })


    ////////////////////////////////////////////////////////////////////////////////
    // FROM RENDERER TO BACKEND
    ////////////////////////////////////////////////////////////////////////////////

    // SEND WITHOUT RETURN VALUE
    // relay event from renderer process to backend without expecting a response
    ipcMain.on('toBackend', (_, channel, ...args) => {
      socket.emit(channel, ...args)
    })

    // SEND WITH RETURN VALUE
    // relay event from renderer process to backend and pass response from backend back to renderer
    ipcMain.handle('toBackend', (_, channel, timeout, ...args) => {
      // return a promise that resolves to the data returned by the backend on success
      return new Promise((resolve, reject) => {
        // send event to backend and resolve using the data returned by the backend
        socket.emit(
          channel,
          ...args,
          (data: any) => resolve(data) // callback that is called by the backend on success
        )
        // if the given timeout expires, reject the promise
        timeout > 0 && setTimeout(() => reject(new Error('Timeout when sending event from main to backend.')), timeout)
      })
    })
  })

  // start express server
  httpServer.listen(5000)
}