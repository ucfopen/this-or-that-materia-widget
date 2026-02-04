import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { processQset } from '../../utils.ts'

const CreatorApp = React.lazy(() => import('../../widgets/creator/CreatorApp.tsx'))

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

  let generationAvailable
  if (newWidget) {
    generationAvailable = instance?.['uses_prompt_generation']
  } else {
    generationAvailable = instance?.widget?.['uses_prompt_generation']
  }

  ReactDOM.createRoot(rootElement).render(
    <Suspense>
      <CreatorApp
        title={title}
        qset={_qset}
        updateTitle={(newTitle) => currentTitle = newTitle}
        registerSaver={(s) => saver = s}
        submitPrompt={(prompt) => Materia.CreatorCore.submitPrompt(prompt)}
        registerPromptHandler={(h) => promptHandler = h}
        registerMediaHandler={(h) => mediaHandler = h}
        generationAvailable={generationAvailable}
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

materiaCallbacks.onQuestionImportComplete = (arrayOfQuestions) => {
  console.log(arrayOfQuestions)
}

materiaCallbacks.onMediaImportComplete = (arrayOfMedia) => {
  const url = Materia.CreatorCore.getMediaUrl(arrayOfMedia[0].id)
  mediaHandler?.(url)
}

materiaCallbacks.manualResize = false

Materia.CreatorCore.start(materiaCallbacks)
