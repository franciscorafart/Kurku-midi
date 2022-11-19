import createDataCacheAPI from "@jackcom/adi-cacheducks";
import effectsDBAPI, { DBEffect } from "./effectConfig";
import sessionsDBAPI, { DBSession } from "./sessionConfig";
const cacheMap = {
  effects: effectsDBAPI,
  sessions: sessionsDBAPI,
};

const ADI = createDataCacheAPI(cacheMap);

export default ADI;

/** Enable `ADI` for interactions and caching */
export async function initializeADI() {
  // Subscribe to ADI
  ADI.onApplicationStart();
}

export async function initSessions() {
  const { data: sessions } = await ADI.listItems({ cacheKey: "sessions" });
  return sessions as DBSession[];
}

export async function initEffects() {
  const { data: effects } = await ADI.listItems({ cacheKey: "effects" });
  return effects as DBEffect[];
}
