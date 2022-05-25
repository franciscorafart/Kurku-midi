import { WrappedEffect } from "./audioCtx";

export type KeyedEffectType = { [index: string]: AudioNode | WrappedEffect };

export type ChannelType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16

export type MidiOutputType = {
    connection: string,
    id: string,
    manufacturer: string,
    name: string,
    state: string,
    type: string,
    version: string,
}

export type SetterType = (channel: ChannelType, controller: number, velocity: number) => void
 