import Dexie from "dexie";
import { BodyPartKey } from "config/shared";
import {
  ADIDBInterface,
  ListQueryOpts,
  paginate,
  PaginatedDBResults,
} from "./shared";

// Make a session table that stores references to multiple effects
export type DBEffect = {
  id: string;
  sessionId: string;
  cc: number;
  bodyPart: BodyPartKey;
  direction: "vertical" | "horizontal";
  inputFrom: number;
  inputTo: number;
  outputFrom: number;
  outputTo: number;
  channel: number;
};

class EffectsDB extends Dexie {
  public effects: Dexie.Table<DBEffect, string>;

  constructor() {
    super("EffectsDB");

    const effectColumns = [
      "id",
      "sessionId",
      "cc",
      "bodyPart",
      "direction",
      "inputFrom",
      "inputTo",
      "outputFrom",
      "outputTo",
    ];

    const effects = effectColumns.toString();
    this.version(1).stores({ effects });
    this.effects = this.table("effects");
  }
}

const db = new EffectsDB();
const effectDBAPI: ADIDBInterface<DBEffect | any> = {
  getItem: getEffectByName,
  listItems: listEffects,
  putItem: addOrUpdateEffect,
  removeItem: removeEffect,
};

export default effectDBAPI;

export async function getEffectByName(id: string) {
  const session = await db.effects.where({ id }).first();
  if (!session) return null;

  return session;
}

export async function listEffects(
  opts: ListQueryOpts
): Promise<PaginatedDBResults<DBEffect>> {
  const dbEffects = await db.effects.toArray();
  return paginate(dbEffects, opts);
}

export async function removeEffect(id: string) {
  await db.effects.delete(id);
  return id;
}

async function addOrUpdateEffect(id: string, data: DBEffect) {
  const dbEffect: DBEffect = {
    id,
    sessionId: data.sessionId,
    cc: data.cc,
    bodyPart: data.bodyPart,
    channel: data.channel || 1,
    direction: data.direction,
    inputFrom: data.inputFrom,
    inputTo: data.inputTo,
    outputFrom: data.outputFrom,
    outputTo: data.outputTo,
  };

  return db.effects.put(dbEffect, id).then(() => data);
}
