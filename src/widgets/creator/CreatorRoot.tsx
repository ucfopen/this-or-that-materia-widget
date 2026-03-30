import '../shared/globals.css'
import '../shared/business-globals.css'
import { MediaHandlerContext, MediaHandlerRegisterer } from './media-handler-util'
import store from './redux/store'
import { Provider } from 'react-redux'
import CreatorApp from './CreatorApp'

interface CreatorRootProps {
  title: string | null,
  qset: ThisOrThatQset,
  updateTitle: (newTitle: string) => void,
  registerSaver: (validator: () => ThisOrThatQset | string) => void,
  registerMediaHandler: MediaHandlerRegisterer,
}

export default function CreatorRoot(
  { title, qset, updateTitle, registerSaver, registerMediaHandler }: CreatorRootProps,
) {
  return (
    <Provider store={store}>
      <MediaHandlerContext.Provider value={registerMediaHandler}>
        <CreatorApp
          initialQset={qset}
          registerSaver={registerSaver}
          title={title}
          updateTitle={updateTitle}
        />
      </MediaHandlerContext.Provider>
    </Provider>
  )
}
