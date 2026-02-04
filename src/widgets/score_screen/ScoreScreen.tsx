import './score-screen-globals.css'
import { useLayoutEffect } from 'react'

interface ScoreScreenProps {
  qset: ThisOrThatQset,
  rawScoreTable: any, // TODO
  reportHeight: (newHeight: number) => void,
}

export default function ScoreScreen({ qset, rawScoreTable, reportHeight }: ScoreScreenProps) {
  // Get height right before screen gets painted, report it to the height reporter
  useLayoutEffect(() => {
    const htmlCompStyle = window.getComputedStyle(document.querySelector('html'))
    reportHeight(Math.ceil(parseFloat(htmlCompStyle.height)))
  }, [reportHeight])

  return (
    <>
      Hello, score screen!
    </>
  )
}
