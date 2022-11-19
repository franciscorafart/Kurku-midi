import { ChannelType } from "./types";

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

// TODO: Fix types
function getMIDIMessage(midiMessage: any) {
  const cmd = midiMessage.data[0] >> 4;
  const pitch = midiMessage.data[1];
  const velocity = midiMessage.data.length > 2 ? midiMessage.data[2] : 1;
  // NOTE on: 9
  // Note off: 8
  // CC: 11

  console.log({ cmd, pitch, velocity });
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

  for (const input of res.inputs.values()) {
    input.onmidimessage = getMIDIMessage;
  }

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
