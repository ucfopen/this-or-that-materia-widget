import styles from './styles.module.css'
import clsx from 'clsx'
import { ComponentPropsWithoutRef, DragEvent } from 'react'
import WarningTooltip from "../WarningTooltip/WarningTooltip";

interface QuestionButtonProps extends ComponentPropsWithoutRef<'button'> {
  id: string,
  index: number,
  question: string,
  onClick: () => void,
  active: boolean,
  highlight: boolean,
  error: boolean,
}

export default function QuestionButton({ id, index, question, onClick, active, highlight, error, ...rest }: QuestionButtonProps) {
  return (
    <button
      className={clsx({
        [styles.button]: true,
        [styles.active]: active,
        [styles.highlight]: highlight,
        [styles.error]: error,
      })}
      onClick={onClick}
      draggable={true}
      style={{ viewTransitionName: `qbutton-${id}` }}
      {...rest}>
      <div
        className={styles.drag}
      >
        <img src="assets/drag.svg" draggable={false} alt="" />
      </div>
      <div className={styles.questionInfo}>
        <p
          className={clsx({
            [styles.questionNumber]: true,
            [styles.error]: error,
          })}>
          {`Question ${index + 1}`}
        </p>
        <p className={styles.questionText}>
          {question}
          {!question && (
            <span className={styles.noQuestionText}>No question text</span>
          )}
        </p>
      </div>
      {error && (
        <WarningTooltip alt="This question has errors">
          This question has errors
        </WarningTooltip>
      )}
    </button>
  )
}
