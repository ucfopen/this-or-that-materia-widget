import styles from './styles.module.css'
import { ReactNode } from 'react'

interface BusinessChoiceContentProps {
  onSelect: () => void,
  disabled: boolean,
  onHover: (hovered: boolean) => void,
  children: ReactNode,
  onFocus: (focused: boolean) => void,
  answerText?: string,
}

export default function BusinessChoiceContent(
  { onSelect, disabled, onHover, children, onFocus, answerText = '' }: BusinessChoiceContentProps,
) {
  return (
    <button
      className={styles.choiceButton}
      onClick={onSelect}
      disabled={disabled}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
	  onFocus={() => onFocus(true)}
	  onBlur={() => onFocus(false)}
      aria-label={answerText ? `Select answer: ${answerText}` : undefined}>
      {children}
    </button>
  )
}
