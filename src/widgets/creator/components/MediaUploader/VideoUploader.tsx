import styles from './styles.module.css'
import clsx from 'clsx'
import Textbox from '../Textbox/Textbox'
import { BusinessButton } from '../../../player/PlayerApp/business-game/components/BusinessButton/BusinessButton'
import { useState } from 'react'

interface VideoUploaderProps {
  setMediaUrl: (url: string) => void,
}

export default function VideoUploader({ setMediaUrl }: VideoUploaderProps) {
  const [url, setUrl] = useState<string>(null)

  return (
    <form
      className={clsx([styles.mediaUploader, styles.videoType])}
      onSubmit={() => { setMediaUrl(url) }}>
      <div className={styles.bullet}>
        <img className={styles.bulletImage} src="assets/video.svg" alt="Set Video URL" draggable={false} />
      </div>
      <p>Youtube or Vimeo Video URL</p>
      <Textbox placeholder="Enter video URL" onChange={(e) => setUrl(e.target.value)} />
      <BusinessButton type="submit" disabled={!url}>Set Video</BusinessButton>
    </form>
  )
}
