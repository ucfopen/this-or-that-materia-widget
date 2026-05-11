import { useContext, useEffect, useState } from 'react'
import { QsetContext } from './contexts'
import {
  answerQuestion, goToNextQuestion,
  initGame,
  selectCurrentQuestion, selectCurrentQuestionAnswer,
  selectCurrentQuestionIndex, selectIsGameFinished, selectQuestionPhase,
  selectTotalNumberOfQuestions,
} from './redux/gameSlice'
import { useThisOrThatDispatch, useThisOrThatSelector } from './redux/hooks'
import WhimsicalGame from './whimsical-game/WhimsicalGame/WhimsicalGame'
import BusinessGame from './business-game/BusinessGame/BusinessGame'
import { ChoiceState } from './whimsical-game/components/GameChoice/GameChoice'

interface PlayerAppProps {
  onEnd: () => void,
  submitQuestionForScoring: (id: string, answers: string, value?: string) => void,
}

export type QuestionPhase = 'answered' | 'unanswered'

export interface GameProps {
  gameInProgress: boolean,
  isGameFinished: boolean,
  onStart: () => void,
  onEnd: () => void,
  currentQuestion: ThisOrThatQsetItem | null,
  currentQuestionIndex: number,
  totalNumberOfQuestions: number,
  questionPhase: QuestionPhase,
  doGameStateAnims: boolean,
  doMidPhaseAnims: boolean,
  leftChoice: ThisOrThatQsetAnswer,
  rightChoice: ThisOrThatQsetAnswer,
  leftChoiceState: ChoiceState,
  rightChoiceState: ChoiceState,
  submitQuestion: (choice: string) => void,
  onNextQuestion: () => void,
}

const initialLeftChoice = Math.floor(Math.random() * 2)
const initialRightChoice = initialLeftChoice === 0 ? 1 : 0

export default function PlayerApp({ onEnd, submitQuestionForScoring }: PlayerAppProps) {
  const qset = useContext(QsetContext)
  const [gameInProgress, setGameInProgress] = useState(false)
  const [doGameStateAnims, setDoGameStartAnims] = useState(false)
  const [leftChoiceIndex, setLeftChoiceIndex] = useState<number>(initialLeftChoice)
  const [rightChoiceIndex, setRightChoiceIndex] = useState<number>(initialRightChoice)
  const [cachedLastQuestion, setCachedLastQuestion] = useState<ThisOrThatQsetItem | null>(null)

  const [doMidPhaseAnimations, setDoMidPhaseAnimations] = useState(false)

  const dispatch = useThisOrThatDispatch()
  const currentQuestionIndex = useThisOrThatSelector(selectCurrentQuestionIndex)
  const totalNumberOfQuestions = useThisOrThatSelector(selectTotalNumberOfQuestions)
  const currentQuestion = useThisOrThatSelector(selectCurrentQuestion) ?? cachedLastQuestion
  const questionPhase = useThisOrThatSelector(selectQuestionPhase)
  const currentQuestionAnswer = useThisOrThatSelector(selectCurrentQuestionAnswer)
  const isGameFinished = useThisOrThatSelector(selectIsGameFinished)

  const leftChoice = currentQuestion?.answers[leftChoiceIndex]
  const rightChoice = currentQuestion?.answers[rightChoiceIndex]

  // Callback to start game
  const startGame = () => {
    setGameInProgress(true)
    setTimeout(() => {
      setDoGameStartAnims(true)
    }, 250)
  }

  // Initialize game state with the qset
  useEffect(() => {
    dispatch(initGame(qset))
  })

  // Calculate state of choices
  let leftChoiceState: ChoiceState = 'unpicked'
  let rightChoiceState: ChoiceState = 'unpicked'
  if (questionPhase === 'answered') {
    if (currentQuestionAnswer.picked === leftChoice.id) {
      leftChoiceState = currentQuestionAnswer.correct ? 'correct' : 'incorrect'
    } else if (currentQuestionAnswer.picked === rightChoice.id) {
      rightChoiceState = currentQuestionAnswer.correct ? 'correct' : 'incorrect'
    }
  }

  // Submit a question to Materia for scoring
  const submitQuestion = (choice: 'left' | 'right') => {
    if (questionPhase === 'answered') return

    const choiceIndex = choice === 'left' ? leftChoiceIndex : rightChoiceIndex
    const curAnswer = currentQuestion.answers[choiceIndex]
    switch (qset.version) {
      case 0:
      case 1:
      case NaN:
        submitQuestionForScoring(currentQuestion.id, curAnswer.text)
        break

      case 2:
      default:
        submitQuestionForScoring(currentQuestion.id, curAnswer.id, curAnswer.text)
    }

    dispatch(answerQuestion(curAnswer.id))
  }

  // Handle next question button
  const onNextQuestion = () => {
    setDoMidPhaseAnimations(true)
    setTimeout(() => {
      dispatch(goToNextQuestion())
      setCachedLastQuestion(currentQuestion)
      setDoMidPhaseAnimations(false)

      // Randomly shuffle left and right choices
      const leftIndex = Math.floor(Math.random() * 2)
      const rightIndex = leftIndex === 0 ? 1 : 0
      setLeftChoiceIndex(leftIndex)
      setRightChoiceIndex(rightIndex)
    }, 750)
  }

  // Detect game finished
  useEffect(() => {
    if (!isGameFinished) return
    setGameInProgress(false)
    setDoGameStartAnims(false)
    setDoMidPhaseAnimations(true)
  }, [isGameFinished])

  if (qset.options?.['theme'] === 'business') {
    return (
      <BusinessGame
        gameInProgress={gameInProgress}
        isGameFinished={isGameFinished}
        onStart={startGame}
        onEnd={onEnd}
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        totalNumberOfQuestions={totalNumberOfQuestions}
        questionPhase={questionPhase}
        doGameStateAnims={doGameStateAnims}
        doMidPhaseAnims={doMidPhaseAnimations}
        leftChoice={leftChoice}
        rightChoice={rightChoice}
        leftChoiceState={leftChoiceState}
        rightChoiceState={rightChoiceState}
        submitQuestion={submitQuestion}
        onNextQuestion={onNextQuestion}
      />
    )
  } else {
    return (
      <WhimsicalGame
        gameInProgress={gameInProgress}
        isGameFinished={isGameFinished}
        onStart={startGame}
        onEnd={onEnd}
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        totalNumberOfQuestions={totalNumberOfQuestions}
        questionPhase={questionPhase}
        doGameStateAnims={doGameStateAnims}
        doMidPhaseAnims={doMidPhaseAnimations}
        leftChoice={leftChoice}
        rightChoice={rightChoice}
        leftChoiceState={leftChoiceState}
        rightChoiceState={rightChoiceState}
        submitQuestion={submitQuestion}
        onNextQuestion={onNextQuestion}
      />
    )
  }
}
