export type Message = {
  message: string,
  from: 'game' | 'player',
}

export type Snackbar = {
  message: string,
  key: string | number,
  buttonLabel: string,
  buttonAction: () => void,
}
