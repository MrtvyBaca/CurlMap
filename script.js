const TRUNCATE_N = 20; // koľko znakov nechať pred „…“ (zmeň podľa chuti)

function escapeHTML(s){
  return (s || '').toString()
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function escapeAttr(s){
  // miernejšie esc. pre data-* atribúty
  return (s || '').toString().replace(/"/g, "&quot;");
}

function makeTruncateSpan(text, n = TRUNCATE_N){
  const t = (text || '').toString();
  const full = escapeHTML(t);
  if (t.length <= n) return `<span>${full}</span>`;
  const short = escapeHTML(t.slice(0, n)) + '…';
  // title na hover, klik prepína
  return `<span class="truncate" title="${escapeAttr(t)}" data-full="${escapeAttr(t)}" data-short="${escapeAttr(t.slice(0,n) + '…')}" data-expanded="0" onclick="toggleTruncate(this)">${short}</span>`;
}

function toggleTruncate(el){
  const expanded = el.getAttribute('data-expanded') === '1';
  if (expanded) {
    el.textContent = el.getAttribute('data-short');
    el.setAttribute('data-expanded', '0');
  } else {
    el.textContent = el.getAttribute('data-full');
    el.setAttribute('data-expanded', '1');
  }
}
