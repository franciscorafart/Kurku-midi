import { BodyPartKey, Box, ScreenRange, ValueRange } from "./shared";
import { ChannelType } from "utils/types";
// @ts-ignore
import { v4 } from "uuid";

export const defaultMidiCCs: CCEffectType[] = [
  {
    uid: v4(),
    sessionId: undefined,
    direction: "y", // vertical
    screenRange: { a: 0, b: 1 },
    valueRange: { x: 0, y: 127 },
    scaleFactor: 1,
    bodyPart: "rightWrist",
    previousValue: 0,
    targetValue: 0,
    channel: 1,
    controller: 40,
  },
];

export interface CCEffectType {
  uid: string;
  direction: "x" | "y";
  screenRange: ScreenRange;
  valueRange: ValueRange;
  scaleFactor: number;
  bodyPart: BodyPartKey;
  previousValue: number;
  targetValue: number;
  channel: ChannelType;
  controller: number;
  sessionId?: string;
}

// TODO: Change to string to that it's keyed on the uid
export type MidiNotesObjectType = { [index: number]: MIDINoteType };

export const defaultMidiNote: MIDINoteType = {
  uid: v4(),
  box: {
    xMin: 0.8,
    xMax: 1,
    yMin: 0.8,
    yMax: 1,
  },
  note: 60,
  channel: 1,
};

export const defaultMidiNotes: MidiNotesObjectType = {};

export interface MIDINoteType {
  uid: string;
  note: number;
  channel: ChannelType;
  box: Box;
}
