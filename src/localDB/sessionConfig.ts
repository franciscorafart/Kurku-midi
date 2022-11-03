import Dexie from "dexie";
import { BodyPartKey } from "config/shared";
import {
  ADIDBInterface,
  ListQueryOpts,
  paginate,
  PaginatedDBResults,
} from "./shared";

type DBSession = {
  id: string;
  name: string;
  cc: number;
  bodyPart: BodyPartKey;
  direction: "vertical" | "horizontal";
  inputFrom: number;
  inputTo: number;
  outputFrom: number;
  outputTo: number;
};

class SessionDB extends Dexie {
  public sessions: Dexie.Table<DBSession, string>;

  constructor() {
    super("SessionDB");

    const sessionColumns = [
      "id",
      "name",
      "cc",
      "bodyPart",
      "direction",
      "inputFrom",
      "inputTo",
      "outputFrom",
      "outputTo",
    ];

    const sessions = sessionColumns.toString();
    this.version(1).stores({ sessions });
    this.sessions = this.table("sessions");
  }
}

const db = new SessionDB();
const poolsDBAPI: ADIDBInterface<DBSession | any> = {
  getItem: getSessionByName,
  listItems: listSessions,
  putItem: addOrUpdateSession,
  removeItem: removeSession,
};

export default poolsDBAPI;

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
    cc: data.cc,
    bodyPart: data.bodyPart,
    direction: data.direction,
    inputFrom: data.inputFrom,
    inputTo: data.inputFrom,
    outputFrom: data.outputFrom,
    outputTo: data.outputTo,
  };

  return db.sessions.put(dbSession, id).then(() => data);
}
