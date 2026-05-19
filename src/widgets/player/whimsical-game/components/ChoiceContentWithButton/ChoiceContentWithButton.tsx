import styles from './styles.module.css'
import clsx from 'clsx'
import { ReactNode } from 'react'
import ChoiceOverlay from '../ChoiceOverlay/ChoiceOverlay'
import { ChoiceState } from '../GameChoice/GameChoice'
import { Button } from '../Button/Button'

interface ChoiceContentWithButtonProps {
  onHover: (hovered: boolean) => void,
  onSelect: () => void,
  state: ChoiceState,
  answerFeedback: string,
  answerText?: string,
  expandable: boolean,
  onExpand?: () => void,
  children: ReactNode,
}

export default function ChoiceContentWithButton({
  onHover, onSelect, state, answerFeedback, answerText = '', expandable, onExpand, children,
}: ChoiceContentWithButtonProps) {
  return (
    <div
      className={clsx([styles.choice])}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div className={styles.choiceContent}>
        {children}
        {expandable && (
          <Button
            style="blue"
            size="s"
            icon="assets/expand.svg"
            onClick={onExpand}>
            Expand
          </Button>
        )}
      </div>
      <div className={styles.choiceButtons}>
        <Button style="secondary" onClick={onSelect} disabled={state != 'unpicked'} aria-label={answerText ? `Select answer: ${answerText}` : undefined}>Select</Button>
      </div>
      <ChoiceOverlay state={state} answerFeedback={answerFeedback} />
    </div>
  )
}
