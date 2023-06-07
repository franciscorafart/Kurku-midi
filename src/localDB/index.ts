import createDataCacheAPI from "@jackcom/adi-cacheducks";
import effectsDBAPI, { DBEffect } from "./effectConfig";
import sessionsDBAPI, { DBSession } from "./sessionConfig";
import midiNotesDBAPI, { DBMidiNote } from "./midiNoteConfig";

const cacheMap = {
  effects: effectsDBAPI,
  midiNotes: midiNotesDBAPI,
  sessions: sessionsDBAPI,
};

const ADI = createDataCacheAPI(cacheMap);

export default ADI;

/** Enable `ADI` for interactions and caching */
export function initializeADI() {
  // Subscribe to ADI
  ADI.onApplicationStart();
}

export async function initSessions() {
  const { data: sessions } = await ADI.listItems({ cacheKey: "sessions" });
  // TODO: Filter user sessions, so that it doesn't get mixed up
  return sessions as DBSession[];
}

export async function initEffects() {
  const { data: effects } = await ADI.listItems({ cacheKey: "effects" });
  return effects as DBEffect[];
}

export async function initMidiNotes() {
  const { data: midiNotes } = await ADI.listItems({ cacheKey: "midiNotes" });
  return midiNotes as DBMidiNote[];
}
