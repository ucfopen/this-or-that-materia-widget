import { configureStore } from '@reduxjs/toolkit'
import creatorStateReducer from './creatorSlice'

const store = configureStore({
  reducer: {
    creatorState: creatorStateReducer,
  },
})

export default store
export type RootState = ReturnType<typeof store.getState>
export type ThisOrThatCreatorDispatch = typeof store.dispatch
