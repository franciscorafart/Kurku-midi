import createDataCacheAPI from "@jackcom/adi-cacheducks";
import sessionsDBAPI from "./sessionConfig";

const cacheMap = {
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
  return sessions;
}
