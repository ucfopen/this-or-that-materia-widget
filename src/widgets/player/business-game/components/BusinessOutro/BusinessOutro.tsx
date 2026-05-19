import styles from './styles.module.css'
import clsx from 'clsx'
import InsetBox from '../../../../creator/components/InsetBox/InsetBox'
import { BusinessButton } from '../../../../shared/components/BusinessButton/BusinessButton'
import { useRef, useEffect } from 'react'

interface BusinessOutroProps {
  hide: boolean,
  onNext: () => void,
}

export default function BusinessOutro({ hide, onNext }: BusinessOutroProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!hide && buttonRef.current) {
      buttonRef.current.focus()
    }
  }, [hide])

  return (
    <div
      className={clsx({
        [styles.outroScreenContainer]: true,
        [styles.hide]: hide,
      })}
      aria-hidden={hide}>
      <InsetBox className={styles.outroScreen}>
        <div className={styles.yellowBar} />
        <div className={styles.outerScreenInnerContainer}>
          <div className={styles.bullet}>
            <img className={styles.bulletIcon} src="assets/assessment-complete.svg" alt="" />
          </div>
          <h2>Assessment Complete</h2>
          <BusinessButton
            ref={buttonRef}
            fill
            postIcon="assets/right-arrow.svg"
            onClick={() => {
              onNext()
            }}
            tabIndex={hide ? -1 : 0}
            aria-label="Assessment complete. View your results on the score screen.">
            View Results
          </BusinessButton>
        </div>
      </InsetBox>
    </div>
  )
}
