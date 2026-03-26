import { createContext, useContext } from 'react'

export type MediaHandlerRegisterer = (handler: (mediaUrl: string) => void) => void
// creates a global 'MediaHandlerContext' context that can only hold values of the above defined type, or null
export const MediaHandlerContext = createContext<MediaHandlerRegisterer | null>(null)
export const useRegisterMediaHandler = () => {
  return useContext(MediaHandlerContext)
}
