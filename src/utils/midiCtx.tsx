import { ChannelType, MidiNoteMessageType } from "./types";

const ccMessageCodeByChannel: { [index in ChannelType]: number } = {
  1: 0xb0,
  2: 0xb1,
  3: 0xb2,
  4: 0xb3,
  5: 0xb4,
  6: 0xb5,
  7: 0xb6,
  8: 0xb7,
  9: 0xb8,
  10: 0xb9,
  11: 0xba,
  12: 0xbb,
  13: 0xbc,
  14: 0xbd,
  15: 0xbe,
  16: 0xbf,
};

const midiNotesByChannel: { [index in ChannelType]: MidiNoteMessageType } = {
  1: {
    on: 0x90,
    off: 0x80,
  },
  2: {
    on: 0x91,
    off: 0x81,
  },
  3: {
    on: 0x92,
    off: 0x82,
  },
  4: {
    on: 0x93,
    off: 0x83,
  },
  5: {
    on: 0x94,
    off: 0x84,
  },
  6: {
    on: 0x95,
    off: 0x85,
  },
  7: {
    on: 0x96,
    off: 0x86,
  },
  8: {
    on: 0x97,
    off: 0x87,
  },
  9: {
    on: 0x98,
    off: 0x88,
  },
  10: {
    on: 0x99,
    off: 0x89,
  },
  11: {
    on: 0x9a,
    off: 0x8a,
  },
  12: {
    on: 0x9b,
    off: 0x8b,
  },
  13: {
    on: 0x9c,
    off: 0x8c,
  },
  14: {
    on: 0x9d,
    off: 0x8d,
  },
  15: {
    on: 0x9e,
    off: 0x8e,
  },
  16: {
    on: 0x9f,
    off: 0x8f,
  },
};

// TODO: Fix types
function getMIDIMessage(midiMessage: any) {
  const cmd = midiMessage.data[0] >> 4;
  const note = midiMessage.data[1];
  const velocity = midiMessage.data.length > 2 ? midiMessage.data[2] : 1;
  // NOTE on: 9
  // Note off: 8
  // CC: 11

  console.log({ cmd, note, velocity });
}

export const makeCCSender =
  (device: any) =>
  (channel: ChannelType, controller: number, velocity: number) => {
    const CC = ccMessageCodeByChannel[channel];
    const ccMessage = [CC, controller, velocity];
    // console.log({CC, channel, ccMessage})
    if (CC && channel) {
      device.send(ccMessage);
    }
  };

export const makeNoteSender =
  (device: any) =>
  (channel: ChannelType, noteOn: boolean, note: number, velocity: number) => {
    const messageType = midiNotesByChannel[channel];
    const msg = noteOn
      ? [messageType.on, note, velocity]
      : [messageType.off, note, velocity];

    device.send(msg);
  };

// TODO: rewrite as return Promise to handle requestMIDIAccess failing
export const initMidi = async () => {
  // @ts-ignore
  if (navigator.requestMIDIAccess) {
    console.log("This browser supports WebMIDI!");
  } else {
    console.log("WebMIDI is not supported in this browser.");
  }

  //@ts-ignore
  const res = await navigator.requestMIDIAccess();
  const midiOut = [];

  // Print midi output
  // for (const input of res.inputs.values()) {
  //   input.onmidimessage = getMIDIMessage;
  // }

  for (var entry of res.outputs) {
    var output = entry[1];
    console.log(
      "Output port [type:'" +
        output.type +
        "'] id:'" +
        output.id +
        "' manufacturer:'" +
        output.manufacturer +
        "' name:'" +
        output.name +
        "' version:'" +
        output.version +
        "'"
    );
  }

  const outputs = res.outputs.values();
  for (
    let output = outputs.next();
    output && !output.done;
    output = outputs.next()
  ) {
    midiOut.push(output.value);
  }

  return midiOut;
};
