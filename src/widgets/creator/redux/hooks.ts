import { useDispatch, useSelector } from 'react-redux'
import { RootState, ThisOrThatCreatorDispatch } from './store'

export const useThisOrThatCreatorDispatch = useDispatch.withTypes<ThisOrThatCreatorDispatch>()
export const useThisOrThatCreatorSelector = useSelector.withTypes<RootState>()
