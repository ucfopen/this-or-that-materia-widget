import styles from './styles.module.css'
import clsx from 'clsx'
import ChoiceContent from '../ChoiceContent/ChoiceContent'
import ChoiceContentWithButton from '../ChoiceContentWithButton/ChoiceContentWithButton'
import { ReactNode } from 'react'
import ImageLightboxContents from '../../../../shared/components/ImageLightboxContents/ImageLightboxContents'

export type ChoiceState = 'unpicked' | 'correct' | 'incorrect'

interface GameChoiceProps {
  side: 'left' | 'right',
  choiceType: 'text' | 'image' | 'video' | 'audio',
  mediaUrl: string,
  answerText: string,
  answerFeedback: string,
  onHover: (isHovered: boolean) => void,
  onSelect: () => void,
  state: ChoiceState,
  disabled: boolean,
  animationState: 'raised' | 'lowered',
  openLightbox: (content: ReactNode) => void,
}

export default function GameChoice({
  side,
  choiceType,
  mediaUrl,
  answerText,
  answerFeedback,
  onHover,
  onSelect,
  state,
  disabled,
  animationState,
  openLightbox,
}: GameChoiceProps) {
  const poleRender = (
    <img
      className={clsx({
        [styles.pole]: true,
        [styles.left]: side === 'left',
        [styles.right]: side === 'right',
      })}
      src="assets/pole.png"
      alt=""
      aria-hidden
    />
  )

  // Render media
  let mediaRender = null

  if (choiceType === 'image') {
    const lightboxRender = (
      <ImageLightboxContents src={mediaUrl} alt={answerText} />
    )
    mediaRender = (
      <ChoiceContent
        onHover={onHover}
        onSelect={onSelect}
        state={state}
        answerFeedback={answerFeedback}
        expandable
        onExpand={() => openLightbox(lightboxRender)}>
        <img src={mediaUrl} alt={answerText} draggable={false} />
      </ChoiceContent>
    )
  } else if (choiceType === 'video') {
    const lightboxRender = (
      <iframe className={styles.lightboxVideoFrame} width="100%" src={mediaUrl} allowFullScreen />
    )
    mediaRender = (
      <ChoiceContentWithButton
        onHover={onHover}
        onSelect={onSelect}
        state={state}
        answerFeedback={answerFeedback}
        expandable
        onExpand={() => openLightbox(lightboxRender)}>
        <iframe
          className={styles.videoFrame}
          width="100%"
          height="100%"
          src={mediaUrl}
          allowFullScreen
        />
      </ChoiceContentWithButton>
    )
  } else if (choiceType === 'audio') {
    mediaRender = (
      <ChoiceContentWithButton
        onHover={onHover}
        onSelect={onSelect}
        state={state}
        answerFeedback={answerFeedback}
        expandable={false}>
        <figure className={styles.audioFigure}>
          <audio controls src={mediaUrl}>
            Your browser does not support the
            <code>audio</code>
            element.
          </audio>
          <figcaption>
            {`Audio Description: ${answerText}`}
          </figcaption>
        </figure>
      </ChoiceContentWithButton>
    )
  } else if (choiceType === 'text') {
    mediaRender = (
      <ChoiceContent
        onHover={onHover}
        onSelect={onSelect}
        state={state}
        answerFeedback={answerFeedback}>
        <div className={styles.textChoice}>
          <p>{mediaUrl}</p>
        </div>
      </ChoiceContent>
    )
  }

  return (
    <div className={clsx({
      [styles.container]: true,
      [styles.left]: side === 'left',
      [styles.right]: side === 'right',
      [styles.raised]: animationState === 'raised',
      [styles.lowered]: animationState === 'lowered',
    })}>
      {side === 'left' && poleRender}
      <div className={clsx({
        [styles.frame]: true,
        [styles.unpicked]: state === 'unpicked',
        [styles.correct]: state === 'correct',
        [styles.incorrect]: state === 'incorrect',
        [styles.disabled]: disabled,
      })}>
        {mediaRender}
      </div>
      {side === 'right' && poleRender}
    </div>
  )
}
