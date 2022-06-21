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
      const p = action.payload
      console.log('moveNode', p)
      for (let key in Object.keys(state).filter(k => k.startsWith(p.nodeKey))) {
        state[key].x += p.by.x
        state[key].y += p.by.y
      }
    },
    addSocket: (state, action: PayloadAction<AddSocketPayload>) => {
      const key = keyFromSocket(action.payload.socket)
      console.log('addSocket', key)
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
      console.log('updateSocket', action.payload)
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