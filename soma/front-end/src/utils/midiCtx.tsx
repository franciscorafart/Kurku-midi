import { ChannelType } from "./types";

const ccMessageCodeByChannel: {[index in ChannelType] : number }= {
    1: 0xB0,
    2: 0xB1,
    3: 0xB2,
    4: 0xB3,
    5: 0xB4,
    6: 0xB5,
    7: 0xB6,
    8: 0xB7,
    9: 0xB8,
    10: 0xB9,
    11: 0xBA,
    12: 0xBB,
    13: 0xBC,
    14: 0xBD,
    15: 0xBE,
    16: 0xBF,
}

// TODO: Fix types
function getMIDIMessage(midiMessage: any) {
    const cmd = midiMessage.data[0] >> 4;
    const pitch = midiMessage.data[1];
    const velocity = (midiMessage.data.length > 2) ? midiMessage.data[2] : 1;
    // NOTE on: 9
    // Note off: 8 
    // CC: 11 
    
    console.log({cmd, pitch, velocity});
}

const makeCCSender = (device: any) => (channel: ChannelType, controller: number, velocity: number) => {
        const CC = ccMessageCodeByChannel[channel]
        const ccMessage = [CC, controller, velocity];
        console.log({CC, channel, ccMessage})
        if (CC && channel) {
            device.send(ccMessage); 
        }
    }


// TODO: rewrite as return Promise to handle requestMIDIAccess failing
export const initMidi = async () => {
    // if (navigator.requestMIDIAccess) {
//     console.log('This browser supports WebMIDI!');
// } else {
//     console.log('WebMIDI is not supported in this browser.');
// }

    //@ts-ignore
    const res = await navigator.requestMIDIAccess()
    const midiOut = []

    for (const input of res.inputs.values()){
        input.onmidimessage = getMIDIMessage
    }
    
    for (var entry of res.outputs) {
        var output = entry[1];
        console.log( "Output port [type:'" + output.type + "'] id:'" + output.id +
          "' manufacturer:'" + output.manufacturer + "' name:'" + output.name +
          "' version:'" + output.version + "'" );
      }

    const outputs = res.outputs.values();
    for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
        midiOut.push(output.value);
    }   

    // TODO: Select output from menu
    const myOutput = midiOut[midiOut.length-1]
    const ccSender = makeCCSender(myOutput)
    return ccSender
}