import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Vec2D } from '@/types/util';

export type Connector = {
  connKey: string,
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
interface ConnectorsState {
  position: Connector[], // TODO: change name
}

// Define the initial state using that type
const initialState: ConnectorsState = {
  position: [],
}

export const connectorSlice = createSlice({
  name: 'connectors',
  initialState,
  reducers: {
    registerConnector: (state, action: PayloadAction<Connector>) => {
      const key = action.payload.connKey;
      const connKeys = state.position.map(item => item.connKey)
      const index = connKeys.indexOf(key)
      if (index !== -1)
        state.position[index] = action.payload
      else
        state.position.push(action.payload)
    },
    moveNode: (state, action: PayloadAction<NodeUpdate>) => {
      const p = action.payload
      state.position.forEach(conn => {
        if (conn.nodeKey === p.nodeKey) {
          conn.pos.x += p.by.x
          conn.pos.y += p.by.y
        }
      })
    },
  },
})

export const { registerConnector, moveNode } = connectorSlice.actions

export default connectorSlice.reducer