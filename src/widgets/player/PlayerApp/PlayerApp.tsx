import styles from './styles.module.css'
import SplashScreen from './components/SplashScreen/SplashScreen'
import { ReactNode, useContext, useEffect, useState } from 'react'
import clsx from 'clsx'
import GameChoice, { ChoiceState } from './components/GameChoice/GameChoice'
import { QsetContext } from '../contexts'
import Hands, { HandState } from './components/Hands/Hands'
import {
  answerQuestion, goToNextQuestion,
  initGame,
  selectCurrentQuestion, selectCurrentQuestionAnswer,
  selectCurrentQuestionIndex, selectIsGameFinished, selectQuestionPhase,
  selectTotalNumberOfQuestions,
} from '../redux/gameSlice'
import { useThisOrThatDispatch, useThisOrThatSelector } from '../redux/hooks'
import { Button } from './components/Button/Button'
import TutorialModal from './components/TutorialModal/TutorialModal'
import WhimsicalGame from './whimsical-game/WhimsicalGame/WhimsicalGame'
import BusinessGame from "./business-game/BusinessGame/BusinessGame";

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

  console.log(qset.options)

  if (qset.options?.['theme'] === 'whimsical') {
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
  } else {
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
  }

  // <main className={styles.main}>
  //   <div aria-live="assertive" role="status" />
  //
  //   <SplashScreen
  //     isRaised={gameInProgress}
  //     closeIntro={() => {
  //       if (isGameFinished)
  //         onEnd()
  //       else {
  //         setGameInProgress(true)
  //         setTimeout(() => {
  //           setDoGameStartAnims(true)
  //         }, 250)
  //       }
  //     }}
  //     mode={isGameFinished ? 'end' : 'intro'}
  //   />
  //
  //   {/* Curtains */}
  //   <img className={styles.leftCurtain} src="assets/left-curtain.png" alt="" />
  //   <img className={styles.rightCurtain} src="assets/right-curtain.png" alt="" />
  //
  //   {/* Render only if qset is loaded */}
  //   {currentQuestion && (
  //     <div className={styles.gameBoard}>
  //       {/* Top Bar */}
  //       <div
  //         className={clsx({
  //           [styles.topBar]: true,
  //           [styles.lowered]: doGameStateAnims,
  //         })}>
  //         <button
  //           className={styles.inGameInstructionsButton}
  //           onClick={() => { setTutorialModalOpen(true) }}>
  //           ?
  //         </button>
  //         <h2 className={clsx({
  //           [styles.questionText]: true,
  //           [styles.lowered]: doMidPhaseAnimations,
  //         })}>
  //           {currentQuestion.questions[0].text}
  //         </h2>
  //         <div
  //           className={styles.questionsRemainingContainer}
  //           onClick={() => {}}
  //           onMouseEnter={() => {}}
  //           onMouseLeave={() => {}}>
  //           <div className={styles.puckContainer}>
  //             <p className={clsx([styles.puck, styles.front])}>{currentQuestionIndex + 1}</p>
  //             <p className={clsx([styles.puck, styles.back])}>{`of ${totalNumberOfQuestions}`}</p>
  //           </div>
  //           <img
  //             className={styles.pole}
  //             src="assets/pole.png"
  //             alt=""
  //           />
  //         </div>
  //       </div>
  //
  //       {/* This or That Choices */}
  //       <div className={styles.choices}>
  //         <GameChoice
  //           side="left"
  //           choiceType={leftChoice.options.asset.type}
  //           mediaUrl={leftChoice.options.asset.value}
  //           mediaAltText={leftChoice.options.feedback}
  //           answerText={leftChoice.text}
  //           answerFeedback={leftChoice.options.feedback}
  //           onHover={setLeftChoiceHovered}
  //           onSelect={() => { submitQuestion('left') }}
  //           state={leftChoiceState}
  //           disabled={questionPhase === 'answered' || doMidPhaseAnimations}
  //           animationState={doMidPhaseAnimations ? 'lowered' : 'raised'}
  //           openLightbox={setLightboxContent}
  //         />
  //         <GameChoice
  //           side="right"
  //           choiceType={rightChoice.options.asset.type}
  //           mediaUrl={rightChoice.options.asset.value}
  //           mediaAltText={rightChoice.options.feedback}
  //           answerText={rightChoice.text}
  //           answerFeedback={rightChoice.options.feedback}
  //           onHover={setRightChoiceHovered}
  //           onSelect={() => { submitQuestion('right') }}
  //           state={rightChoiceState}
  //           disabled={questionPhase === 'answered' || doMidPhaseAnimations}
  //           animationState={doMidPhaseAnimations ? 'lowered' : 'raised'}
  //           openLightbox={setLightboxContent}
  //         />
  //       </div>
  //
  //       {/* Hands */}
  //       <Hands left={leftHandState} right={rightHandState} raised={doGameStateAnims} />
  //
  //       {/* Next button */}
  //       <div className={clsx({
  //         [styles.nextButtonContainer]: true,
  //         [styles.raised]: questionPhase === 'answered' && !doMidPhaseAnimations,
  //       })}>
  //         <Button
  //           onClick={onNextQuestion}
  //           size="l"
  //           disabled={questionPhase !== 'answered' && !doMidPhaseAnimations}>
  //           Next
  //         </Button>
  //       </div>
  //     </div>
  //   )}
  //
  //   {lightboxContent && (
  //     <div
  //       className={clsx({
  //         [styles.lightboxBackground]: true,
  //         [styles.close]: lightboxClosing,
  //       })}
  //       onTransitionEnd={() => {
  //         if (!lightboxClosing) return
  //         setLightboxContent(null)
  //         setLightboxClosing(false)
  //       }}>
  //       <div className={styles.lightbox}>
  //         {lightboxContent}
  //         <Button
  //           onClick={() => setLightboxClosing(true)}
  //           style="red"
  //           size="m"
  //           square
  //           className={styles.lightboxCloseButton}>
  //           <img src="assets/close.svg" alt="Close lightbox" />
  //         </Button>
  //       </div>
  //     </div>
  //   )}
  //
  //   <TutorialModal isOpen={tutorialModalOpen} onClose={() => { setTutorialModalOpen(false) }} />
  // </main>
}
