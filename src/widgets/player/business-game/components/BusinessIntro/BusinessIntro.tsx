import InsetBox from '../../../../creator/components/InsetBox/InsetBox'
import { BusinessButton } from '../../../../shared/components/BusinessButton/BusinessButton'
import styles from './styles.module.css'
import clsx from 'clsx'

interface BusinessIntroProps {
  hide: boolean,
  onNext: () => void,
}

export default function BusinessIntro({ hide, onNext }: BusinessIntroProps) {
  return (
    <div
      className={clsx({
        [styles.introScreenContainer]: true,
        [styles.hide]: hide,
      })}>
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
            preIcon="assets/play.svg"
            onClick={() => {
              onNext()
            }}>
            Start Assessment
          </BusinessButton>
        </InsetBox>
      </div>
    </div>
  )
}
