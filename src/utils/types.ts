export type ChannelType =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16;

export type MidiNoteMessageType = {
  on: number;
  off: number;
};

export type MidiOutputType = {
  connection: string;
  id: string;
  manufacturer: string;
  name: string;
  state: string;
  type: string;
  version: string;
};

export type SetterType = (
  channel: ChannelType,
  controller: number,
  velocity: number
) => void;

export type InputOutputObjectType = {
  input: number;
  output: number;
};
export type InputOutputMap = {
  [key: string]: InputOutputObjectType;
};
