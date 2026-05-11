import styles from './styles.module.css'
import { ReactNode, useState } from 'react'
import TooltipBox from '../TooltipBox/TooltipBox'

interface WarningTooltipProps {
  children: ReactNode,
  alt: string,
}

export default function WarningTooltip({ alt, children }: WarningTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      className={styles.tooltipRevealer}
      onMouseEnter={() => {
        setShowTooltip(true)
      }}
      onMouseLeave={() => {
        setShowTooltip(false)
      }}
    >
      <img src="assets/warning.svg" alt={alt} />

      <TooltipBox show={showTooltip} align="left">
        {children}
      </TooltipBox>
    </div>
  )
}
