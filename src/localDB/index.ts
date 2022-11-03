import createDataCacheAPI from "@jackcom/adi-cacheducks";
import sessionsDBAPI from "./sessionConfig";

const cacheMap = {
  sessions: sessionsDBAPI,
};

const ADI = createDataCacheAPI(cacheMap);

export default ADI;
