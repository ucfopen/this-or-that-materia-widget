import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { processQset } from '../../utils.ts'

const CreatorApp = React.lazy(() => import('../../widgets/creator/CreatorRoot'))

// Disable dropping on the window so that the media uploaders work right
window.addEventListener('drop', (e) => {
  if ([...e.dataTransfer.items].some((item) => item.kind === 'file')) {
    e.preventDefault()
  }
})

// State
let currentTitle = ''
let saver = null
let promptHandler = null
let mediaHandler = null

const materiaCallbacks = {}

materiaCallbacks.initNewWidget = (instance) => {
  materiaCallbacks.initExistingWidget('', instance, undefined, 1, true)
}

materiaCallbacks.initExistingWidget = (title, instance, _qset, version, newWidget = false) => {
  processQset(_qset, 'creator')
  const rootElement = document.getElementById('root')

  ReactDOM.createRoot(rootElement).render(
    <Suspense>
      <CreatorApp
        title={title}
        qset={_qset}
        updateTitle={(newTitle) => currentTitle = newTitle}
        registerSaver={(s) => saver = s}
        registerMediaHandler={(h) => mediaHandler = h}
      />
    </Suspense>,
  )
}

materiaCallbacks.onSaveClicked = () => {
  const saverResult = saver()
  console.log(saverResult)

  if (typeof saverResult === 'string') {
    Materia.CreatorCore.cancelSave(saverResult)
    return
  }

  Materia.CreatorCore.save(
    currentTitle,
    saverResult,
  )
}

materiaCallbacks.onPromptResponse = (status, resp) => {
  promptHandler(status, resp)
}

materiaCallbacks.onMediaImportComplete = (arrayOfMedia) => {
  const url = Materia.CreatorCore.getMediaUrl(arrayOfMedia[0].id)
  mediaHandler?.(url)
}

materiaCallbacks.manualResize = false

Materia.CreatorCore.start(materiaCallbacks)
