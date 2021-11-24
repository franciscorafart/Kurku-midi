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


async function createConvolution(audioCtx, impulseFile) {
    const convolver = audioCtx.createConvolver();
    const response     = await fetch(impulseFile);
    const arraybuffer  = await response.arrayBuffer();
    convolver.buffer = await audioCtx.decodeAudioData(arraybuffer);

    return convolver;
}

const prepareBuffer = async (audioCtx, masterGainNode, buffer) => {
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
    const delayNode = audioCtx.createDelay(160);
    const feedback = audioCtx.createGain(0);

    const crossSynthesisNode = await createConvolution(audioCtx, 'assets/sound1.wav');
    const crossSynthesisLevelNode = audioCtx.createGain();

    const reverbNode = await createConvolution(audioCtx, 'assets/impulse-response.wav')
    const reverbLevelNode = audioCtx.createGain();

    const distortionNode = audioCtx.createWaveShaper();

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;

    stemAudioSource.connect(inputGainNode);

    // Singal chain
    inputGainNode.connect(analyser);
    analyser.connect(panNode);
    panNode.connect(delayNode);

    // Feedback delay
    delayNode.connect(feedback);
    feedback.connect(delayNode);

    // panNode.connect(distortionNode);
    delayNode.connect(distortionNode);

    distortionNode.connect(outputGainNode);

    //Reverb sends
    distortionNode.connect(reverbNode);
    reverbNode.connect(reverbLevelNode);
    reverbLevelNode.connect(outputGainNode);

    distortionNode.connect(crossSynthesisNode);
    crossSynthesisNode.connect(crossSynthesisLevelNode);
    crossSynthesisLevelNode.connect(outputGainNode);

    outputGainNode.connect(masterGainNode);

    // Return gain and panning controls so that the UI can manipulate them
    return [
        panNode,
        outputGainNode,
        delayNode,
        feedback,
        reverbLevelNode,
        crossSynthesisLevelNode,
        distortionNode,
        analyser,
        stemAudioSource,
    ];
}

export const initAudio = async () => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const masterGainNode = context.createGain();
    masterGainNode.connect(context.destination);
    masterGainNode.gain.setValueAtTime(1, context.currentTime);

    const files = [
        'assets/sound2.wav',
    ]

    const allSounds = [];

    for (const file of files) {
        await addAudioBuffer(context, file).then(buffer => {
            allSounds.push({
                panNode: undefined,
                gainNode: undefined,
                delayNode: undefined,
                feedback: undefined,
                distortionNode: undefined,
                reverbLevelNode: undefined,
                crossSynthesisNode: undefined,
                analyser: undefined,
                audioBuffer: buffer,
                stem: undefined,
            })
        })
    }
    for (const [idx, sound] of allSounds.entries()) {
        const [
            panNode,
            gainNode,
            delayNode,
            feedback,
            reverbLevelNode,
            crossSynthesisNode,
            distortionNode,
            analyser,
            stemAudioSource,
        ] = await prepareBuffer(
            context,
            masterGainNode,
            sound.audioBuffer,
        );

        allSounds[idx].panNode = panNode;
        allSounds[idx].gainNode = gainNode;
        allSounds[idx].delayNode = delayNode;
        allSounds[idx].feedback = feedback;
        allSounds[idx].distortionNode = distortionNode;
        allSounds[idx].reverbLevelNode = reverbLevelNode;
        allSounds[idx].crossSynthesisNode = crossSynthesisNode;
        allSounds[idx].analyser = analyser;
        allSounds[idx].stem = stemAudioSource;
    }

    // Play all stems at time 0
    const playAll = () => {
        for (const s of allSounds) {
            s.stem.start(0);
        }
    }

    return [context, allSounds, playAll];
}