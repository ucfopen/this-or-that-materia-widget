import styles from './styles.module.css'
import { ReactNode, useState } from 'react'
import BusinessChoiceOverlay from '../BusinessChoiceOverlay/BusinessChoiceOverlay'
import clsx from 'clsx'
import BusinessChoiceContent from '../BusinessChoiceContent/BusinessChoiceContent'
import BusinessChoiceContentWithButton from '../BusinessChoiceContentWithButton/BusinessChoiceContentWithButton'
import { ChoiceState } from '../../../whimsical-game/components/GameChoice/GameChoice'
import ImageLightboxContents from '../../../../shared/components/ImageLightboxContents/ImageLightboxContents'
import { BusinessButton } from '../../../../shared/components/BusinessButton/BusinessButton'
import { getEmbeddedVideoUrl } from '../../../../../utils'

interface BusinessGameChoiceProps {
  choiceType: 'text' | 'image' | 'video' | 'audio',
  mediaUrl: string,
  answerText: string,
  answerFeedback: string,
  onSelect: () => void,
  state: ChoiceState,
  highlightCorrectOnFail: boolean,
  disabled: boolean,
  animationState: 'raised' | 'lowered',
  openLightbox: (content: ReactNode) => void,
}

export default function BusinessGameChoice({
  choiceType, mediaUrl, answerText, answerFeedback, onSelect, state, highlightCorrectOnFail, disabled, animationState, openLightbox,
}: BusinessGameChoiceProps) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  // Render media
  let mediaRender = null
  let expandable = false
  let lightboxContent = null

  if (choiceType === 'image') {
    expandable = true
    mediaRender = (
      <BusinessChoiceContent
        onSelect={onSelect}
        disabled={disabled}
        onHover={setHovered}
		onFocus={setFocused}>
        <img className={styles.imgChoice} src={mediaUrl} alt={answerText} />
      </BusinessChoiceContent>
    )
    lightboxContent = (
      <ImageLightboxContents src={mediaUrl} alt={answerText} />
    )
  } else if (choiceType === 'video') {
    expandable = true
    mediaRender = (
      <BusinessChoiceContentWithButton
        onSelect={onSelect}
        disabled={disabled}
        onHover={setHovered}>
        <iframe
          className={styles.videoFrame}
          width="100%"
          height="100%"
          src={getEmbeddedVideoUrl(mediaUrl)}
          allowFullScreen
        />
      </BusinessChoiceContentWithButton>
    )
    lightboxContent = (
      <iframe className={styles.lightboxVideoFrame} width="100%" src={getEmbeddedVideoUrl(mediaUrl)} allowFullScreen />
    )
  } else if (choiceType === 'audio') {
    expandable = false
    mediaRender = (
      <BusinessChoiceContentWithButton
        onSelect={onSelect}
        disabled={disabled}
        onHover={setHovered}>
        <figcaption className={styles.audioDescription}>
          <p className={styles.audioDescLabel}>AUDIO DESCRIPTION</p>
          <p>{answerText}</p>
        </figcaption>
        <audio controls className={styles.audioElement}>
          <source src={mediaUrl} />
          Your browser does not support the
          <code>audio</code>
          element.
        </audio>
      </BusinessChoiceContentWithButton>
    )
  } else if (choiceType === 'text') {
    expandable = false
    mediaRender = (
      <BusinessChoiceContent
        onSelect={onSelect}
        disabled={disabled}
        onHover={setHovered}
		onFocus={setFocused}>
        <p>{mediaUrl}</p>
      </BusinessChoiceContent>
    )
  }

  return (
    <div
      className={clsx({
        [styles.choiceBorder]: true,
        [styles.hovered]: hovered,
		[styles.focused]: focused,
      })}
      >
      <div
        className={clsx({
          [styles.choice]: true,
          [styles.correctButUnchosen]: highlightCorrectOnFail,
        })}>

        {mediaRender}

        {(!highlightCorrectOnFail && expandable) && (
          <BusinessButton
            className={styles.topRightItem}
            color="translucent"
            size="s"
            square
            onClick={() => openLightbox(lightboxContent)}
            disabled={disabled}>
            <img src="assets/expand.svg" alt="" />
          </BusinessButton>
        )}

        {highlightCorrectOnFail && (
          <div className={clsx([styles.topRightItem, styles.correctBullet])}>
            <img src="assets/checkmark.svg" alt="" />
          </div>
        )}

        {state !== 'unpicked' && (
          <BusinessChoiceOverlay
            state={state}
            answerFeedback={answerFeedback}
          />
        )}
      </div>
    </div>
  )
}
