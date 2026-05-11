import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface GameState {
  currentQuestion: number,
  answers: string[],
  qset: ThisOrThatQset | undefined,
}

export const gameStateSlice = createSlice({
  name: 'gameState',
  initialState: {
    currentQuestion: 0,
    answers: [],
    qset: undefined,
  } satisfies GameState as GameState,
  reducers: {
    initGame: (state, action: PayloadAction<ThisOrThatQset>) => {
      state.qset = action.payload
    },
    answerQuestion: (state, action: PayloadAction<string>) => {
      // Reject if this question has been answered already
      if (state.answers[state.currentQuestion]) return
      state.answers[state.currentQuestion] = action.payload
    },
    goToNextQuestion: (state) => {
      state.currentQuestion++
    },
  },
  selectors: {
    selectQset: (state) => state.qset,
    selectCurrentQuestionIndex: (state) => state.currentQuestion,
    selectCurrentQuestion: (state) => state.qset?.items[state.currentQuestion],
    selectQuestionPhase: (state): 'unanswered' | 'answered' => {
      if (state.answers.length - 1 === state.currentQuestion) {
        // The current question has been answered, we are waiting to go to the next one
        return 'answered'
      }
      return 'unanswered'
    },
    selectIsGameFinished: (state) => {
      return (state.qset) && (state.currentQuestion >= (state.qset?.items.length ?? 0))
    },
    selectTotalNumberOfQuestions: (state) => state.qset?.items.length ?? 0,
    selectCurrentQuestionAnswer: (state) => {
      const picked = state.answers[state.currentQuestion] ?? null
      if (!picked) return null
      const qsetAnswer = state.qset?.items[state.currentQuestion]?.answers.find(
        (ans) => ans.id === picked,
      )
      return {
        picked: picked,
        correct: qsetAnswer?.value > 0,
      }
    },
  },
})

export const {
  initGame,
  answerQuestion,
  goToNextQuestion,
} = gameStateSlice.actions

export const {
  selectQset,
  selectCurrentQuestionIndex,
  selectCurrentQuestion,
  selectQuestionPhase,
  selectIsGameFinished,
  selectTotalNumberOfQuestions,
  selectCurrentQuestionAnswer,
} = gameStateSlice.selectors

export default gameStateSlice.reducer
