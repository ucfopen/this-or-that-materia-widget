import styles from './styles.module.css'
import clsx from 'clsx'
import { ChoiceState } from '../../../whimsical-game/components/GameChoice/GameChoice'

interface BusinessChoiceOverlayProps {
  state: ChoiceState,
  answerFeedback: string,
}

export default function BusinessChoiceOverlay({
  state,
  answerFeedback,
}: BusinessChoiceOverlayProps) {
  const stateStyle = clsx({
    [styles.correct]: state === 'correct',
    [styles.incorrect]: state === 'incorrect',
  })
  const stateImg = state === 'correct' ? 'assets/checkmark.svg' : 'assets/cross.svg'
  const stateText = state === 'correct' ? 'CORRECT' : 'INCORRECT'

  return (
    <div className={clsx([styles.overlay, stateStyle])}>
      <div className={clsx([styles.bullet, stateStyle])}>
        <img src={stateImg} alt="" />
      </div>
      <h3>{stateText}</h3>
      <p>{answerFeedback}</p>
    </div>
  )
}
