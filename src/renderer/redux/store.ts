import { configureStore } from '@reduxjs/toolkit'
import socketsReducer from '@/redux/socketsSlice'
import canvasReducer from '@/redux/canvasSlice'

const store = configureStore({
  reducer: {
    sockets: socketsReducer,
    canvas: canvasReducer,
  },
})
export default store

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch