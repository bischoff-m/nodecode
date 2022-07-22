import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { NodeInstance, NodeProgram } from '@/types/NodeProgram'
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
      const newNodeKey = action.payload.type + '#' + nanoid()
      state.nodes[newNodeKey] = action.payload
    },
  },
})

export const { addNode } = programSlice.actions


export default programSlice.reducer