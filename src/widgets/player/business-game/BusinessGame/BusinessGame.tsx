import '../../../shared/business-globals.css'
import styles from './styles.module.css'
import { GameProps } from '../../PlayerApp'
import { ReactNode, useEffect, useRef, useState } from 'react'
import BusinessGameChoice from '../components/BusinessGameChoice/BusinessGameChoice'
import clsx from 'clsx'
import BusinessIntro from '../components/BusinessIntro/BusinessIntro'
import BusinessOutro from '../components/BusinessOutro/BusinessOutro'
import { BusinessButton } from '../../../shared/components/BusinessButton/BusinessButton'

export default function BusinessGame({
  gameInProgress, isGameFinished, onStart, onEnd, currentQuestion, currentQuestionIndex, totalNumberOfQuestions, questionPhase,
  doGameStateAnims, doMidPhaseAnims, leftChoice, rightChoice, leftChoiceState, rightChoiceState, submitQuestion, onNextQuestion,
}: GameProps) {
  // Intro/outro
  const [introClosed, setIntroClosed] = useState(false)

  // Lightbox
  const [lightboxContent, setLightboxContent] = useState<ReactNode>(null)
  const [lightboxClosing, setLightboxClosing] = useState(false)
  const lightboxClosingRef = useRef<ReturnType<typeof setTimeout>>()
  const closeLightbox = () => {
    setLightboxClosing(true)
    lightboxClosingRef.current = setTimeout(() => {
      setLightboxContent(null)
      setLightboxClosing(false)
    }, 100)
  }
  useEffect(() => {
    if (lightboxContent == null || !lightboxClosingRef.current) return
    clearTimeout(lightboxClosingRef.current)
    setLightboxClosing(false)
  }, [lightboxContent])

  // Progress bar
  const curQuestionIndexClean = Math.min(currentQuestionIndex + 1, totalNumberOfQuestions)
  const progressBarRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (progressBarRef.current == null) return
    progressBarRef.current.style.width = `${(currentQuestionIndex / totalNumberOfQuestions) * 100}%`
  }, [currentQuestionIndex, totalNumberOfQuestions, gameInProgress])

  return (
    <main className={styles.main}>
      <BusinessIntro
        hide={introClosed}
        onNext={() => {
          setIntroClosed(true)
          setTimeout(() => onStart(), 250)
        }}
      />

      <BusinessOutro
        hide={!isGameFinished}
        onNext={onEnd}
      />

      {(gameInProgress && currentQuestion) && (
        <div
          className={clsx({
            [styles.content]: true,
          })}>
          {/* Progress bar */}
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBarText}>
              <p>{`Question ${curQuestionIndexClean} of ${totalNumberOfQuestions}`}</p>
              <p className={styles.percentCompleteText}>
                {`${Math.round(((currentQuestionIndex) / totalNumberOfQuestions) * 100)}% complete`}
              </p>
            </div>
            <div className={styles.progressBarBkg}>
              <div className={styles.progressBarInside} ref={progressBarRef} />
            </div>
          </div>

          {/* Question Text */}
          <div
            className={clsx({
              [styles.questionContainer]: true,
              [styles.outro]: doMidPhaseAnims,
            })}>
            <h2>{currentQuestion?.questions[0].text}</h2>
          </div>

          {/* Game choices */}
          <div
            className={clsx({
              [styles.choicesContainer]: true,
              [styles.outro]: doMidPhaseAnims,
            })}
          >

            <BusinessGameChoice
              key={leftChoice.id}
              choiceType={leftChoice.options.asset.type}
              mediaUrl={leftChoice.options.asset.value}
              answerText={leftChoice.text}
              answerFeedback={leftChoice.options.feedback}
              onSelect={() => submitQuestion('left')}
              state={leftChoiceState}
              highlightCorrectOnFail={rightChoiceState === 'incorrect' && leftChoiceState === 'unpicked'}
              disabled={questionPhase === 'answered' || doMidPhaseAnims}
              animationState={doMidPhaseAnims ? 'lowered' : 'raised'}
              openLightbox={setLightboxContent}
            />

            <BusinessGameChoice
              key={rightChoice.id}
              choiceType={rightChoice.options.asset.type}
              mediaUrl={rightChoice.options.asset.value}
              answerText={rightChoice.text}
              answerFeedback={rightChoice.options.feedback}
              onSelect={() => submitQuestion('right')}
              state={rightChoiceState}
              highlightCorrectOnFail={leftChoiceState === 'incorrect' && rightChoiceState === 'unpicked'}
              disabled={questionPhase === 'answered' || doMidPhaseAnims}
              animationState={doMidPhaseAnims ? 'lowered' : 'raised'}
              openLightbox={setLightboxContent}
            />
          </div>

          {/* Next button */}
          {questionPhase === 'answered' && (
            <BusinessButton
              className={clsx({
                [styles.nextButton]: true,
                [styles.outro]: doMidPhaseAnims,
              })}
              onClick={onNextQuestion}
              disabled={doMidPhaseAnims}>
              Next
            </BusinessButton>
          )}

          {lightboxContent && (
            <div
              className={clsx({
                [styles.lightboxBackground]: true,
                [styles.closing]: lightboxClosing,
              })}
            >
              {lightboxContent}
              <BusinessButton
                className={styles.lightboxCloseButton}
                color="translucent"
                size="m"
                square
                onClick={closeLightbox}>
                <img src="assets/close.svg" alt="Close lightbox" />
              </BusinessButton>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
