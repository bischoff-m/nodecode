import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Coord2D } from '@/types/util';

// Define a type for the slice state
interface ConnectorsState {
  coordinates: { connKey: string, coords: Coord2D }[],
}

// Define the initial state using that type
const initialState: ConnectorsState = {
  coordinates: [],
}

export const connectorSlice = createSlice({
  name: 'connectors',
  initialState,
  reducers: {
    registerConnector: (state, action: PayloadAction<{ connKey: string, coords: Coord2D }>) => {
      const key = action.payload.connKey;
      if (!state.coordinates.map(item => item.connKey).includes(key))
        state.coordinates.push(action.payload);
    },
  },
})

export const { registerConnector } = connectorSlice.actions

export default connectorSlice.reducer