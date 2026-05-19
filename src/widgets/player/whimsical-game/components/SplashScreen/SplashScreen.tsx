import styles from './styles.module.css'
import clsx from 'clsx'
import { Button } from '../Button/Button'
import { useRef, useEffect } from 'react'

type SplashScreenProps = {
  closeIntro: () => void,
  isRaised: boolean,
  mode: 'intro' | 'end',
}

export default function SplashScreen({
  closeIntro,
  isRaised,
  mode,
}: SplashScreenProps) {
  const endButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (mode === 'end' && !isRaised && endButtonRef.current) {
      endButtonRef.current.focus()
    }
  }, [mode, isRaised])

  return (
    <div className={clsx({
      [styles.splashScreen]: true,
      [styles.raised]: isRaised,
    })}>
      {/* Sign Stand */}
      <img
        className={styles.signStand}
        src="assets/sign-stand.png"
        aria-hidden
        alt="" />

      {/* Sign */}
      <div className={styles.signContainer}>
        {/* TODO check 'end' class */}
        <img
          className={styles.sign}
          src="assets/logo.png"
          alt="This or That"
        />

        {/* <h1>This or That</h1> /!* TODO gameState.splashText *!/ */}

        {/* TODO Hide if ingame or endgame */}
        {mode === 'intro' && (
          <Button
            className={styles.startButton}
            aria-label="Welcome to This or That! Press the H key at any time to view the keyboard instructions modal. Press space or enter to begin."
            aria-hidden={false}
            size="l"
            onClick={closeIntro}>
            Start!
          </Button>
        )}

        {mode === 'end' && (
          <Button
            ref={endButtonRef}
            className={styles.startButton}
            aria-label="Game complete! Continue to the score screen to view your results."
            aria-hidden={false}
            size="l"
            onClick={closeIntro}>
            Continue to Scores
          </Button>
        )}


        {/* <button */}
        {/*  className={styles.resetButton} */}
        {/*  aria-label="You have completed every question. Continue to scores." */}
        {/*  aria-hidden={false}> */}
        {/*  Continue to Scores */}
        {/* </button> */}
      </div>

    </div>
  )
}
