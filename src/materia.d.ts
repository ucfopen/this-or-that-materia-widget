interface ThisOrThatQset extends Materia.Qset {
  items: ThisOrThatQsetItem[],
  options: ThisOrThatQsetSettings,
  version: number,
}

interface ThisOrThatQsetItem extends Materia.QsetItem {
  id: string,
  materiaType: string,
  type: string,
  questions: ThisOrThatQsetQuestion[],
  answers: ThisOrThatQsetAnswer[],
}

type ThisOrThatQsetQuestion = {
  text: string,
}

type ThisOrThatQsetAnswer = {
  id: string,
  text: string,
  value: number,
  options: ThisOrThatAnswerOptions,
}

type ThisOrThatAnswerOptions = {
  asset: {
    materiaType: string,
    id: string,
    type?: 'text' | 'image' | 'video' | 'audio',
    value?: string,
  },
  feedback?: string,
}

type ThisOrThatQsetSettings = {
  enableQuestionBank?: boolean,
  questionBankVal?: number,
  randomizeOrder?: boolean,
  theme?: Theme,
}

type MediaType = 'text' | 'image' | 'video' | 'audio'
type Theme = 'business' | 'whimsical'
