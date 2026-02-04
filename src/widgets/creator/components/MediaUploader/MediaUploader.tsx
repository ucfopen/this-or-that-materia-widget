import styles from './styles.module.css'
import clsx from 'clsx'
import { ChangeEvent, DragEvent, MouseEvent, useId, useRef, useState } from 'react'
import { BusinessButton } from '../../../player/PlayerApp/business-game/components/BusinessButton/BusinessButton'
import Textbox from '../Textbox/Textbox'
import { useRegisterMediaHandler } from '../../media-handler-util'

interface MediaUploaderProps {
  icon: string,
  iconAlt: string,
  type: Exclude<Materia.CreatorCore.ImporterMediaTypes, 'video'>,
  setMediaUrl: (url: string) => void,
  error: boolean,
}

export default function MediaUploader({ icon, iconAlt, type, setMediaUrl, error }: MediaUploaderProps) {
  const [draggingOver, setDraggingOver] = useState(false)
  const uploaderRef = useRef<HTMLLabelElement>()
  const inputId = useId()
  const registerMediaHandler = useRegisterMediaHandler()

  const mimeType = (() => {
    switch (type) {
      case 'image': return 'image/'
      case 'audio': return 'audio/'
      case 'model': return 'model/' // TODO fix
    }
  })()

  const uploadMediaToMateria = (file: File) => {
    Materia.CreatorCore.directUploadMedia(file)
    registerMediaHandler((url: string) => setMediaUrl(url))
  }

  const handleOnDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setDraggingOver(false)
    const file = [...e.dataTransfer.files].find((file) => file.type.startsWith(mimeType))
    if (file) {
      uploadMediaToMateria(file)
    }
  }

  const handleOnDragOver = (e: DragEvent<HTMLLabelElement>) => {
    const fileItems = [...e.dataTransfer.items].filter(
      (item) => item.kind === 'file' && item.type.startsWith(mimeType),
    )
    if (fileItems.length > 0) {
      e.preventDefault()
      setDraggingOver(true)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file?.type.startsWith(mimeType)) {
      uploadMediaToMateria(file)
    }
  }

  const handleMediaLibraryUpload = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    Materia.CreatorCore.showMediaImporter([type])
    registerMediaHandler((url: string) => {
      setMediaUrl(url)
    })
  }

  return (
    <label
      className={clsx({
        [styles.mediaUploader]: true,
        [styles.imageType]: type === 'image',
        [styles.draggingOver]: draggingOver,
        [styles.error]: error,
      })}
      onDrop={handleOnDrop}
      onDragOver={handleOnDragOver}
      onDragLeave={() => setDraggingOver(false)}
      htmlFor={inputId}
      ref={uploaderRef}>
      <div className={styles.bullet}>
        <img className={styles.bulletImage} src={icon} alt={iconAlt} draggable={false} />
      </div>

      <p>
        Click to upload or drag and drop
      </p>
      <p className={styles.mediaUploaderText}>
        Or,
        <button className={styles.uploadButton} onClick={handleMediaLibraryUpload}>
          upload from your media library
        </button>
      </p>
      <input
        id={inputId}
        type="file"
        accept={mimeType + '*'}
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
    </label>
  )
}
