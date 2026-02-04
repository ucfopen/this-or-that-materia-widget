import '../../globals.css'
import '../shared/business-vars.css'
import { MediaHandlerContext, MediaHandlerRegisterer } from './media-handler-util'
import store from './redux/store'
import { Provider } from 'react-redux'
import CreatorContent from './CreatorContent'

interface CreatorAppProps {
  title: string | null,
  qset: ThisOrThatQset,
  updateTitle: (newTitle: string) => void,
  registerSaver: (validator: () => ThisOrThatQset | string) => void,
  submitPrompt: (prompt: string) => void,
  registerPromptHandler: (handler: (status: string, resp: string) => void) => void,
  registerMediaHandler: MediaHandlerRegisterer,
  generationAvailable: boolean,
}

export interface CreatorQuestion {
  id: string,
  questionText: string,
  leftAnswer: string,
  rightAnswer: string,
}

export default function CreatorApp(
  { title, qset, updateTitle, registerSaver, submitPrompt, registerPromptHandler, registerMediaHandler, generationAvailable }: CreatorAppProps,
) {
  return (
    <Provider store={store}>
      <MediaHandlerContext.Provider value={registerMediaHandler}>
        <CreatorContent
          initialQset={qset}
          registerSaver={registerSaver}
          title={title}
          setTitle={updateTitle}
        />
      </MediaHandlerContext.Provider>
    </Provider>
  )
}
