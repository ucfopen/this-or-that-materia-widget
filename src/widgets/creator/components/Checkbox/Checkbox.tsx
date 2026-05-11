import styles from './styles.module.css'
import { ChangeEvent, ComponentPropsWithRef, ReactNode } from 'react'
import clsx from 'clsx'
import HelpTooltip from '../HelpTooltip/HelpTooltip'

interface CheckboxProps extends ComponentPropsWithRef<'input'> {
  tooltip?: string,
  checked: boolean,
  onChange: (e: ChangeEvent<HTMLInputElement>) => void,
  disabled?: boolean,
  children: ReactNode,
}

export default function Checkbox({
  tooltip = null,
  checked,
  disabled = false,
  children,
  ...rest
}: CheckboxProps) {
  return (
    <label
      className={clsx({
        [styles.checkboxContainer]: true,
        [styles.disabled]: disabled,
      })}>
      <input
        type="checkbox"
        style={{ appearance: 'none', position: 'absolute' }}
        checked={checked}
        disabled={disabled}
        {...rest}
      />
      <span
        className={clsx({
          [styles.checkbox]: true,
          [styles.checked]: checked,
        })}>
        {checked && <img src="assets/checkmark.svg" alt="" />}
      </span>
      {children}
      {tooltip && (
        <HelpTooltip>{tooltip}</HelpTooltip>
      )}
    </label>
  )
}
