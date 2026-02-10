import styles from './styles.module.css'
import clsx from 'clsx'

export interface HandState {
  raised: boolean,
  value: 'pointing' | 'correct' | 'incorrect',
}

interface HandsProps {
  left: HandState,
  right: HandState,
  raised: boolean,
}

export default function Hands({ left, right, raised }: HandsProps) {
  return (
    <div
      className={clsx({
        [styles.hands]: true,
        [styles.raised]: raised,
      })}
      aria-hidden
    >
      <div
        className={clsx({
          [styles.hand]: true,
          [styles.left]: true,
          [styles.raised]: left.raised,
          [styles.correct]: left.value === 'correct',
          [styles.incorrect]: left.value === 'incorrect',
        })}
      />
      <div
        className={clsx({
          [styles.hand]: true,
          [styles.right]: true,
          [styles.raised]: right.raised,
          [styles.correct]: right.value === 'correct',
          [styles.incorrect]: right.value === 'incorrect',
        })}
      />
    </div>
  )
}
