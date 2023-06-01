import Dexie from "dexie";
import { ChannelType } from "~/utils/types";
import {
  ADIDBInterface,
  ListQueryOpts,
  paginate,
  PaginatedDBResults,
} from "./shared";

// Make a session table that stores references to multiple midi notes
export type DBMidiNote = {
  id: string;
  sessionId: string;
  midiNote: number;
  channel: ChannelType;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

class MidiNoteDB extends Dexie {
  public midiNotes: Dexie.Table<DBMidiNote, string>;

  constructor() {
    super("MidiNoteDB");

    const effectColumns = [
      "id",
      "sessionId",
      "midiNote",
      "channel",
      "xMin",
      "xMax",
      "yMin",
      "yMax",
    ];

    const midiNotes = effectColumns.toString();
    this.version(2).stores({ midiNotes });
    this.midiNotes = this.table("midiNotes");
  }
}

const db = new MidiNoteDB();
const effectDBAPI: ADIDBInterface<DBMidiNote | any> = {
  getItem: getMidiNoteByName,
  listItems: listMidiNotes,
  putItem: addOrUpdateMidiNote,
  removeItem: removeMidiNote,
};

export default effectDBAPI;

export async function getMidiNoteByName(id: string) {
  const session = await db.midiNotes.where({ id }).first();
  if (!session) return null;

  return session;
}

export async function listMidiNotes(
  opts: ListQueryOpts
): Promise<PaginatedDBResults<DBMidiNote>> {
  const dbMidiNotes = await db.midiNotes.toArray();
  return paginate(dbMidiNotes, opts);
}

export async function removeMidiNote(id: string) {
  await db.midiNotes.delete(id);
  return id;
}

async function addOrUpdateMidiNote(id: string, data: DBMidiNote) {
  const dbMidiNote: DBMidiNote = {
    id,
    sessionId: data.sessionId,
    midiNote: data.midiNote,
    channel: data.channel,
    xMin: data.xMin,
    xMax: data.xMax,
    yMin: data.yMin,
    yMax: data.yMax,
  };

  return db.midiNotes.put(dbMidiNote, id).then(() => data);
}
