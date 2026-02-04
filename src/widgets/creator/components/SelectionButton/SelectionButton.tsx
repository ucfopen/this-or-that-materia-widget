import styles from './styles.module.css'
import { ComponentPropsWithRef, ReactNode } from 'react'
import clsx from 'clsx'

interface SelectionButtonProps extends ComponentPropsWithRef<'button'> {
  icon: string,
  active: boolean,
  children: ReactNode,
}

export default function SelectionButton({ icon, active, children, ...rest }: SelectionButtonProps) {
  return (
    <button
      className={clsx({
        [styles.selectionButton]: true,
        [styles.active]: active,
      })}
      {...rest}>
      <img
        className={clsx({
          [styles.icon]: true,
          [styles.fade]: !active,
        })}
        src={icon}
        alt=""
      />
      {children}
    </button>
  )
}
