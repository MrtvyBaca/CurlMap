import { fmtDate, splitTournaments, TRUNCATE_N, makeTruncateSpan } from "../utils/format.js";

export function popupHTML(c){
  const v = c.venue || {};
  const sheets = v.sheets != null ? `${v.sheets} sheets` : '? sheets';
  const indoor = v.indoor == null ? '' : (v.indoor ? '• indoor' : '• outdoor');
  const addr = v.address ? `<div class="small">📍 ${v.address}</div>` : '';
  const websiteLink = c.website ? `<a href="${c.website}" target="_blank" rel="noopener">Website</a>` : '';

  const { upcoming, past } = splitTournaments(c);

  return `
    <div>
      <strong>${c.name}</strong><br/>
      <span class="small">${c.city}, ${c.country}</span>
      ${addr}
      <div class="small">🧊 ${sheets} ${indoor}</div>

      <div class="popup-links">
        <a href="javascript:void(0)" onclick="toggleClubPopup('${c.id}')">Events</a>
        ${websiteLink}
      </div>

      <div id="popup-detail-${c.id}" style="display:none; margin-top:8px">
        <div class="popup-scroll">
          ${tableHTML(upcoming, past)}
        </div>

        <div class="popup-links" style="margin-top:8px">
          <a href="javascript:void(0)" onclick="addTournament('${c.id}')">Add tournament</a>
        </div>
      </div>
    </div>
  `;
}

function tableHTML(upcoming, past){
  const rows = [];
  if (upcoming.length) {
    rows.push(`<tr class="sep"><td colspan="3"><strong>Upcoming</strong></td></tr>`);
    upcoming.forEach(t => rows.push(rowHTML(t)));
  } else {
    rows.push(`<tr class="sep"><td colspan="3"><span class="small">No upcoming tournaments</span></td></tr>`);
  }
  if (past.length) {
    rows.push(`<tr class="sep"><td colspan="3" style="padding-top:8px"><strong>Past</strong></td></tr>`);
    past.forEach(t => rows.push(rowHTML(t)));
  } else {
    rows.push(`<tr class="sep"><td colspan="3"><span class="small">No past tournaments</span></td></tr>`);
  }

  return `
    <table class="popup-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Tournament</th>
          <th>Info</th>
        </tr>
      </thead>
      <tbody>${rows.join("")}</tbody>
    </table>
  `;
}

function rowHTML(t){
  const dateCell  = `${fmtDate(t.start)}${t.end ? ' – ' + fmtDate(t.end) : ''}`;
  const titleCell = t.url
    ? `<a href="${t.url}" target="_blank" rel="noopener">${makeTruncateSpan(t.title, TRUNCATE_N)}</a>`
    : makeTruncateSpan(t.title, TRUNCATE_N);
  const notesCell = t.notes ? makeTruncateSpan(t.notes, 50) : '<span class="small">—</span>';
  const city = t.city ? ' – ' + makeTruncateSpan(t.city, 16) : '';

  return `
    <tr>
      <td>${dateCell}</td>
      <td><strong>${titleCell}</strong>${city}</td>
      <td>${notesCell}</td>
    </tr>
  `;
}
