import { configureStore } from '@reduxjs/toolkit';
import connectorsReducer from '@/redux/connectorsSlice';
import canvasReducer from '@/redux/canvasSlice';

const store = configureStore({
  reducer: {
    connectors: connectorsReducer,
    canvas: canvasReducer,
  },
})
export default store

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch