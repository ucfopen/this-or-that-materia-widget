import styles from './styles.module.css'
import clsx from 'clsx'
import { ReactNode } from 'react'
import ChoiceOverlay from '../ChoiceOverlay/ChoiceOverlay'
import { ChoiceState } from '../GameChoice/GameChoice'
import { Button } from '../Button/Button'

interface ChoiceContentProps {
  onHover: (hovered: boolean) => void,
  onSelect: () => void,
  state: ChoiceState,
  answerFeedback: string,
  answerText?: string,
  expandable?: boolean,
  onExpand?: () => void,
  children: ReactNode,
}

export default function ChoiceContent({
  onHover,
  onSelect,
  state,
  answerFeedback,
  answerText = '',
  expandable = false,
  onExpand = () => {},
  children,
}: ChoiceContentProps) {
  return (
    <div
      className={styles.choice}
    >
      <button
        className={styles.button}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onClick={onSelect}
        disabled={state != 'unpicked'}
        aria-label={answerText ? `Select answer: ${answerText}` : undefined}
      >
        {children}
        <ChoiceOverlay state={state} answerFeedback={answerFeedback} />
      </button>
      {(expandable && state === 'unpicked') && (
        <Button
          className={styles.expandButton}
          style="blue"
          size="m"
          icon="assets/expand.svg"
          onClick={onExpand}
          square
		  aria-label="Click to enlarge this content in a modal"
        />
      )}
    </div>

  )
}
