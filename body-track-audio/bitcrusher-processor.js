const bitCrusher = (dataArray, bitSize) => {
    const steps = Math.pow(2, bitSize);
    const res = [];
    // Divide range -1 to 1 in number of steps determined by bit size
    const delta = 2 / steps;

    for (const sample of dataArray) {
        const sign = sample <=0 ? -1: 1;

        const positionInSteps = Math.ceil(Math.abs(sample) * (steps / 2));
        const newSample = sign * positionInSteps * delta;

        res.push(newSample);
    }
}

const sampleBitCrusher = bitSize => {
    const steps = Math.pow(2, bitSize);
    // Divide range -1 to 1 in number of steps determined by bit size
    const delta = 2 / steps;

    return sample => {
        const sign = sample <= 0 ? -1: 1;

        const positionInSteps = Math.ceil(Math.abs(sample) * (steps / 2));
        const newSample = sign * positionInSteps * delta;
        return newSample;
    }
}

class BitCrusherProcessor extends AudioWorkletProcessor {
    process (inputs, outputs, parameters) {
        console.log('parameters', parameters)
        const input = inputs[0];
        const bitCrush = sampleBitCrusher(16);
    
        const output = outputs[0]

        output.forEach((channel, chIdx) => {
            for (let i = 0; i < channel.length; i++) {
                channel[i] = bitCrush(input[chIdx][i])
            }
        })

        return true
    }
  }
  
  registerProcessor('bitcrusher-processor', BitCrusherProcessor)
  