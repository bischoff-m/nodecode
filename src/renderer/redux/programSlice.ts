import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Connection, NodeInstance, NodeProgram, NodeState } from '@/types/NodeProgram'
import { customAlphabet, urlAlphabet } from 'nanoid'
import type { Vec2D } from '@/types/util'

const nanoid = customAlphabet(urlAlphabet, 10)

const getConnectionKey = (pair: Connection) => `${pair.source.socketKey}:${pair.target.socketKey}`

const initialState: NodeProgram = {
  nodes: {},
  connections: {},
}

export const programSlice = createSlice({
  name: 'program',
  initialState: initialState,
  reducers: {
    addNode: (state, action: PayloadAction<{ node: NodeInstance, key?: string }>) => {
      const newKey = action.payload.key || action.payload.node.type + '#' + nanoid()
      state.nodes[newKey] = action.payload.node
    },
    removeNode: (state, action: PayloadAction<string>) => {
      if (!state.nodes[action.payload])
        throw new Error('Node does not exist')
      delete state.nodes[action.payload]
      for (const key in state.connections) {
        if (state.connections[key].source.socketKey === action.payload)
          delete state.connections[key]
        if (state.connections[key].target.socketKey === action.payload)
          delete state.connections[key]
      }
    },
    moveNode: (state, action: PayloadAction<{ key: string, delta: Vec2D }>) => {
      const { key, delta } = action.payload
      if (!state.nodes[key])
        throw new Error('Node does not exist')
      state.nodes[key].display.x += delta.x
      state.nodes[key].display.y += delta.y
    },
    addConnection: (state, action: PayloadAction<Connection>) => {
      // TODO: check if connection ...
      //        ...is valid (source and target exist)
      //        ...has output as source and input as target
      const newKey = getConnectionKey(action.payload)
      for (const key in state.connections)
        if (state.connections[key].target.socketKey === action.payload.target.socketKey)
          delete state.connections[key]
      state.connections[newKey] = action.payload
    },
    removeConnection: (state, action: PayloadAction<Connection>) => {
      const key = getConnectionKey(action.payload)
      if (!state.connections[key])
        throw new Error('Connection does not exist')
      delete state.connections[key]
    },
    setFieldState: (state, action: PayloadAction<{
      nodeKey: string
      fieldKey: string
      newState: NodeState[keyof NodeState]
    }>) => {
      // TODO: add types in JSON Schema, NodePackage.d.ts and NodeProgram.d.ts 
      const { nodeKey, fieldKey, newState } = action.payload
      if (!state.nodes[nodeKey])
        throw new Error('Node does not exist')
      if (!state.nodes[nodeKey].fields[fieldKey])
        console.warn('Field state does not exist, creating new state...')
      state.nodes[nodeKey].fields[fieldKey] = newState
    },
  },
})

export const {
  addNode,
  removeNode,
  moveNode,
  addConnection,
  removeConnection,
  setFieldState,
} = programSlice.actions


export default programSlice.reducer