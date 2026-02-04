import styles from './styles.module.css'
import { useRef, useState } from 'react'
import clsx from 'clsx'

interface ImageLightboxContentsProps {
  src: string,
  alt: string,
}

export default function ImageLightboxContents({ src, alt }: ImageLightboxContentsProps) {
  const [zoomed, setZoomed] = useState(false)
  const [unZooming, setUnZooming] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState([0, 0])
  const [dragLatest, setDragLatest] = useState([0, 0])
  const [dragOffset, setDragOffset] = useState([0, 0])

  const imgRef = useRef<HTMLImageElement>()
  const unZoomTimeout = useRef<ReturnType<typeof setTimeout>>()

  if (imgRef.current) {
    imgRef.current.style.translate = `${dragOffset[0]}px ${dragOffset[1]}px`

    if (isDragging && zoomed) {
      imgRef.current.style.cursor = 'grabbing'
    } else {
      imgRef.current.style.cursor = ''
    }

    if (unZooming) {
      imgRef.current.style.transition += 'translate 0.2s, scale 0.2s'
    } else {
      imgRef.current.style.transition = ''
    }
  }

  return (
    <div className={styles.imageContainer}>
      <img
        className={clsx({
          [styles.image]: true,
          [styles.zoomed]: zoomed,
        })}
        src={src}
        alt={alt}
        draggable={false}
        ref={imgRef}
        onMouseDown={(e) => {
          setIsDragging(true)
          setDragStart([e.clientX, e.clientY])
          setDragLatest([e.clientX, e.clientY])
        }}
        onMouseUp={(e) => {
          if (!zoomed) {
            // Handle zoom in
            setZoomed(true)
            clearTimeout(unZoomTimeout.current)
          } else {
            // Handle zoom out
            if (e.clientX === dragStart[0] && e.clientY === dragStart[1]) {
              setZoomed(!zoomed)
              setUnZooming(true)
              unZoomTimeout.current = setTimeout(() => setUnZooming(false), 200)
              setDragOffset([0, 0])
            }
          }
          setIsDragging(false)
        }}
        onMouseMove={(e) => {
          if (isDragging && zoomed) {
            let newOffsetX = (e.clientX - dragLatest[0]) + dragOffset[0]
            let newOffsetY = (e.clientY - dragLatest[1]) + dragOffset[1]
            const imageWidthBound = imgRef.current.width * (3 / 4)
            const imageHeightBound = imgRef.current.height * (3 / 4)
            newOffsetX = Math.min(Math.max(newOffsetX, -imageWidthBound), imageWidthBound)
            newOffsetY = Math.min(Math.max(newOffsetY, -imageHeightBound), imageHeightBound)
            setDragOffset([newOffsetX, newOffsetY])
            setDragLatest([e.clientX, e.clientY])
          }
        }}
      />
    </div>
  )
}
