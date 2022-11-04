import Dexie from "dexie";
import {
  ADIDBInterface,
  ListQueryOpts,
  paginate,
  PaginatedDBResults,
} from "./shared";

// Make a session table that stores references to multiple effects
export type DBSession = {
  id: string;
  name: string;
};

class SessionsDB extends Dexie {
  public sessions: Dexie.Table<DBSession, string>;

  constructor() {
    super("SessionsDB");

    const sessionColumns = ["id", "name"];

    const sessions = sessionColumns.toString();
    this.version(1).stores({ sessions });
    this.sessions = this.table("sessions");
  }
}

const db = new SessionsDB();
const sessionsDBAPI: ADIDBInterface<DBSession | any> = {
  getItem: getSessionByName,
  listItems: listSessions,
  putItem: addOrUpdateSession,
  removeItem: removeSession,
};

export default sessionsDBAPI;

export async function getSessionByName(id: string) {
  const session = await db.sessions.where({ id }).first();
  if (!session) return null;

  return session;
}

export async function listSessions(
  opts: ListQueryOpts
): Promise<PaginatedDBResults<DBSession>> {
  const dbSessions = await db.sessions.toArray();
  return paginate(dbSessions, opts);
}

export async function removeSession(id: string) {
  await db.sessions.delete(id);
  return id;
}

async function addOrUpdateSession(id: string, data: DBSession) {
  const dbSession: DBSession = {
    id,
    name: data.name,
  };

  return db.sessions.put(dbSession, id).then(() => data);
}
