import { BodyPartKey, ScreenRange, ValueRange } from "./shared";
import { ChannelType } from "utils/types";
// @ts-ignore
import { v4 } from "uuid";

export const defaultMidiEffects: CCEffectType[] = [
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

// TODO: Add midiNoteType
