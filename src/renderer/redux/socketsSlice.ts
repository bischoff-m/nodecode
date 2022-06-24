import { combineReducers, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Vec2D } from '@/types/util'

// TODO: add separate states for keys and positions


export type Socket = {
  nodeKey: string,
  fieldKey: string,
  isInput: boolean,
}

// helper function to generate a unique key for a socket
function keyFromSocket(socket: Socket): string {
  return [
    socket.nodeKey,
    socket.fieldKey,
    socket.isInput ? 'left' : 'right'
  ].join('.')
}

// helper function to generate a socket object from a socket key
function socketFromKey(key: string): Socket {
  const [nodeKey, fieldKey, side] = key.split('.')
  return {
    nodeKey,
    fieldKey,
    isInput: side === 'left',
  }
}


// #############################################################################
// ## POSITION SLICE 
// #############################################################################

type MoveNodePayload = {
  nodeKey: string,
  by: Vec2D,
}

type AddSocketPayload = {
  socket: Socket,
  pos: Vec2D,
}

const initialStatePos: { [key: string]: Vec2D } = {}

export const positionSlice = createSlice({
  name: 'positions',
  initialState: initialStatePos,
  reducers: {
    moveNode: (state, action: PayloadAction<MoveNodePayload>) => {
      Object
        .keys(state)
        .filter(k => k.startsWith(action.payload.nodeKey))
        .forEach(k => {
          state[k].x += action.payload.by.x
          state[k].y += action.payload.by.y
        })
    },
    addSocket: (state, action: PayloadAction<AddSocketPayload>) => {
      const key = keyFromSocket(action.payload.socket)
      if (!state[key])
        state[key] = action.payload.pos
    }
  },
})
export const { moveNode, addSocket } = positionSlice.actions


// #############################################################################
// ## IDENTIFIER SLICE 
// #############################################################################

const initialStateIDs: { [key: string]: Socket } = {}

export const socketsSlice = createSlice({
  name: 'identifiers',
  initialState: initialStateIDs,
  reducers: {
    updateSocket: (state, action: PayloadAction<Socket>) => { // TODO: rename updateSocket
      const key = keyFromSocket(action.payload)
      state[key] = action.payload
    },
  },
})

export const { updateSocket } = socketsSlice.actions


export default combineReducers({
  identifiers: socketsSlice.reducer,
  positions: positionSlice.reducer,
})