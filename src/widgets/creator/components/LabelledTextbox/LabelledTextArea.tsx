import styles from './styles.module.css'
import { ComponentPropsWithRef, useId } from 'react'
import TextArea from '../Textbox/TextArea'

interface LabelledTextAreaProps extends ComponentPropsWithRef<typeof TextArea> {
  label: string,
}

export default function LabelledTextArea({ label, ...rest }: LabelledTextAreaProps) {
  const id = useId()

  return (
    <div className={styles.labelledTextboxContainer}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <TextArea {...rest} />
    </div>
  )
}
