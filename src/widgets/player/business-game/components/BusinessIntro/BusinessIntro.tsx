import InsetBox from '../../../../creator/components/InsetBox/InsetBox'
import { BusinessButton } from '../../../../shared/components/BusinessButton/BusinessButton'
import styles from './styles.module.css'
import clsx from 'clsx'
import { useRef, useEffect } from 'react'

interface BusinessIntroProps {
  hide: boolean,
  onNext: () => void,
}

export default function BusinessIntro({ hide, onNext }: BusinessIntroProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!hide && buttonRef.current) {
      buttonRef.current.focus()
    }
  }, [hide])

  return (
    <div
      className={clsx({
        [styles.introScreenContainer]: true,
        [styles.hide]: hide,
      })}
      aria-hidden={hide}>
      <div className={styles.introScreen}>
        <div className={styles.introInnerContainer}>
          <img className={styles.logo} src="assets/logo.svg" alt="" />
          <h1 className={styles.title}>This or That</h1>
          <p className={styles.gameDescription}>
            Test your knowledge by making the correct choice between two options.
          </p>
        </div>
        <InsetBox className={styles.startButtonContainer}>
          <BusinessButton
            ref={buttonRef}
            preIcon="assets/play.svg"
            onClick={() => {
              onNext()
            }}
            tabIndex={hide ? -1 : 0}>
            Start Assessment
          </BusinessButton>
        </InsetBox>
      </div>
    </div>
  )
}
