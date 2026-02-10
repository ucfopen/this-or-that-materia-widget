import '../shared/globals.css'
import { Provider } from 'react-redux'
import store from './redux/store'
import { QsetContext } from './contexts'
import PlayerApp from './PlayerApp'

type PlayerRootProps = {
  qset: ThisOrThatQset,
  onEnd: () => void,
  submitQuestionForScoring: (id: string, answers: string, value: string) => void,
}

export default function PlayerRoot({ qset, submitQuestionForScoring, onEnd }: PlayerRootProps) {
  return (
    <Provider store={store}>
      <QsetContext.Provider value={qset}>
        <PlayerApp onEnd={onEnd} submitQuestionForScoring={submitQuestionForScoring} />
      </QsetContext.Provider>
    </Provider>
  )
}
