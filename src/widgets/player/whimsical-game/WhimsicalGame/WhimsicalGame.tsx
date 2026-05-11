import '../../whimsical-globals.css'
import styles from './styles.module.css'
import clsx from 'clsx'
import { ReactNode, useEffect, useState } from 'react'
import { GameProps } from '../../PlayerApp'
import Hands, { HandState } from '../components/Hands/Hands'
import SplashScreen from '../components/SplashScreen/SplashScreen'
import GameChoice from '../components/GameChoice/GameChoice'
import { Button } from '../components/Button/Button'
import TutorialModal from '../components/TutorialModal/TutorialModal'

const defaultHandState: HandState = {
  raised: false,
  value: 'pointing',
}

export default function WhimsicalGame({
  gameInProgress, isGameFinished, onStart, onEnd, currentQuestion, currentQuestionIndex, totalNumberOfQuestions, questionPhase,
  doGameStateAnims, doMidPhaseAnims, leftChoice, rightChoice, leftChoiceState, rightChoiceState, submitQuestion, onNextQuestion,
}: GameProps) {
  const [leftChoiceHovered, setLeftChoiceHovered] = useState(false)
  const [rightChoiceHovered, setRightChoiceHovered] = useState(false)
  const [leftHandState, setLeftHandState] = useState<HandState>(defaultHandState)
  const [rightHandState, setRightHandState] = useState<HandState>(defaultHandState)

  const [lightboxContent, setLightboxContent] = useState<ReactNode | null>(null)
  const [lightboxClosing, setLightboxClosing] = useState(false)
  const [tutorialModalOpen, setTutorialModalOpen] = useState(false)

  // Calculate hand states
  useEffect(() => {
    // Default states
    const leftState: HandState = { raised: false, value: 'pointing' }
    const rightState: HandState = { raised: false, value: 'pointing' }

    if (questionPhase === 'answered') {
      // If this answer has been questioned, ignore hover states and display thumbs up/down
      if (leftChoiceState != 'unpicked') {
        leftState.raised = true
        leftState.value = leftChoiceState
      } else if (rightChoiceState != 'unpicked') {
        rightState.raised = true
        rightState.value = rightChoiceState
      }
    } else {
      // Else, display pointing hands based on the current hover state
      leftState.raised = leftChoiceHovered
      rightState.raised = rightChoiceHovered
    }

    setLeftHandState(leftState)
    setRightHandState(rightState)
  }, [questionPhase, leftChoiceHovered, rightChoiceHovered, leftChoice, rightChoice, leftChoiceState, rightChoiceState])

  return (
    <main className={styles.main}>
      <div aria-live="assertive" role="status" />

      <SplashScreen
        isRaised={gameInProgress}
        closeIntro={() => {
          if (isGameFinished)
            onEnd()
          else {
            onStart()
          }
        }}
        mode={isGameFinished ? 'end' : 'intro'}
      />

      {/* Curtains */}
      <img className={styles.leftCurtain} src="assets/left-curtain.svg" alt="" />
      <img className={styles.rightCurtain} src="assets/right-curtain.svg" alt="" />

      {/* Render only if qset is loaded */}
      {currentQuestion && (
        <div className={styles.gameBoard}>
          {/* Top Bar */}
          <div
            className={clsx({
              [styles.topBar]: true,
              [styles.lowered]: doGameStateAnims,
            })}>
            <button
              className={styles.inGameInstructionsButton}
              onClick={() => { setTutorialModalOpen(true) }}>
              ?
            </button>
            <h2 className={clsx({
              [styles.questionText]: true,
              [styles.lowered]: doMidPhaseAnims,
            })}>
              {currentQuestion.questions[0].text}
            </h2>
            <div
              className={styles.questionsRemainingContainer}
              onClick={() => {}}
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}>
              <div className={styles.puckContainer}>
                <p className={clsx([styles.puck, styles.front])}>{currentQuestionIndex + 1}</p>
                <p className={clsx([styles.puck, styles.back])}>{`of ${totalNumberOfQuestions}`}</p>
              </div>
              <img
                className={styles.pole}
                src="assets/pole.png"
                alt=""
              />
            </div>
          </div>

          {/* This or That Choices */}
          <div className={styles.choices}>
            <GameChoice
              side="left"
              choiceType={leftChoice.options.asset.type}
              mediaUrl={leftChoice.options.asset.value}
              answerText={leftChoice.text}
              answerFeedback={leftChoice.options.feedback}
              onHover={setLeftChoiceHovered}
              onSelect={() => { submitQuestion('left') }}
              state={leftChoiceState}
              disabled={questionPhase === 'answered' || doMidPhaseAnims}
              animationState={doMidPhaseAnims ? 'lowered' : 'raised'}
              openLightbox={setLightboxContent}
            />
            <GameChoice
              side="right"
              choiceType={rightChoice.options.asset.type}
              mediaUrl={rightChoice.options.asset.value}
              answerText={rightChoice.text}
              answerFeedback={rightChoice.options.feedback}
              onHover={setRightChoiceHovered}
              onSelect={() => { submitQuestion('right') }}
              state={rightChoiceState}
              disabled={questionPhase === 'answered' || doMidPhaseAnims}
              animationState={doMidPhaseAnims ? 'lowered' : 'raised'}
              openLightbox={setLightboxContent}
            />
          </div>

          {/* Hands */}
          <Hands left={leftHandState} right={rightHandState} raised={doGameStateAnims} />

          {/* Next button */}
          <div className={clsx({
            [styles.nextButtonContainer]: true,
            [styles.raised]: questionPhase === 'answered' && !doMidPhaseAnims,
          })}>
            <Button
              onClick={onNextQuestion}
              size="l"
              disabled={questionPhase !== 'answered' && !doMidPhaseAnims}>
              Next
            </Button>
          </div>
        </div>
      )}

      {lightboxContent && (
        <div
          className={clsx({
            [styles.lightboxBackground]: true,
            [styles.close]: lightboxClosing,
          })}
          onTransitionEnd={() => {
            if (!lightboxClosing) return
            setLightboxContent(null)
            setLightboxClosing(false)
          }}>
          <div className={styles.lightbox}>
            {lightboxContent}
            <Button
              onClick={() => setLightboxClosing(true)}
              style="red"
              size="m"
              square
              className={styles.lightboxCloseButton}>
              <img src="assets/close.svg" alt="Close lightbox" />
            </Button>
          </div>
        </div>
      )}

      <TutorialModal isOpen={tutorialModalOpen} onClose={() => { setTutorialModalOpen(false) }} />
    </main>
  )
}
