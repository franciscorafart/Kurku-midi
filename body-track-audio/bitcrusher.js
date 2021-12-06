const bitCrusher = (analyser, bitSize) => {
    const steps = Math.pow(2, bitSize);

    // Divide range -1 to 1 in number of steps determined by bit size
    const delta = 2 / steps;

    // Snap amplitude of each sample to a value in the bit size grid
    const  dataArray = new Uint8Array(analyser.fftSize); // Uint8Array should be the same length as the fftSize 
    analyser.getByteTimeDomainData(dataArray);

    for (const sample of dataArray) {
        const sign = sample <=0 ? -1: 1;

        const positionInSteps = Math.ceil(Math.abs(sample) * (steps / 2));
        const newSample = sign * positionInSteps * delta;
    }
}

class BitCrusherProcessor extends AudioWorkletProcessor {
    process (inputs, outputs, parameters) {
        const input = inputs[0];
        console.log('input', input)
    
    //   const output = outputs[0]
    //   output.forEach(channel => {
    //     for (let i = 0; i < channel.length; i++) {
    //       channel[i] = Math.random() * 2 - 1
    //     }
    //   })
      return true
    }
  }
  
  registerProcessor('white-noise-processor', BitCrusherProcessor)
  