import '../../../globals.css'
import '../player_globals.css'
import '../../../variables.css'
import { QsetContext } from '../contexts'
import PlayerApp from '../PlayerApp/PlayerApp'
import { Provider } from 'react-redux'
import store from '../redux/store'

type PlayerLayoutProps = {
  qset: ThisOrThatQset,
  onEnd: () => void,
  submitQuestionForScoring: (id: string, answers: string, value: string) => void,
}

export default function PlayerLayout({ qset, submitQuestionForScoring, onEnd }: PlayerLayoutProps) {
  return (
    <Provider store={store}>
      <QsetContext.Provider value={qset}>
        <PlayerApp onEnd={onEnd} submitQuestionForScoring={submitQuestionForScoring} />
      </QsetContext.Provider>
    </Provider>
  )
}
