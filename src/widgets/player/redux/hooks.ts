import { useDispatch, useSelector } from 'react-redux'
import { RootState, ThisOrThatDispatch } from './store'

export const useThisOrThatDispatch = useDispatch.withTypes<ThisOrThatDispatch>()
export const useThisOrThatSelector = useSelector.withTypes<RootState>()
