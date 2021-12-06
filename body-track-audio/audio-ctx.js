const _bpmToSec = bpm => 60/bpm;
export const delaySubdivison = (bpm, num, denominator) => _bpmToSec(bpm) * (num/denominator);

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

const prepareAudioSource = async (audioCtx, masterGainNode, buffer=null) => {
    let source;

    if (buffer){
        const stemAudioSource = audioCtx.createBufferSource();
        stemAudioSource.buffer = buffer;
        stemAudioSource.loop = true;

        source = stemAudioSource;
    } else {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });

        const micSource = audioCtx.createMediaStreamSource(stream);
        source = micSource;
    }

    const inputGainNode = audioCtx.createGain();
    inputGainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);

    const outputGainNode = audioCtx.createGain();
    outputGainNode.gain.setValueAtTime(1, audioCtx.currentTime);

    // FXs
    const panNode = audioCtx.createStereoPanner();
    panNode.pan.setValueAtTime(0, audioCtx.currentTime);

    // TODO: Work out delay with feedback
    const delayInSec = delaySubdivison(audioCtx.bpm, 3, 4);
    const delayNode = audioCtx.createDelay(delayInSec);
    const feedback = audioCtx.createGain(0.5);

    const crossSynthesisNode = await createConvolution(audioCtx, 'assets/sound1.wav');
    const crossSynthesisLevelNode = audioCtx.createGain();

    const reverbNode = await createConvolution(audioCtx, 'assets/impulse-response.wav')
    const reverbLevelNode = audioCtx.createGain(0.2);

    const distortionNode = audioCtx.createWaveShaper();

    await audioCtx.audioWorklet.addModule('bitcrusher-processor.js')
    const bitCrushNode = new AudioWorkletNode(audioCtx, 'bitcrusher-processor')

    const hpfNode = audioCtx.createBiquadFilter();
    hpfNode.type = 'highpass';
    hpfNode.frequency.value = 0;
    hpfNode.gain.setValueAtTime(25, 0);

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;

    source.connect(inputGainNode);

    // Singal chain
    inputGainNode.connect(analyser);
    analyser.connect(panNode);

    panNode.connect(hpfNode);
    hpfNode.connect(distortionNode);

    distortionNode.connect(outputGainNode);

    //Reverb sends
    distortionNode.connect(reverbNode);
    reverbNode.connect(reverbLevelNode);
    reverbLevelNode.connect(outputGainNode);
    
    // Delay sends
    distortionNode.connect(delayNode);
    delayNode.connect(feedback);
    feedback.connect(delayNode);
    delayNode.connect(outputGainNode);

    // Cross synthesis sends
    distortionNode.connect(crossSynthesisNode);
    crossSynthesisNode.connect(crossSynthesisLevelNode);
    crossSynthesisLevelNode.connect(outputGainNode);

    outputGainNode.connect(bitCrushNode);

    bitCrushNode.connect(masterGainNode);

    // Return gain and panning controls so that the UI can manipulate them
    return [
        panNode,
        outputGainNode,
        delayNode,
        feedback,
        reverbLevelNode,
        crossSynthesisLevelNode,
        distortionNode,
        hpfNode,
        analyser,
        source,
    ];
}

export const initAudio = async (bpm) => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    context.bpm = bpm;

    const masterGainNode = context.createGain();
    masterGainNode.connect(context.destination);
    masterGainNode.gain.setValueAtTime(1, context.currentTime);

    const files = [
        'assets/beat-128.wav',
    ]

    const allSounds = [];

    for (const file of files) {
        await addAudioBuffer(context, file).then(async audioBuffer => {
            const [
                panNode,
                gainNode,
                delayNode,
                feedback,
                reverbLevelNode,
                crossSynthesisNode,
                distortionNode,
                hpfNode,
                analyser,
                source,
            ] = await prepareAudioSource(
                context,
                masterGainNode,
                audioBuffer,
            );

            allSounds.push({
                panNode,
                gainNode,
                delayNode,
                feedback,
                distortionNode,
                reverbLevelNode,
                crossSynthesisNode,
                hpfNode,
                analyser,
                audioBuffer,
                source,
            })
        })
    }

    // Play all stems at time 0
    const playAll = () => {
        for (const s of allSounds) {
            s.source.start(0);
        }
    }

    return [context, allSounds, playAll];
}

export const initMicAudio = async () => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const masterGainNode = context.createGain();
    masterGainNode.connect(context.destination);
    masterGainNode.gain.setValueAtTime(1, context.currentTime);

    const micStream = {};
    const [
        panNode,
        gainNode,
        delayNode,
        feedback,
        reverbLevelNode,
        crossSynthesisNode,
        distortionNode,
        hpfNode,
        analyser,
        source,
    ] = await prepareAudioSource(
        context,
        masterGainNode,
        null,
    );

        micStream.panNode = panNode;
        micStream.gainNode = gainNode;
        micStream.delayNode = delayNode;
        micStream.feedback = feedback;
        micStream.distortionNode = distortionNode;
        micStream.reverbLevelNode = reverbLevelNode;
        micStream.crossSynthesisNode = crossSynthesisNode;
        micStream.hpfNode = hpfNode;
        micStream.analyser = analyser;
        micStream.source = source;

    return [context, [micStream]];
}