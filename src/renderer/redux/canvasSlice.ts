import { Vec2D } from '@/types/util'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Define a type for the slice state
interface CanvasState {
  zoom: number,
  origin: Vec2D,
  originZoomed: Vec2D,
}

// Define the initial state using that type
const initialState: CanvasState = {
  zoom: 1,
  origin: { x: 0, y: 0 },
  originZoomed: { x: 0, y: 0 },
}

export const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setZoom: (state, action: PayloadAction<number>) => {
      const newZoom = action.payload
      if (newZoom > 0)
        state.zoom = newZoom
    },
    setOrigin: (state, action: PayloadAction<Vec2D>) => {
      state.origin = action.payload
    },
    setOriginZoomed: (state, action: PayloadAction<Vec2D>) => {
      state.originZoomed = action.payload
    },
  },
})

export const { setZoom, setOrigin, setOriginZoomed } = canvasSlice.actions

export default canvasSlice.reducer