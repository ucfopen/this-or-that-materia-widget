import styles from './styles.module.css'
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react'
import clsx from 'clsx'

type ButtonProps = {
  style?: 'primary' | 'secondary' | 'red' | 'blue',
  size?: 'xs' | 's' | 'm' | 'l',
  icon?: string,
  square?: boolean,
  children?: ReactNode | null,
} & ComponentPropsWithoutRef<'button'>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((
  {
    className,
    style = 'primary',
    size = 'm',
    icon,
    square = false,
    children = null,
    ...rest
  }: ButtonProps,
  ref,
) => {
  return (
    <button
      ref={ref}
      className={clsx({
        [styles.button]: true,
        [className]: !!className,
        [styles.primary]: style === 'primary',
        [styles.secondary]: style === 'secondary',
        [styles.red]: style === 'red',
        [styles.blue]: style === 'blue',
        [styles.xsmall]: size === 'xs',
        [styles.small]: size === 's',
        [styles.medium]: size === 'm',
        [styles.large]: size === 'l',
        [styles.square]: square,
      })}
      {...rest}>
      {icon && <img src={icon} alt="" /> }
      {children}
    </button>
  )
})
