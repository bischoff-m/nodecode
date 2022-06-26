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
// ## POSITION SLICE THAT IS UPDATED WHENEVER POSSIBLE WITH MANUAL UPDATES
// #############################################################################

// state (the same as for positionSlice but updated more frequently)
export const socketPositions: { [key: string]: Vec2D } = {}

// functions to listen to state updates
type OnMoveCallback = (
  nodeKey: string,
  by: { x: number; y: number },
) => void

const onMoveCallbacks: { [noodleID: string]: OnMoveCallback } = {}

export const onMoveNode = (callback: OnMoveCallback, noodleID: string) => onMoveCallbacks[noodleID] = callback
export const removeOnMoveNode = (noodleID: string) => delete onMoveCallbacks[noodleID]

// functions to set state
export function moveNode(nodeKey: string, by: Vec2D): void {
  Object
    .keys(socketPositions)
    .filter(k => k.startsWith(nodeKey))
    .forEach(k => socketPositions[k] = {
      x: socketPositions[k].x + by.x,
      y: socketPositions[k].y + by.y
    })
  Object.values(onMoveCallbacks).forEach(callback => callback(nodeKey, by))
}

// #############################################################################
// ## POSITION SLICE THAT IS UPDATED ONLY WHEN NEEDED
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
    moveNodeStop: (state, action: PayloadAction<MoveNodePayload>) => {
      Object
        .keys(state)
        .filter(k => k.startsWith(action.payload.nodeKey))
        .forEach(k => {
          state[k].x += action.payload.by.x
          state[k].y += action.payload.by.y
          socketPositions[k].x = state[k].x
          socketPositions[k].y = state[k].y
        })
    },
    addSocketPos: (state, action: PayloadAction<AddSocketPayload>) => {
      const key = keyFromSocket(action.payload.socket)
      if (!state[key])
        state[key] = action.payload.pos
      if (!socketPositions[key])
        socketPositions[key] = action.payload.pos
    }
  },
})
export const { moveNodeStop, addSocketPos } = positionSlice.actions


// #############################################################################
// ## IDENTIFIER SLICE
// #############################################################################

const initialStateIDs: { [key: string]: Socket } = {}

export const socketsSlice = createSlice({
  name: 'identifiers',
  initialState: initialStateIDs,
  reducers: {
    updateSocket: (state, action: PayloadAction<Socket>) => {
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