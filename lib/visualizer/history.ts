export type History<T> = { past: T[]; present: T; future: T[] };
export function history<T>(present: T): History<T> {
  return { present, past: [], future: [] };
}
export function commit<T>(state: History<T>, present: T): History<T> {
  return {
    present,
    past: [...state.past.slice(-29), state.present],
    future: [],
  };
}
export function undo<T>(state: History<T>): History<T> {
  if (!state.past.length) return state;
  return {
    present: state.past[state.past.length - 1],
    past: state.past.slice(0, -1),
    future: [state.present, ...state.future],
  };
}
export function redo<T>(state: History<T>): History<T> {
  if (!state.future.length) return state;
  return {
    present: state.future[0],
    past: [...state.past, state.present],
    future: state.future.slice(1),
  };
}
