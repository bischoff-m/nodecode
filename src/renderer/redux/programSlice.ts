import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Connection, NodeInstance, NodeProgram } from '@/types/NodeProgram'
import { customAlphabet, urlAlphabet } from 'nanoid'

const nanoid = customAlphabet(urlAlphabet, 10)

const initialState: NodeProgram = {
  nodes: {},
  connections: {},
}

export const programSlice = createSlice({
  name: 'program',
  initialState: initialState,
  reducers: {
    addNode: (state, action: PayloadAction<NodeInstance>) => {
      const newKey = action.payload.type + '#' + nanoid()
      state.nodes[newKey] = action.payload
    },
    removeNode: (state, action: PayloadAction<string>) => {
      if (!state.nodes[action.payload])
        throw new Error('Node does not exist')
      delete state.nodes[action.payload]
    },
    addConnection: (state, action: PayloadAction<Connection>) => {
      // TODO: check if connection ...
      //        ...is valid
      //        ...does not already exist
      //        ...has output as source and input as target
      const newKey = 'noodle#' + nanoid()
      state.connections[newKey] = action.payload
    },
    removeConnection: (state, action: PayloadAction<string>) => {
      if (!state.connections[action.payload])
        throw new Error('Connection does not exist')
      delete state.connections[action.payload]
    },
  },
})

export const {
  addNode,
  removeNode,
  addConnection,
  removeConnection,
} = programSlice.actions


export default programSlice.reducer