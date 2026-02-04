import { configureStore } from '@reduxjs/toolkit'
import gameStateReducer from './gameSlice'

const store = configureStore({
  reducer: {
    gameState: gameStateReducer,
  },
})

export default store
export type RootState = ReturnType<typeof store.getState>
export type ThisOrThatDispatch = typeof store.dispatch
