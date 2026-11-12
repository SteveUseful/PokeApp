const E = require('./engine');
const defaults = { auto: true, scenario: 'smooth', notifications: false, haptics: true };
function initial() { return { ...E.initial(), profile: { name: '', code: '', level: 40, team: 'Mystic' }, settings: { ...defaults }, onboarded: false, returnedAt: null }; }
function profile(input) {
  const name = String(input.name || '').trim(), code = String(input.code || '').replace(/\s/g, ''), level = Number(input.level);
  if (name.length < 1 || name.length > 30) throw Error('Enter your exact in-game trainer name.');
  if (!/^\d{12}$/.test(code)) throw Error('Your friend code must contain 12 digits.');
  if (!Number.isInteger(level) || level < 1 || level > 100) throw Error('Enter a trainer level between 1 and 100.');
  return { name, code, level, team: ['Mystic', 'Valor', 'Instinct', 'None'].includes(input.team) ? input.team : 'None' };
}
function restore(raw, now = Date.now()) {
  const base = initial(); if (!raw) return base; const value = JSON.parse(raw);
  if (value.version !== 2 || !value.profile || !Array.isArray(value.history)) throw Error('Saved session format is not supported.');
  const state = { ...base, ...value, settings: { ...defaults, ...value.settings }, reports: Array.isArray(value.reports) ? value.reports : [], favorites: Array.isArray(value.favorites) ? value.favorites : [] };
  if (state.room && (!Array.isArray(state.room.players) || !Array.isArray(state.room.events) || !Number.isFinite(state.room.expires))) throw Error('Saved room is incomplete.');
  if (state.queue && (!Number.isFinite(state.queue.position) || !state.queue.config)) throw Error('Saved queue is incomplete.');
  if (state.room?.expires <= now) E.closeRoom(state, 'Room expired', now);
  return state;
}
function resume(state, now = Date.now()) {
  state.returnedAt = now;
  if (state.room?.expires <= now) { E.closeRoom(state, 'Room expired', now); return; }
  if (state.room) E.log(state.room, 'Session restored after returning to Raidwell. Check your group before continuing.', now);
}
function report(state, roomId, category, detail, now = Date.now()) {
  const allowed = ['Missing invitation', 'Host cancelled', 'Guest not ready', 'Trainer name mismatch', 'Game or connection issue', 'Abusive message', 'Unknown cause'];
  const room = state.room?.id === roomId ? state.room : state.history.find(h => h.id === roomId);
  if (!room) throw Error('Choose a room from your session or history.');
  if (!allowed.includes(category)) throw Error('Choose a report category.');
  if (detail.trim().length < 5) throw Error('Add a short description of what happened.');
  if (state.reports.find(r => r.roomId === roomId && r.category === category)) throw Error('You already saved this type of report for this room.');
  const item = { id: `${now}-${Math.random().toString(36).slice(2)}`, roomId, boss: room.name, category, detail: detail.trim().slice(0, 1000), at: now, status: 'Saved on this device', events: room.events.slice(-20), response: '', disputed: false };
  state.reports.unshift(item); state.reports = state.reports.slice(0, 100); return item;
}
function respond(state, id, response) {
  const item = state.reports.find(r => r.id === id);
  if (!item) throw Error('Report not found.');
  if (response.trim().length < 5) throw Error('Describe your correction or additional context.');
  item.response = response.trim().slice(0, 1000); item.disputed = true;
}
function message(state, text, now = Date.now()) {
  if (!state.room) throw Error('Join a room first.');
  if (!text.trim()) throw Error('Type a message first.');
  state.room.messages.push({ author: state.profile.name, text: text.trim().slice(0, 300), at: now });
  state.room.messages = state.room.messages.slice(-100);
}
function toggleFavorite(state, id) { state.favorites = state.favorites.includes(id) ? state.favorites.filter(x => x !== id) : [...state.favorites, id]; }
module.exports = { initial, profile, restore, resume, report, respond, message, toggleFavorite };
