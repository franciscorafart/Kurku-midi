import { CCEffectType } from "config/midi";
import { BodyPartPositionType, Box, ValueRange } from "config/shared";
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
  ) => void
) => {
  // 1. Extract absoulte position in x & y axis of body parts
  const positions = Object.entries(bodyPartPositions)
    .map(([_, position]) => position)
    .filter(
      (position) => position.x !== undefined && position.y !== undefined
    ) as ValueRange[]; // Casting safe because of filtering

  // boxes come from state as parameter
  const boxes: Box[] = [{ xMax: 1, xMin: 0.7, yMax: 1, yMin: 0.7 }];

  // TODO: Make this more efficient
  for (const box of boxes) {
    const inTheBox = positions.find((p) => isWithinBox(box, p));
    if (inTheBox) {
      console.log("Midi trigger!");
    }
  }
  // 2. Compare to all boxes (to an arbitrary box to test at the beggining),
  // 3. If found, send midi and break iteration
};
