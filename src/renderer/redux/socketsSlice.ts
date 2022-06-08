import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Vec2D } from '@/types/util';

export type Socket = {
  socketKey: string,
  nodeKey: string,
  fieldKey: string,
  pos: Vec2D,
  isInput: boolean,
}

type NodeUpdate = {
  nodeKey: string,
  by: Vec2D,
}

// Define a type for the slice state
interface SocketsState {
  sockets: Socket[],
}

// Define the initial state using that type
const initialState: SocketsState = {
  sockets: [],
}

export const socketsSlice = createSlice({
  name: 'sockets',
  initialState,
  reducers: {
    updateSocket: (state, action: PayloadAction<Socket>) => {
      const key = action.payload.socketKey;
      const socketKeys = state.sockets.map(item => item.socketKey)
      const index = socketKeys.indexOf(key)
      if (index !== -1)
        state.sockets[index] = action.payload
      else
        state.sockets.push(action.payload)
    },
    moveNode: (state, action: PayloadAction<NodeUpdate>) => {
      const p = action.payload
      state.sockets.forEach(socket => {
        if (socket.nodeKey === p.nodeKey) {
          socket.pos.x += p.by.x
          socket.pos.y += p.by.y
        }
      })
    },
  },
})

export const { updateSocket, moveNode } = socketsSlice.actions

export default socketsSlice.reducer