const _getFile = async (audioCtx, filepath) => {
    const response = await fetch(filepath);
    const arrayBuffer = await response.arrayBuffer();
    let audioBuffer;
    try {
        audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    } catch (e){
        console.error(e)
    }

    return audioBuffer;
}

const addAudioBuffer = async (audioCtx, filepath) => {
    const buffer = await _getFile(audioCtx, filepath);
    return buffer;
}


async function createReverb(audioCtx) {
    const convolver = audioCtx.createConvolver();

    // load impulse response from file
    const response     = await fetch('assets/impulse-response.wav');
    const arraybuffer  = await response.arrayBuffer();
    convolver.buffer = await audioCtx.decodeAudioData(arraybuffer);

    return convolver;
}

const playBuffer = async (audioCtx, masterGainNode, buffer, time) => {
    const stemAudioSource = audioCtx.createBufferSource();
    stemAudioSource.buffer = buffer;

    stemAudioSource.loop = true;

    const inputGainNode = audioCtx.createGain();
    inputGainNode.gain.setValueAtTime(1, audioCtx.currentTime);

    const outputGainNode = audioCtx.createGain();
    outputGainNode.gain.setValueAtTime(0.7, audioCtx.currentTime);

    // FXs
    const panNode = audioCtx.createStereoPanner();
    panNode.pan.setValueAtTime(0, audioCtx.currentTime);

    // TODO: Work out delay with feedback
    const delayNode = audioCtx.createDelay(10);

    const reverbNode = await createReverb(audioCtx)
    const reverbLevelNode = audioCtx.createGain();

    const distortionNode = audioCtx.createWaveShaper();

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;

    // const bufferLength = analyser.frequencyBinCount;

    // var dataArray = new Uint8Array(bufferLength);
    // analyser.getByteTimeDomainData(dataArray);

    stemAudioSource.connect(inputGainNode);

    // Sends
    inputGainNode.connect(reverbNode);
    reverbNode.connect(reverbLevelNode);

    // Singal chain
    inputGainNode.connect(analyser);
    analyser.connect(panNode);
    panNode.connect(delayNode);
    delayNode.connect(distortionNode);

    distortionNode.connect(outputGainNode);
    reverbLevelNode.connect(outputGainNode);

    outputGainNode.connect(masterGainNode);

    stemAudioSource.start(time);

    // Return gain and panning controls so that the UI can manipulate them
    return [
        panNode,
        outputGainNode,
        delayNode,
        reverbLevelNode,
        distortionNode,
        analyser,
    ];
}

export const initAudio = async () => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const masterGainNode = context.createGain();
    masterGainNode.connect(context.destination);
    masterGainNode.gain.setValueAtTime(1, context.currentTime);

    const files = [
        'assets/sound1.wav',
    ]

    const allSounds = [];

    for (const file of files) {
        await addAudioBuffer(context, file).then(buffer => {
            allSounds.push({
                panNode: undefined,
                gainNode: undefined,
                delayNode: undefined,
                distortionNode: undefined,
                reverbLevelNode: undefined,
                analyser: undefined,
                audioBuffer: buffer,
                start: 0,
            })
        })
    }

    for (const [idx, sound] of allSounds.entries()) {
        const [
            panNode,
            gainNode,
            delayNode,
            reverbLevelNode,
            distortionNode,
            analyser
        ] = await playBuffer(context, masterGainNode, sound.audioBuffer, sound.start);

        allSounds[idx].panNode = panNode;
        allSounds[idx].gainNode = gainNode;
        allSounds[idx].delayNode = delayNode;
        allSounds[idx].distortionNode = distortionNode;
        allSounds[idx].reverbLevelNode = reverbLevelNode;
        allSounds[idx].analyser = analyser;
    }

    return [context, allSounds];
}