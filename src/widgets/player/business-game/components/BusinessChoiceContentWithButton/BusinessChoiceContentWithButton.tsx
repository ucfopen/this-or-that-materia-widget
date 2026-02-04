import styles from './styles.module.css'
import { ReactNode } from 'react'
import { BusinessButton } from '../../../../shared/components/BusinessButton/BusinessButton'

interface BusinessChoiceContentWithButtonProps {
  onSelect: () => void,
  disabled: boolean,
  onHover: (hovered: boolean) => void,
  children: ReactNode,
}

export default function BusinessChoiceContentWithButton(
  { onSelect, disabled, onHover, children }: BusinessChoiceContentWithButtonProps,
) {
  return (
    <div className={styles.contentContainer}>
      <div className={styles.content}>
        {children}
      </div>
      <BusinessButton
        onClick={onSelect}
        disabled={disabled}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}>
        Select
      </BusinessButton>
    </div>
  )
}
