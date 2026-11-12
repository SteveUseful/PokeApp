import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncReminder } from './lib/notifications';
// Domain helpers are CommonJS so Node can exercise the same code as the app.
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const E = require('./domain/engine');
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const P = require('./domain/prep');
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const M = require('./domain/mobile');
export const species = require('./domain/species.json');
const KEY = 'raidwell-native-v1';
type Store = { state: any; loaded: boolean; saveError: boolean; reminderError: string | null; run: (fn: (draft: any) => void) => boolean; reset: () => void };
const Context = createContext<Store | null>(null);
export function RaidProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(M.initial), [loaded, setLoaded] = useState(false), [saveError, setSaveError] = useState(false);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const latest = useRef(state), writes = useRef(Promise.resolve());
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY).then(raw => { const restored = M.restore(raw); if (alive) { latest.current = restored; setState(restored); } })
      .catch(() => Alert.alert('Session could not be restored', 'Your saved session is unreadable. A fresh local session has been opened.'))
      .finally(() => { if (alive) setLoaded(true); });
    return () => { alive = false; };
  }, []);
  const persist = useCallback((next: any) => {
    const snapshot = JSON.stringify(next);
    writes.current = writes.current.then(() => AsyncStorage.setItem(KEY, snapshot)).then(() => setSaveError(false)).catch(() => setSaveError(true));
  }, []);
  const run = useCallback((fn: (draft: any) => void) => {
    if (!loaded) return false;
    try { const draft = JSON.parse(JSON.stringify(latest.current)); fn(draft); latest.current = draft; setState(draft); persist(draft); return true; }
    catch (error: any) { Alert.alert('Check this step', error.message); return false; }
  }, [loaded, persist]);
  useEffect(() => {
    if (!loaded) return;
    const listener = AppState.addEventListener('change', next => { if (next === 'active') run(d => M.resume(d)); else persist(latest.current); });
    const timer = setInterval(() => {
      const current = latest.current; if (!current.room && !current.queue) return;
      if (current.room?.expires <= Date.now()) { run(d => E.closeRoom(d, 'Room expired')); return; }
      if (AppState.currentState === 'active' && current.settings.auto) run(d => E.tick(d));
    }, 4000);
    return () => { listener.remove(); clearInterval(timer); };
  }, [loaded, persist, run]);
  const roomId = state.room?.id, expires = state.room?.expires, reminderEnabled = state.settings.notifications;
  useEffect(() => { if (loaded) syncReminder(roomId, expires, reminderEnabled).then(() => setReminderError(null)).catch((e: Error) => setReminderError(e.message || 'Reminder could not be scheduled.')); }, [loaded, roomId, expires, reminderEnabled]);
  return <Context.Provider value={{ state, loaded, saveError, reminderError, run, reset: () => { run(d => Object.assign(d, M.initial())); } }}>{children}</Context.Provider>;
}
export function useRaid() { const value = useContext(Context); if (!value) throw new Error('RaidProvider missing'); return value; }
