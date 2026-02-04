import styles from './styles.module.css'
import clsx from 'clsx'
import InsetBox from '../../../../../creator/components/InsetBox/InsetBox'
import { BusinessButton } from '../BusinessButton/BusinessButton'

interface BusinessOutroProps {
  hide: boolean,
  onNext: () => void,
}

export default function BusinessOutro({ hide, onNext }: BusinessOutroProps) {
  return (
    <div
      className={clsx({
        [styles.outroScreenContainer]: true,
        [styles.hide]: hide,
      })}>
      <InsetBox className={styles.outroScreen}>
        <div className={styles.yellowBar} />
        <div className={styles.outerScreenInnerContainer}>
          <div className={styles.bullet}>
            <img className={styles.bulletIcon} src="assets/assessment-complete.svg" alt="" />
          </div>
          <h2>Assessment Complete</h2>
          <BusinessButton
            fill
            postIcon="assets/right-arrow.svg"
            onClick={() => {
              onNext()
            }}>
            View Results
          </BusinessButton>
        </div>
      </InsetBox>
    </div>
  )
}
