import styles from './styles.module.css'
import clsx from 'clsx'
import { ChoiceState } from '../GameChoice/GameChoice'

interface ChoiceOverlayProps {
  state: ChoiceState,
  answerFeedback: string,
}

export default function ChoiceOverlay({
  state,
  answerFeedback,
}: ChoiceOverlayProps) {
  const stateStyle = clsx({
    [styles.correct]: state === 'correct',
    [styles.incorrect]: state === 'incorrect',
  })

  const stateText = state === 'correct' ? 'Correct!' : 'Incorrect!'

  if (state === 'unpicked') return null

  return (
    <div className={clsx([styles.overlay, stateStyle])}>
      <h3 className={styles.title}>{stateText}</h3>
      { !!answerFeedback ? <p className={styles.feedback}>{answerFeedback}</p> : <></> }
    </div>
  )
}
