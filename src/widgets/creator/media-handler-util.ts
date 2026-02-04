import { createContext, useContext } from 'react'

export type MediaHandlerRegisterer = (handler: (mediaUrl: string) => void) => void
export const MediaHandlerContext = createContext<MediaHandlerRegisterer>(null)
export const useRegisterMediaHandler = () => {
  return useContext(MediaHandlerContext)
}
