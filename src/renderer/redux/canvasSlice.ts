import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define a type for the slice state
interface CanvasState {
  zoom: number,
}

// Define the initial state using that type
const initialState: CanvasState = {
  zoom: 1,
}

export const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setZoom: (state, action: PayloadAction<number>) => {
      const newZoom = action.payload;
      if (newZoom > 0)
        state.zoom = newZoom;
    },
  },
})

export const { setZoom } = canvasSlice.actions

export default canvasSlice.reducer