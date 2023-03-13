import { BodyPartKey, ScreenRange, ValueRange } from "./shared";
import { ChannelType } from "utils/types";
// @ts-ignore
import { v4 } from "uuid";

export const defaultMidiEffects: MidiEffectType[] = [
  {
    uid: v4(),
    sessionId: undefined,
    direction: "y", // horizontal
    screenRange: { a: 0, b: 1 },
    valueRange: { x: 0, y: 127 },
    scaleFactor: 1,
    bodyPart: "rightWrist",
    previousValue: 0,
    targetValue: 0,
    channel: 1,
    controller: 40,
  },
  //   {
  //     uid: v4(),
  //     direction: "y", // vertical
  //     screenRange: { a: 0.5, b: 0.8 },
  //     valueRange: { x: 0, y: 127 },
  //     scaleFactor: 1,
  //     bodyPart: "leftWrist",
  //     previousValue: 0,
  //     targetValue: 0,
  //     channel: 1,
  //     controller: 41,
  //   },
  //   {
  //     uid: v4(),
  //     direction: "y", // vertical
  //     screenRange: { a: 0.75, b: 1 },
  //     valueRange: { x: 0, y: 127 },
  //     scaleFactor: 1,
  //     bodyPart: "rightWrist",
  //     previousValue: 0,
  //     targetValue: 0,
  //     channel: 1,
  //     controller: 42,
  //   },
];

export interface MidiEffectType {
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
