import styles from './styles.module.css'
import { ReactNode, useState } from 'react'
import TooltipBox from '../TooltipBox/TooltipBox'

interface TooltipProps {
  children: ReactNode,
}

export default function HelpTooltip({ children }: TooltipProps) {
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
      <img src="assets/question.svg" alt="More info" />

      <TooltipBox show={showTooltip}>
        {children}
      </TooltipBox>
    </div>
  )
}
