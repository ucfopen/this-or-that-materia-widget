import styles from './styles.module.css'
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react'
import clsx from 'clsx'

type ButtonProps = {
  color?: 'blue' | 'yellow' | 'translucent',
  size?: 'xs' | 's' | 'm' | 'l',
  preIcon?: string,
  postIcon?: string,
  square?: boolean,
  fill?: boolean,
  active?: boolean,
  children?: ReactNode | null,
} & ComponentPropsWithoutRef<'button'>

export const BusinessButton = forwardRef<HTMLButtonElement, ButtonProps>((
  {
    className,
    color = 'yellow',
    size = 'm',
    preIcon,
    postIcon,
    square = false,
    fill = false,
    active = false,
    children = null,
    ...rest
  }: ButtonProps,
  ref,
) => {
  return (
    <button
      className={clsx({
        [styles.button]: true,
        [className]: true,
        [styles.blue]: color === 'blue',
        [styles.yellow]: color === 'yellow',
        [styles.translucent]: color === 'translucent',
        [styles.small]: size === 's',
        [styles.medium]: size === 'm',
        [styles.square]: square,
        [styles.fill]: fill,
        [styles.active]: active,
      })}
      ref={ref}
      {...rest}>
      {preIcon && (
        <img src={preIcon} alt="" />
      )}
      {children}
      {postIcon && (
        <img src={postIcon} alt="" />
      )}
    </button>
  )
})
