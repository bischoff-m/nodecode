

const express = require('express');
import { createServer } from 'http';
import { Server } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '@/types/server';

// Doc: https://stackoverflow.com/questions/66686377/how-to-tie-socket-io-width-express-an-typescript
export default function startServer() {
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
    });
    socket.on('test', (msg) => {
      console.log('received: ', msg);
    })

    socket.emit('test', { 'message': 'hello' })
  });

  // start express server
  httpServer.listen(5000);
}