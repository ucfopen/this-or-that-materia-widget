import styles from './styles.module.css'
import { ComponentPropsWithRef } from 'react'
import clsx from 'clsx'

interface TextboxProps extends ComponentPropsWithRef<'input'> {
  error?: boolean,
}

export default function Textbox({ error = false, ...rest }: TextboxProps) {
  return (
    <input
      className={clsx({
        [styles.textbox]: true,
        [styles.error]: error,
      })}
      type="text"
      {...rest}
    />
  )
}
