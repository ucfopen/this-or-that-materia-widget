import styles from './styles.module.css'
import LabelledTextbox from '../LabelledTextbox/LabelledTextbox'
import InsetBox from '../InsetBox/InsetBox'
import { useState } from 'react'
import clsx from 'clsx'
import Checkbox from '../Checkbox/Checkbox'
import { useThisOrThatCreatorDispatch, useThisOrThatCreatorSelector } from '../../redux/hooks'
import {
  selectOptions,
  selectQuestions,
  selectTitle,
  setQuestionBankSize, setRandomizeOrder, setTheme,
  setTitle,
  setUseQuestionBank,
} from '../../redux/creatorSlice'

interface SettingsScreenProps {
}

export default function SettingsScreen({}: SettingsScreenProps) {
  const title = useThisOrThatCreatorSelector(selectTitle)
  const options = useThisOrThatCreatorSelector(selectOptions)
  const dispatch = useThisOrThatCreatorDispatch()

  const questions = useThisOrThatCreatorSelector(selectQuestions)
  const numQuestions = questions.length

  return (
    <div className={styles.settingsScreenContainer}>
      <div className={styles.settingsScreen}>
        <h2>Widget Settings</h2>

        <InsetBox>
          <LabelledTextbox
            label="Widget Title"
            placeholder="Enter a title here..."
            value={title}
            onChange={(e) => dispatch(setTitle(e.target.value))}
          />
        </InsetBox>

        <InsetBox>
          <h3>Theme</h3>

          <div className={styles.themeOptions}>
            <button
              className={clsx({
                [styles.themeOption]: true,
                [styles.active]: options.theme === 'business',
              })}
              onClick={() => dispatch(setTheme('business'))}
            >
              <img src="assets/business-theme.png" alt="" />
              Business
            </button>
            <button
              className={clsx({
                [styles.themeOption]: true,
                [styles.active]: options.theme === 'whimsical',
              })}
              onClick={() => dispatch(setTheme('whimsical'))}
            >
              <img src="assets/whimsical-theme.png" alt="" />
              Whimsical
            </button>
          </div>
        </InsetBox>

        <InsetBox>
          <h3>Questions</h3>
          <div className={styles.questionsSettingsContainer}>
            <div className={styles.useQuestionBankContainer}>
              <Checkbox
                key="useQuestionBank"
                checked={options.enableQuestionBank}
                onChange={((e) => dispatch(setUseQuestionBank(e.target.checked)))}
                tooltip="When enabled, a random subset of questions will be chosen every time the player plays.">
                Use question bank
              </Checkbox>
              {options.enableQuestionBank && (
                <div className={styles.bankSizeContainer}>
                  <img className={styles.childItem} src="assets/child-item.svg" alt="" />
                  <label className={styles.bankSize}>
                    Question bank size:
                    <input
                      className={styles.numberInput}
                      type="number"
                      value={options.questionBankVal}
                      min={1}
                      max={numQuestions}
                      onBlur={(e) => {
                        // Validate number
                        try {
                          const value = parseInt(e.target.value)
                          if (value > numQuestions) dispatch(setQuestionBankSize(numQuestions))
                          else if (value < 1) dispatch(setQuestionBankSize(1))
                          else if (isNaN(value)) dispatch(setQuestionBankSize(numQuestions))
                        } catch {
                          dispatch(setQuestionBankSize(numQuestions))
                        }
                      }}
                      onChange={(e) => dispatch(setQuestionBankSize(parseInt(e.target.value)))}
                    />
                    <span className={styles.outOfText}>{`out of ${numQuestions}`}</span>
                  </label>
                </div>
              )}
            </div>
            <Checkbox
              key="randomizeOrder"
              checked={options.randomizeOrder}
              onChange={((e) => dispatch(setRandomizeOrder(e.target.checked)))}
              disabled={options.enableQuestionBank}>
              Randomize question order
            </Checkbox>
          </div>
        </InsetBox>
      </div>
    </div>
  )
}
