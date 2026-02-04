import ReactDOM from 'react-dom'
import { Suspense } from 'react'
import { processQset } from '../../utils.ts'

const PlayerLayout = React.lazy(() => import('../../widgets/player/PlayerLayout/PlayerLayout'))

Materia.Engine.start({
  start: (instance, qset) => {
    processQset(qset, 'player')

    const rootElement = document.getElementById('root')
    ReactDOM.createRoot(rootElement).render(
      <Suspense>
        <PlayerLayout
          qset={qset}
          onEnd={() => {
            Materia.Engine.end()
          }}
          submitQuestionForScoring={(id, answers, value) => {
            Materia.Score.submitQuestionForScoring(id, answers, value)
          }}
        />
      </Suspense>
      ,
    )
  },
})
