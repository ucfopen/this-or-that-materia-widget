import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type AnswerSide = 'correct' | 'incorrect'

interface CreatorState {
  title: string,
  currentQuestion: number,
  qset: ThisOrThatQset | undefined,
  errors: {
    title: boolean,
    questions: {
      [key: string]: {
        questionText: boolean,
        correctChoice: boolean,
        incorrectChoice: boolean,
      },
    },
  },
  randomizeOrderCached: boolean,
}

function randomId() {
  return Math.floor(Math.random() * 1000000)
}

export const creatorStateSlice = createSlice({
  name: 'creatorState',
  initialState: {
    title: '',
    currentQuestion: 0,
    qset: undefined,
    errors: { title: false, questions: {} },
    randomizeOrderCached: false,
  } satisfies CreatorState as CreatorState,
  reducers: {
    initCreator: (state, action: PayloadAction<ThisOrThatQset>) => {
      state.qset = action.payload

      // Initialize an empty qset if it's null
      if (!state.qset) {
        state.qset = {
          items: [],
          options: {},
          version: 2,
        }
      }

      // Insert 'image' type for all assets that don't have one yet
      state.qset.items.forEach((item) => {
        item.answers.forEach((ans) => {
          if (!ans.options.asset.type) ans.options.asset.type = 'image'
        })
      })

      // Make sure all options exist
      if (state.qset.options == undefined) state.qset.options = {}
      if (state.qset.options['enableQuestionBank'] == undefined) state.qset.options.enableQuestionBank = false
      if (state.qset.options['questionBankVal'] == undefined) state.qset.options.questionBankVal = 1
      if (state.qset.options['randomizeOrder'] == undefined) state.qset.options.randomizeOrder = false
      if (state.qset.options['theme'] == undefined) state.qset.options.theme = 'business'

      // Set initial randomize order cached value
      state.randomizeOrderCached = state.qset.options.randomizeOrder
    },
    setCurrentQuestion: (state, action: PayloadAction<number>) => {
      state.currentQuestion = action.payload
    },
    createNewQuestion: (state) => {
      state.qset.items.push({
        id: `question-${randomId()}`,
        materiaType: 'question',
        type: 'MC',
        questions: [{ text: '' }],
        answers: [
          {
            id: 'left',
            text: '',
            value: 100,
            options: {
              asset: {
                materiaType: 'asset',
                id: '',
                type: 'image',
                value: ''
              },
              feedback: ''
            }
          },
          {
            id: 'right',
            text: '',
            value: 0,
            options: {
              asset: {
                materiaType: 'asset',
                id: '',
                type: 'image',
                value: ''
              },
              feedback: ''
            }
          },
        ],
      })
    },
    setCurrentQuestionText: (state, action: PayloadAction<string>) => {
      const question = state.qset.items[state.currentQuestion]
      question.questions[0].text = action.payload
      // clear errors
      if (state.errors.questions[question.id])
        state.errors.questions[question.id].questionText = false
    },
    setCurrentQuestionMediaType: (state, action: PayloadAction<{ side: AnswerSide, type: MediaType }>) => {
      const { side, type } = action.payload
      const answerIndex = side === 'correct' ? 0 : 1
      state.qset.items[state.currentQuestion].answers[answerIndex].options.asset.type = type
    },
    setCurrentQuestionMediaId: (state, action: PayloadAction<{ side: AnswerSide, id: string }>) => {
      const { side, id } = action.payload
      const answerIndex = side === 'correct' ? 0 : 1
      state.qset.items[state.currentQuestion].answers[answerIndex].options.asset.id = id
    },
    setCurrentQuestionMediaUrl: (state, action: PayloadAction<{ side: AnswerSide, url: string }>) => {
      const { side, url } = action.payload
      const answerIndex = side === 'correct' ? 0 : 1
      const question = state.qset.items[state.currentQuestion]
      question.answers[answerIndex].options.asset.value = url
      // clear errors
      if (state.errors.questions[question.id])
        if (side === 'correct')
          state.errors.questions[question.id].correctChoice = false
        else
          state.errors.questions[question.id].incorrectChoice = false
    },
    setCurrentQuestionDescription: (state, action: PayloadAction<{ side: AnswerSide, desc: string }>) => {
      const { side, desc } = action.payload
      const answerIndex = side === 'correct' ? 0 : 1
      state.qset.items[state.currentQuestion].answers[answerIndex].text = desc
    },
    setCurrentQuestionFeedback: (state, action: PayloadAction<{ side: AnswerSide, feedback: string }>) => {
      const { side, feedback } = action.payload
      const answerIndex = side === 'correct' ? 0 : 1
      state.qset.items[state.currentQuestion].answers[answerIndex].options.feedback = feedback
    },
    deleteCurrentQuestion: (state) => {
      state.qset.items.splice(state.currentQuestion, 1)
      state.currentQuestion = Math.min(state.qset.items.length - 1, state.currentQuestion)
      state.currentQuestion = Math.max(0, state.currentQuestion)
    },
    moveQuestion: (state, action: PayloadAction<{ from: string, to: string }>) => {
      const { from, to } = action.payload
      const fromIndex = state.qset.items.findIndex((item) => item.id === from)
      const toIndex = state.qset.items.findIndex((item) => item.id === to)
      const [item] = state.qset.items.splice(fromIndex, 1)
      state.qset.items.splice(toIndex, 0, item)
      if (state.currentQuestion === fromIndex) state.currentQuestion = toIndex
    },
    moveCurrentQuestionUp: (state) => {
      if (state.currentQuestion <= 0) return
      const [item] = state.qset.items.splice(state.currentQuestion, 1)
      state.qset.items.splice(state.currentQuestion - 1, 0, item)
      state.currentQuestion = Math.max(0, state.currentQuestion - 1)
    },
    moveCurrentQuestionDown: (state) => {
      if (state.currentQuestion >= state.qset.items.length - 1) return
      const [item] = state.qset.items.splice(state.currentQuestion, 1)
      state.qset.items.splice(state.currentQuestion + 1, 0, item)
      state.currentQuestion = Math.min(state.qset.items.length, state.currentQuestion + 1)
    },
    markErrors: (state) => {
      // Clear errors
      state.errors = { title: false, questions: {} }

      // Check title
      if (!state.title) state.errors.title = true

      // Check questions
      for (let question of state.qset.items) {
        const questionErrors = { questionText: false, correctChoice: false, incorrectChoice: false }
        if (!question.questions[0].text) questionErrors.questionText = true
        if (!question.answers[0].options.asset.value) questionErrors.correctChoice = true
        if (!question.answers[1].options.asset.value) questionErrors.incorrectChoice = true
        state.errors.questions[question.id] = questionErrors
      }
    },
    setUseQuestionBank: (state, action: PayloadAction<boolean>) => {
      state.qset.options.enableQuestionBank = action.payload
      if (action.payload)
        state.qset.options.randomizeOrder = true
      else
        state.qset.options.randomizeOrder = state.randomizeOrderCached
    },
    setQuestionBankSize: (state, action: PayloadAction<number>) => {
      state.qset.options.questionBankVal = action.payload
    },
    setRandomizeOrder: (state, action: PayloadAction<boolean>) => {
      state.qset.options.randomizeOrder = action.payload
      state.randomizeOrderCached = action.payload
    },
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.qset.options.theme = action.payload
    },
  },
  selectors: {
    selectQset: (state) => state.qset,
    selectCurrentQuestion: (state) => state.qset?.items[state.currentQuestion],
    selectCurrentQuestionIndex: (state) => state.currentQuestion,
    selectQuestion: (state) => state.qset?.items[state.currentQuestion],
    selectQuestions: (state) => state.qset?.items,
    selectCurrentQuestionAnswer: (state, side: AnswerSide) => {
      const sideIndex = side === 'correct' ? 0 : 1
      return state.qset?.items[state.currentQuestion].answers[sideIndex]
    },
    selectErrors: (state) => state.errors,
    selectCurrentQuestionErrors: (state) => {
      const questionId = state.qset.items[state.currentQuestion].id
      if (state.errors.questions[questionId])
        return state.errors.questions[questionId]
      return { questionText: false, correctChoice: false, incorrectChoice: false }
    },
    selectOptions: (state) => state.qset?.options,
    selectTitle: (state) => state.title,
  },
})

export const {
  initCreator,
  setCurrentQuestion,
  createNewQuestion,
  setCurrentQuestionText,
  setCurrentQuestionMediaType,
  setCurrentQuestionMediaId,
  setCurrentQuestionMediaUrl,
  setCurrentQuestionDescription,
  setCurrentQuestionFeedback,
  deleteCurrentQuestion,
  moveQuestion,
  moveCurrentQuestionUp,
  moveCurrentQuestionDown,
  markErrors,
  setUseQuestionBank,
  setQuestionBankSize,
  setRandomizeOrder,
  setTitle,
  setTheme,
} = creatorStateSlice.actions

export const {
  selectQset,
  selectCurrentQuestion,
  selectCurrentQuestionIndex,
  selectQuestion,
  selectQuestions,
  selectCurrentQuestionAnswer,
  selectErrors,
  selectCurrentQuestionErrors,
  selectOptions,
  selectTitle,
} = creatorStateSlice.selectors

export default creatorStateSlice.reducer
