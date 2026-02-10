import styles from './styles.module.css'
import { ReactNode, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

interface TooltipBoxProps {
  show: boolean,
  align?: 'middle' | 'left',
  children: ReactNode,
}

export default function TooltipBox({ show, align = 'middle', children }: TooltipBoxProps) {
  const [animateTooltipOut, setAnimateTooltipOut] = useState<boolean>(false)
  const [internalShow, setInternalShow] = useState(false)
  const tooltipRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (show) {
      if (tooltipRef.current) clearTimeout(tooltipRef.current)
      setInternalShow(true)
    } else {
      setAnimateTooltipOut(true)
      tooltipRef.current = setTimeout(() => {
        setAnimateTooltipOut(false)
        setInternalShow(false)
      }, 100)
    }
  }, [show])

  if (!internalShow) return null

  return (
    <div
      className={clsx({
        [styles.tooltipContainer]: true,
        [styles.closing]: animateTooltipOut,
        [styles.left]: align === 'left',
      })}>
      <div className={styles.tooltipBox}>
        <p>{children}</p>
      </div>
    </div>
  )
}
