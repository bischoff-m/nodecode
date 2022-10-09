import { configureStore } from '@reduxjs/toolkit'
import programReducer from '@/redux/programSlice'
import socketsReducer from '@/redux/socketsSlice'

const store = configureStore({
  reducer: {
    sockets: socketsReducer,
    program: programReducer,
  },
})
export default store

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch