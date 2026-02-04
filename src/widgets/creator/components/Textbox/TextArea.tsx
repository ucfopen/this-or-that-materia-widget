import styles from './styles.module.css'
import { ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'

interface TextAreaProps extends ComponentPropsWithoutRef<'textarea'> {
  error?: boolean,
}

export default function TextArea({ error = false, ...rest }: TextAreaProps) {
  return (
    <textarea
      className={clsx({
        [styles.textbox]: true,
        [styles.error]: error,
      })}
      {...rest}
    />
  )
}
