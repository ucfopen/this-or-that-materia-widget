import React from 'react'
import ReactDOM from 'react-dom'
import { processQset } from '../../utils.ts'

import CreatorApp from '../../widgets/creator/CreatorRoot'

// Disable dropping on the window so that the media uploaders work right
window.addEventListener('drop', (e) => {
  if ([...e.dataTransfer.items].some((item) => item.kind === 'file')) {
    e.preventDefault()
  }
})

// State
let currentTitle = 'My This or That Widget'
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
    <CreatorApp
      title={title}
      qset={_qset}
      updateTitle={(newTitle) => currentTitle = newTitle}
      registerSaver={(s) => saver = s}
      registerMediaHandler={(h) => mediaHandler = h}
    />
  )
}

materiaCallbacks.onSaveClicked = () => {
  const saverResult = saver()

  if (typeof saverResult === 'string') {
    Materia.CreatorCore.cancelSave(saverResult)
    return
  }

  Materia.CreatorCore.save(
    currentTitle === '' ? 'My This or That Widget' : currentTitle,
    saverResult,
    saverResult.version
  )
}

materiaCallbacks.onPromptResponse = (status, resp) => {
  promptHandler(status, resp)
}

materiaCallbacks.onMediaImportComplete = (arrayOfMedia) => {
  const url = Materia.CreatorCore.getMediaUrl(arrayOfMedia[0].id)
  mediaHandler?.(arrayOfMedia[0].id, url)
}

materiaCallbacks.manualResize = false

Materia.CreatorCore.start(materiaCallbacks)
