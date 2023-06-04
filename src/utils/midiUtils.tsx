import { CCEffectType, MidiNotesObjectType } from "config/midi";
import { BodyPartPositionType, ValueRange } from "config/shared";
import { ChannelType, InputOutputMap } from "./types";
import { isWithinBox, scaleWindowToRange } from "./utils";

export const mapGlobalConfigsToMidi = (
  midiFx: CCEffectType[],
  bodyPartPositions: BodyPartPositionType,
  ccSender: (channel: ChannelType, controller: number, velocity: number) => void
) => {
  const valueObject: InputOutputMap = {};

  for (const effect of midiFx) {
    const bodyPart = effect.bodyPart;
    const position = bodyPartPositions[bodyPart][effect.direction];

    if (position !== undefined) {
      const screenRange = effect.screenRange;
      const valueRange = effect.valueRange;
      const [scaledValue, windowedValue] = scaleWindowToRange(
        screenRange.a,
        screenRange.b,
        valueRange.x,
        valueRange.y,
        position
      );
      const { channel, controller } = effect;
      ccSender(channel, controller, scaledValue);
      const uid = effect.uid;

      // CC meter visualization
      valueObject[uid] = { input: windowedValue, output: scaledValue };
    }
  }

  return valueObject;
};

export const mapPositionsToMIDINotes = (
  bodyPartPositions: BodyPartPositionType,
  noteSender: (
    channel: ChannelType,
    noteOn: boolean,
    note: number,
    velocity: number
  ) => void,
  notes: MidiNotesObjectType
) => {
  // 1. Extract absoulte position in x & y axis of body parts
  const positions = Object.entries(bodyPartPositions)
    .map(([_, position]) => position)
    .filter(
      (position) => position.x !== undefined && position.y !== undefined
    ) as ValueRange[]; // Casting safe because of filtering

  // TODO: Make this more efficient
  for (const [uid, noteObj] of Object.entries(notes)) {
    const box = noteObj.box;
    // 3. If found, send midi and break iteration
    const inTheBox = positions.find((p) => isWithinBox(box, p));
    if (inTheBox) {
      console.log("Midi trigger note:", uid);
      noteSender(noteObj.channel, true, noteObj.note, 127);
    }
  }
};

export const findAvailableCCorNote = (ccList: number[]) => {
  for (let i = 1; i <= 127; i++) {
    if (ccList.includes(i)) {
      continue;
    }
    return i;
  }

  return 1;
};
