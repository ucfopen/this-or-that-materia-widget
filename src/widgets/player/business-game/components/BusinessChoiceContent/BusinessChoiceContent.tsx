import styles from './styles.module.css'
import { ReactNode } from 'react'

interface BusinessChoiceContentProps {
  onSelect: () => void,
  disabled: boolean,
  onHover: (hovered: boolean) => void,
  children: ReactNode,
}

export default function BusinessChoiceContent(
  { onSelect, disabled, onHover, children }: BusinessChoiceContentProps,
) {
  return (
    <button
      className={styles.choiceButton}
      onClick={onSelect}
      disabled={disabled}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}>
      {children}
    </button>
  )
}
