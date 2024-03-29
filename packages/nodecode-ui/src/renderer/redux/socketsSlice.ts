import { combineReducers, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Socket } from '@/types/NodeProgram'
import type { Vec2D } from '@/types/util'


// helper function to generate a unique key for a socket
function keyFromSocket(socket: Omit<Socket, 'socketKey'>): string {
  return [
    socket.nodeKey,
    socket.fieldKey,
    socket.isInput ? 'left' : 'right'
  ].join('.')
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

export const addNodeMovedListener = (
  callback: OnMoveCallback,
  noodleID: string
) => onMoveCallbacks[noodleID] = callback
export const removeNodeMovedListener = (noodleID: string) => delete onMoveCallbacks[noodleID]

// functions to set state
export function moveNodeSockets(nodeKey: string, by: Vec2D): void {
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

type AddSocketPayload = {
  socket: Omit<Socket, 'socketKey'>,
  pos: Vec2D,
}

const initialStatePos: { [key: string]: Vec2D } = {}

export const positionSlice = createSlice({
  name: 'positions',
  initialState: initialStatePos,
  reducers: {
    moveNodeSocketsStop: (state, action: PayloadAction<string>) => {
      // Synchronize the state with the socketPositions
      Object
        .keys(state)
        .filter(k => k.startsWith(action.payload))
        .forEach(k => {
          state[k].x = socketPositions[k].x
          state[k].y = socketPositions[k].y
        })
    },
    addSocketPos: (state, action: PayloadAction<AddSocketPayload>) => {
      const key = keyFromSocket(action.payload.socket)
      if (!state[key])
        state[key] = action.payload.pos
      if (!socketPositions[key])
        socketPositions[key] = action.payload.pos
    },
    removeSocketPos: (state, action: PayloadAction<Omit<Socket, 'socketKey'>>) => {
      const key = keyFromSocket(action.payload)
      delete state[key]
      delete socketPositions[key]
    },
  },
})
export const {
  moveNodeSocketsStop,
  addSocketPos,
  removeSocketPos
} = positionSlice.actions


// #############################################################################
// ## IDENTIFIER SLICE
// #############################################################################

const initialStateIDs: { [key: string]: Socket } = {}

export const socketsSlice = createSlice({
  name: 'identifiers',
  initialState: initialStateIDs,
  reducers: {
    updateSocket: (state, action: PayloadAction<Omit<Socket, 'socketKey'>>) => {
      const key = keyFromSocket(action.payload)
      state[key] = { socketKey: key, ...action.payload }
    },
    removeSocket: (state, action: PayloadAction<Omit<Socket, 'socketKey'>>) => {
      delete state[keyFromSocket(action.payload)]
    },
  },
})

export const { updateSocket, removeSocket } = socketsSlice.actions


export default combineReducers({
  identifiers: socketsSlice.reducer,
  positions: positionSlice.reducer,
})