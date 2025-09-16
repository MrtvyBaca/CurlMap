// utils/debounce.js
export function debounce(fn, wait = 120){
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
