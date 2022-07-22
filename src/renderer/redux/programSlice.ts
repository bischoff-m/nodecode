import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { NodeInstance, NodeProgram } from '@/types/NodeProgram'

const initialState: NodeProgram = {
  nodes: {},
  connections: {},
}

export const programSlice = createSlice({
  name: 'program',
  initialState: initialState,
  reducers: {
    addNode: (state, action: PayloadAction<NodeInstance>) => {
      state.nodes[action.payload.type] = action.payload
    },
  },
})

export const { addNode } = programSlice.actions


export default programSlice.reducer