import React from 'react'
import ReactDOM from 'react-dom'

import ScoreScreen from '../../widgets/score_screen/ScoreScreen'

let name = ''

const renderScoreScreen = (qset, scoreTable, title = undefined) => {
  if (title !== undefined) {
    name = title
  }

  const rootElement = document.getElementById('root')
  ReactDOM.createRoot(rootElement).render(
      <ScoreScreen
        qset={qset}
        rawScoreTable={scoreTable}
        reportHeight={(newHeight) => {
          Materia.ScoreCore.setHeight(newHeight)
        }}
      />
  )
}

Materia.ScoreCore.start({
  start: (instance, qset, scoreTable, isPreview, qsetVersion) => {
    renderScoreScreen(qset, scoreTable, instance.name)
  },
  update: (qset, scoreTable) => {
    renderScoreScreen(qset, scoreTable)
  },
})
