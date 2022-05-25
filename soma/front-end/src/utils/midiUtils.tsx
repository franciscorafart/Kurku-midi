import { MidiSessionConfigType } from "config/midi";
import { ChannelType } from "./types";
import { scaleWindowToRange } from './utils'

export const mapGlobalConfigsToMidi = (
    sessionConfig: MidiSessionConfigType,
    bodyPartPositions: any, // TODO: create body part positions type
    ccSender: (channel: ChannelType, controller: number, velocity: number) => void,
  ) => {
    for (const effect of sessionConfig.midi) {
        const bodyPart = effect.bodyPart;
        const position = bodyPartPositions[bodyPart][effect.direction];
  
        if (position !== undefined) {
            const screenRange = effect.screenRange;
            const valueRange = effect.valueRange;
            const [scaledValue, _] = scaleWindowToRange(
            screenRange.a,
            screenRange.b,
            valueRange.x,
            valueRange.y,
            position
            );

            const {channel, controller} = effect
            ccSender(channel, controller, scaledValue)
        }
    }
  };