import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Vec2D } from '@/types/util'

export type SocketNoKey = {
  nodeKey: string,
  fieldKey: string,
  pos: Vec2D,
  isInput: boolean,
}

export type Socket = SocketNoKey & {
  key: string,
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
    updateSocket: (state, action: PayloadAction<SocketNoKey>) => {
      const payload = {
        ...action.payload,
        key: [
          action.payload.nodeKey,
          action.payload.fieldKey,
          action.payload.isInput ? 'left' : 'right'
        ].join('.')
      } as Socket
      const socketKeys = state.sockets.map(item => item.key)
      const index = socketKeys.indexOf(payload.key)
      if (index !== -1)
        state.sockets[index] = payload
      else
        state.sockets.push(payload)
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