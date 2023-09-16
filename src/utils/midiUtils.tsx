import { CCEffectType, MidiNotesObjectType } from "config/midi";
import { BodyPartPositionType, ValueRange } from "config/shared";
import { ChannelType, InputOutputMap, MidiNoteOnOffMap } from "./types";
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
  notes: MidiNotesObjectType, // available notes to trigger (Midi Notes section)
  onOffMap: MidiNoteOnOffMap // current notes playing
) => {
  const notesPlaying = { ...onOffMap };

  // 1. Extract absoulte position in x & y axis of body parts
  const positions = Object.entries(bodyPartPositions)
    .map(([_, position]) => position)
    .filter(
      (position) => position.x !== undefined && position.y !== undefined
    ) as ValueRange[]; // Casting safe because of filtering

  // TODO: Make this more efficient
  for (const [uid, noteObj] of Object.entries(notes)) {
    const box = noteObj.box;
    // Idea: Limit positions being tracked

    // Determine if note box is being "touched" by a body part
    const inTheBox = positions.find((p) => isWithinBox(box, p));
    if (inTheBox) {
      // If note not playing, trigger, it playing, don't do anything
      if (!notesPlaying[uid]) {
        console.log("Midi note on:", uid);
        noteSender(noteObj.channel, true, noteObj.note, 127);
        notesPlaying[uid] = true;
      }
    } else if (notesPlaying[uid]) {
      noteSender(noteObj.channel, false, noteObj.note, 0);
      notesPlaying[uid] = false;
      console.log("Midi note off", uid);
    }
  }

  return notesPlaying;
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
