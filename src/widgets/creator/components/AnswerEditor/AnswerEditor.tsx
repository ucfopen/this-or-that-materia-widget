import styles from './styles.module.css'
import InsetBox from '../InsetBox/InsetBox'
import LabelledTextbox from '../LabelledTextbox/LabelledTextbox'
import SelectionButton from '../SelectionButton/SelectionButton'
import LabelledTextArea from '../LabelledTextbox/LabelledTextArea'
import MediaUploader from '../MediaUploader/MediaUploader'
import VideoUploader from '../MediaUploader/VideoUploader'
import { getEmbeddedVideoUrl } from '../../../../utils'
import { useThisOrThatCreatorDispatch, useThisOrThatCreatorSelector } from '../../redux/hooks'
import {
  selectCurrentQuestionAnswer, selectCurrentQuestionErrors, setCurrentQuestionDescription, setCurrentQuestionFeedback,
  setCurrentQuestionMediaType,
  setCurrentQuestionMediaUrl,
} from '../../redux/creatorSlice'
import { BusinessButton } from '../../../shared/components/BusinessButton/BusinessButton'

interface AnswerEditorProps {
  side: 'correct' | 'incorrect',
}

export default function AnswerEditor({ side }: AnswerEditorProps) {
  const answer = useThisOrThatCreatorSelector((state) => selectCurrentQuestionAnswer(state, side))
  const errors = useThisOrThatCreatorSelector(selectCurrentQuestionErrors)
  const dispatch = useThisOrThatCreatorDispatch()

  const mediaType = answer.options.asset.type
  const mediaUrl = answer.options.asset.value
  const isUrlErrored = side === 'correct' ? errors.correctChoice : errors.incorrectChoice

  const showDescriptionBox = mediaType === 'audio' || mediaType === 'image'

  const handleSetMediaType = (type: MediaType) => {
    dispatch(setCurrentQuestionMediaType({ side, type }))
    dispatch(setCurrentQuestionMediaUrl({ side, url: '' }))
  }

  const clearMedia = () => dispatch(setCurrentQuestionMediaUrl({ side, url: '' }))

  return (
    <InsetBox>
      {/* Media type selection */}
      <div className={styles.mediaTypeSelectionButtons}>
        <SelectionButton
          icon="assets/image.svg"
          onClick={() => handleSetMediaType('image')}
          active={mediaType === 'image'}>
          Image
        </SelectionButton>
        <SelectionButton
          icon="assets/text.svg"
          onClick={() => handleSetMediaType('text')}
          active={mediaType === 'text'}>
          Text
        </SelectionButton>
        <SelectionButton
          icon="assets/audio.svg"
          onClick={() => handleSetMediaType('audio')}
          active={mediaType === 'audio'}>
          Audio
        </SelectionButton>
        <SelectionButton
          icon="assets/video.svg"
          onClick={() => handleSetMediaType('video')}
          active={mediaType === 'video'}>
          Video
        </SelectionButton>
      </div>

      {/* Media selection */}
      {/* Text */}
      {mediaType === 'text' && (
        <LabelledTextArea
          label="Option Text"
          rows={5}
          value={mediaUrl}
          onChange={(e) => dispatch(setCurrentQuestionMediaUrl({ side, url: e.target.value }))}
          error={isUrlErrored}
        />
      )}

      {/* Image */}
      {(mediaType === 'image' && !mediaUrl) && (
        <MediaUploader
          icon="assets/image.svg"
          iconAlt="Upload Image"
          type="image"
          setMediaUrl={(url) => dispatch(setCurrentQuestionMediaUrl({ side, url }))}
          error={isUrlErrored}
        />
      )}
      {(mediaType === 'image' && mediaUrl) && (
        <>
          <img className={styles.imagePreview} src={mediaUrl} alt="" draggable={false} />
          <BusinessButton color="translucent" size="s" style={{ alignSelf: 'center' }} onClick={clearMedia}>
            Remove Image
          </BusinessButton>
        </>
      )}

      {/* Audio */}
      {(mediaType === 'audio' && !mediaUrl) && (
        <MediaUploader
          icon="assets/audio.svg"
          iconAlt="Upload Audio"
          type="audio"
          setMediaUrl={(url) => dispatch(setCurrentQuestionMediaUrl({ side, url }))}
          error={isUrlErrored}
        />
      )}
      {(mediaType === 'audio' && mediaUrl) && (
        <InsetBox alignCenter>
          <audio className={styles.audioPreview} controls src={mediaUrl} />
          <BusinessButton color="translucent" size="s" onClick={clearMedia}>
            Remove Audio
          </BusinessButton>
        </InsetBox>
      )}

      {/* Video */}
      {(mediaType === 'video' && !mediaUrl) && (
        <VideoUploader
          setMediaUrl={(url) => dispatch(setCurrentQuestionMediaUrl({ side, url }))}
        />
      )}
      {(mediaType === 'video' && mediaUrl) && (
        <>
          <iframe
            className={styles.videoPreview}
            src={getEmbeddedVideoUrl(mediaUrl)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <BusinessButton color="translucent" size="s" style={{ alignSelf: 'center' }} onClick={clearMedia}>
            Remove Video
          </BusinessButton>
        </>
      )}

      {/* Description */}
      {showDescriptionBox && (
        <LabelledTextbox
          label="Description (optional)"
          placeholder="Describe the media"
          value={answer.text}
          onChange={(e) => dispatch(setCurrentQuestionDescription({ side, desc: e.target.value }))}
        />
      )}

      {/* Feedback */}
      <LabelledTextbox
        label="Feedback (optional)"
        value={answer.options.feedback}
        onChange={(e) => dispatch(setCurrentQuestionFeedback({ side, feedback: e.target.value }))}
        tooltip="Feedback will be displayed to players after they select this option."
      />
    </InsetBox>
  )
}
