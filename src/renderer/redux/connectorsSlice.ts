import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Coord2D } from '@/types/util';

export type Connector = {
  connKey: string,
  nodeKey: string,
  fieldKey: string,
  coords: Coord2D,
  isInput: boolean,
}

type NodeUpdate = {
  nodeKey: string,
  by: Coord2D,
}

// Define a type for the slice state
interface ConnectorsState {
  coordinates: Connector[], // TODO: change name
}

// Define the initial state using that type
const initialState: ConnectorsState = {
  coordinates: [],
}

export const connectorSlice = createSlice({
  name: 'connectors',
  initialState,
  reducers: {
    registerConnector: (state, action: PayloadAction<Connector>) => {
      const key = action.payload.connKey;
      if (!state.coordinates.map(item => item.connKey).includes(key))
        state.coordinates.push(action.payload);
    },
    moveNode: (state, action: PayloadAction<NodeUpdate>) => {
      const p = action.payload
      state.coordinates.forEach(conn => {
        if (conn.nodeKey === p.nodeKey) {
          conn.coords.x += p.by.x
          conn.coords.y += p.by.y
        }
      })
    },
  },
})

export const { registerConnector, moveNode } = connectorSlice.actions

export default connectorSlice.reducer