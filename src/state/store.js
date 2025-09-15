// centrálne miesto pravdy
const state = {
  clubs: [],
  filtered: [],
  selectedId: null,
  filters: { q: "", region: "", ice: "" }
};

const subs = new Set();
export function subscribe(fn){ subs.add(fn); return () => subs.delete(fn); }
function emit(){ subs.forEach(fn => fn(state)); }

// getters
export const getState = () => state;

// mutácie
export function setClubs(clubs){ state.clubs = clubs; emit(); }
export function setFiltered(list){ state.filtered = list; emit(); }
export function setSelected(id){ state.selectedId = id; emit(); }
export function setFilters(partial){ Object.assign(state.filters, partial); emit(); }
