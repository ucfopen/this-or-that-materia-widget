import styles from './styles.module.css'
import { ReactNode } from 'react'
import clsx from 'clsx'

interface InsetBoxProps {
  className?: string,
  alignCenter?: boolean,
  children: ReactNode,
}

export default function InsetBox({ className = '', alignCenter = false, children }: InsetBoxProps) {
  return (
    <div
      className={clsx({
        [styles.insetBox]: true,
        [styles.alignCenter]: alignCenter,
        [className]: true,
      })}>
      {children}
    </div>
  )
}
