import styles from './styles.module.css'
import { ComponentPropsWithRef, ReactNode, useId } from 'react'
import Textbox from '../Textbox/Textbox'
import HelpTooltip from '../HelpTooltip/HelpTooltip'

interface LabelledTextboxProps extends ComponentPropsWithRef<typeof Textbox> {
  label: string | ReactNode,
  tooltip?: string,
}

export default function LabelledTextbox({ label, tooltip = null, ...rest }: LabelledTextboxProps) {
  const id = useId()

  return (
    <div className={styles.labelledTextboxContainer}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {tooltip && (
          <HelpTooltip>{tooltip}</HelpTooltip>
        )}
      </label>
      <Textbox {...rest} />
    </div>
  )
}
