import styles from './styles.module.css'
import InsetBox from '../InsetBox/InsetBox'
import LabelledTextbox from '../LabelledTextbox/LabelledTextbox'
import AnswerEditor from '../AnswerEditor/AnswerEditor'
import clsx from 'clsx'
import { useThisOrThatCreatorDispatch, useThisOrThatCreatorSelector } from '../../redux/hooks'
import {
  deleteCurrentQuestion,
  moveCurrentQuestionDown,
  moveCurrentQuestionUp, selectCurrentQuestionErrors,
  selectCurrentQuestionIndex, selectQuestions,
  setCurrentQuestionText,
} from '../../redux/creatorSlice'
import { selectCurrentQuestion } from '../../redux/creatorSlice'
import { BusinessButton } from '../../../shared/components/BusinessButton/BusinessButton'

export default function QuestionEditor() {
  const dispatch = useThisOrThatCreatorDispatch()
  const questions = useThisOrThatCreatorSelector(selectQuestions)
  const curQuestionIndex = useThisOrThatCreatorSelector(selectCurrentQuestionIndex)
  const curQuestion = useThisOrThatCreatorSelector(selectCurrentQuestion)
  const errors = useThisOrThatCreatorSelector(selectCurrentQuestionErrors)
  console.log(errors)

  return (
    <div className={styles.questionEditorContainer}>
      <div className={styles.questionEditor}>
        <div className={styles.questionHeader}>
          <h2>{`Question ${(curQuestionIndex ?? -2) + 1}`}</h2>
          <div style={{ flex: 1 }} />
          <BusinessButton
            size="s"
            color="translucent"
            preIcon="assets/arrow-up.svg"
            disabled={curQuestionIndex === 0}
            onClick={() => dispatch(moveCurrentQuestionUp())}
          >
            Move Up
          </BusinessButton>
          <BusinessButton
            className={styles.moveDownButton}
            size="s"
            color="translucent"
            preIcon="assets/arrow-up.svg"
            disabled={curQuestionIndex === questions.length - 1}
            onClick={() => dispatch(moveCurrentQuestionDown())}
          >
            Move Down
          </BusinessButton>
          <BusinessButton
            size="s"
            color="translucent"
            preIcon="assets/trash.svg"
            onClick={() => dispatch(deleteCurrentQuestion())}
          >
            Remove Question
          </BusinessButton>
        </div>

        <InsetBox>
          <LabelledTextbox
            label="Question Text"
            placeholder="Enter a question here..."
            value={curQuestion?.questions[0].text}
            onChange={(e) => dispatch(setCurrentQuestionText(e.target.value))}
            error={errors.questionText}
          />
        </InsetBox>

        <div className={styles.answers}>
          <div className={styles.answer}>
            <h3>
              <div className={clsx([styles.bullet, styles.correct])} />
              Correct Choice
            </h3>
            <AnswerEditor side="correct" key={`${curQuestion.id}-correct`} />
          </div>
          <div className={styles.answer}>
            <h3>
              <div className={clsx([styles.bullet, styles.incorrect])} />
              Incorrect Choice
            </h3>
            <AnswerEditor side="incorrect" key={`${curQuestion.id}-incorrect`} />
          </div>
        </div>
      </div>
    </div>
  )
}
