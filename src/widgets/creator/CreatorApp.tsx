import styles from './styles.module.css'
import QuestionButton from './components/QuestionButton/QuestionButton'
import QuestionEditor from './components/QuestionEditor/QuestionEditor'
import { useThisOrThatCreatorDispatch, useThisOrThatCreatorSelector } from './redux/hooks'
import {
  createNewQuestion,
  initCreator, markErrors, moveQuestion, selectCurrentQuestion,
  selectCurrentQuestionIndex, selectErrors, selectQset,
  selectQuestions, selectTitle,
  setCurrentQuestion,
} from './redux/creatorSlice'
import { useEffect, useState, DragEvent } from 'react'
import { flushSync } from 'react-dom'
import SettingsScreen from './components/SettingsScreen/SettingsScreen'
import { BusinessButton } from '../shared/components/BusinessButton/BusinessButton'

interface CreatorContentProps {
  initialQset: ThisOrThatQset,
  registerSaver: (saver: () => ThisOrThatQset | string) => void,
  title: string,
  setTitle: (title: string) => void,
}

export default function CreatorApp({ initialQset, registerSaver, title, setTitle }: CreatorContentProps) {
  const qset = useThisOrThatCreatorSelector(selectQset)
  const curQuestionIndex = useThisOrThatCreatorSelector(selectCurrentQuestionIndex)
  const curQuestion = useThisOrThatCreatorSelector(selectCurrentQuestion)
  const questions = useThisOrThatCreatorSelector(selectQuestions)
  const errors = useThisOrThatCreatorSelector(selectErrors)
  const localTitle = useThisOrThatCreatorSelector(selectTitle)
  const dispatch = useThisOrThatCreatorDispatch()

  const [showSettings, setShowSettings] = useState(false)
  // Initialize game with initial qset
  useEffect(() => {
    dispatch(initCreator(initialQset))
  }, [initialQset])

  // Update saver with latest qset
  useEffect(() => {
    registerSaver(() => {
      dispatch(markErrors())
      // return 'Errors found'
      return qset
    })
    setTitle(localTitle)
  }, [qset, registerSaver, localTitle, setTitle])

  // Question drag/drop reordering
  const [currentlyDragging, setCurrentlyDragging] = useState<string>(null)
  const [currentlyOver, setCurrentlyOver] = useState<string>(null)

  const handleDragStart = (e: DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', toString())
    e.dataTransfer.effectAllowed = 'move'
    setCurrentlyDragging(id)
  }

  const handleDragEnd = () => {
    setCurrentlyDragging(null)
    setCurrentlyOver(null)
  }

  const handleDragOver = (e: DragEvent, id: string) => {
    if (id === currentlyDragging) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setCurrentlyOver(id)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setCurrentlyOver(null)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()

    if ('startViewTransition' in document) {
      document.startViewTransition(() => {
        flushSync(() => {
          dispatch(moveQuestion({ from: currentlyDragging, to: currentlyOver }))
        })
      })
    } else {
      dispatch(moveQuestion({ from: currentlyDragging, to: currentlyOver }))
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.questions}>
        <div className={styles.logoContainer}>
          <img className={styles.logo} src="assets/logo.svg" alt="Logo" />
          {localTitle && <h1 className={styles.title}>{localTitle}</h1>}
          {!localTitle && <h1 className={styles.noTitle}>No Title</h1>}
        </div>
        <BusinessButton
          color="translucent"
          preIcon="assets/settings.svg"
          onClick={() => { setShowSettings(true) }}
          active={showSettings}>
          Settings
        </BusinessButton>

        {questions?.map((question, i) => (
          <QuestionButton
            key={question.id}
            id={question.id}
            index={i}
            question={question.questions[0].text}
            onClick={() => {
              setShowSettings(false)
              dispatch(setCurrentQuestion(i))
            }}
            active={curQuestionIndex === i && !showSettings}
            onDragStart={(e) => handleDragStart(e, question.id)}
            onDragEnd={() => handleDragEnd()}
            onDragOver={(e) => handleDragOver(e, question.id)}
            onDragLeave={(e) => handleDragLeave(e)}
            onDrop={(e) => handleDrop(e)}
            highlight={currentlyOver === question.id}
            error={
              errors.questions[question.id]?.questionText
              || errors.questions[question.id]?.correctChoice
              || errors.questions[question.id]?.incorrectChoice
            }
          />
        ))}
        <BusinessButton
          preIcon="assets/plus.svg"
          onClick={() => { dispatch(createNewQuestion()) }}
        >
          Add Question
        </BusinessButton>

      </div>

      {/* TODO make key the actual question id, not index */}
      {(questions?.length > 0 && !showSettings) && (
        <QuestionEditor key={curQuestion.id} />
      )}
      {(questions?.length === 0 && !showSettings) && (
        <div className={styles.noQuestionsBox}>
          <h2 className={styles.heading}>You have no questions!</h2>
          <p className={styles.subText}>Press 'Add Question' in the top left to get started.</p>
        </div>
      )}

      {showSettings && (
        <SettingsScreen />
      )}
    </main>
  )
}
