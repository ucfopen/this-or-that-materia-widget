import styles from './styles.module.css'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../Button/Button'
import clsx from 'clsx'

interface TutorialModalProps {
  isOpen: boolean,
  onClose: () => void,
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [animationState, setAnimationState] = useState<'opening' | 'closing' | 'open' | 'closed'>('closed')
  const dialogRef = useRef<HTMLDialogElement>()

  useEffect(() => {
    if (isOpen) {
      dialogRef.current.showModal()
      setAnimationState('opening')
    } else {
      setAnimationState('closing')
    }
  }, [isOpen])

  return (
    <dialog
      className={clsx({
        [styles.modal]: true,
        [styles.closing]: animationState === 'closing',
      })}
      ref={dialogRef}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onTransitionEnd={(e) => {
        if (e.propertyName !== 'opacity') return
        if (animationState === 'closing') dialogRef.current.close()
      }}>
      <div
        className={clsx({
          [styles.modalContent]: true,
          [styles.opening]: animationState === 'opening',
          [styles.closing]: animationState === 'closing',
        })}>
        <h2>Keyboard Controls</h2>
        <p>Use the "A" and "D" keys to select left or right option.</p>
        <p>Use the "Q" key to listen to the question.</p>
        <p>Press the "H" Key to Open or Close the instructions.</p>

        <Button size="m" onClick={onClose}>Okay</Button>
      </div>
    </dialog>
  )
}
