export function setMxCellForm (state, val) {
  state.mxCellForm = {}
  state.mxCellForm = Object.assign(state.mxCellForm, val)
}
export function setAuthorities (state, val) {
  state.authorities = val
}
export function setPreNodes (state, val) {
  state.preNodes = val
}
export function setNextNodes (state, val) {
  state.nextNodes = val
}
export function setRoot (state, val) {
  state.root = val
}
