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

const initializeEffect = async (audioCtx, effectConfig) => {
    let effect;
    const defaultValues = effectConfig.defaultValues;

    if (effectConfig.effect === 'gain') {
        effect = audioCtx.createGain(defaultValues.gain);
    } else if (effectConfig.effect === 'pan') {
        effect = audioCtx.createStereoPanner();
        effect.pan.setValueAtTime(0, audioCtx.currentTime);
    } else if (effectConfig.effect === 'delay') {
        effect = audioCtx.createDelay(defaultValues.delayInSec);
    } else if (effectConfig.effect === 'distortion') {
        effect = audioCtx.createWaveShaper();
    } else if (effectConfig.effect === 'reverb') {
        effect = createConvolution(audioCtx, defaultValues.file);
    } else if (effectConfig.effect === 'analyser') {
        effect = audioCtx.createAnalyser();
        effect.fftSize = defaultValues.fftSize;
    } else if (effectConfig.effect === 'bitcrusher') {
        await audioCtx.audioWorklet.addModule('bitcrusher-processor.js')
        effect = new AudioWorkletNode(audioCtx, 'bitcrusher-processor')
    } else if (effectConfig.effect === 'hpf') {
        effect = audioCtx.createBiquadFilter();
        effect.type = 'highpass';
        effect.frequency.value = 0;
        effect.gain.setValueAtTime(25, 0);
    } else if (effectConfig.effect === 'crosssynth') {
        effect = await createConvolution(audioCtx, 'assets/sound1.wav');
    }

    return effect;
}

const prepareAudioSource = async (audioCtx, masterGainNode, globalConfig, buffer=null) => {
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

    source.connect(inputGainNode);
    let previousEffect = inputGainNode;

    // Interate through effects, intialize and connect
    for (const effectConfig of globalConfig.effects) {
        const effect = await initializeEffect(audioCtx, effectConfig);
        previousEffect.connect(effect);

        // Store node in global config
        effectConfig.node = effect;
        previousEffect = effect;
    }

    previousEffect.connect(outputGainNode);
    outputGainNode.connect(masterGainNode);

    return source;
}

export const initAudio = async (globalConfig) => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    context.bpm = globalConfig.bpm;

    const masterGainNode = context.createGain();
    masterGainNode.connect(context.destination);
    masterGainNode.gain.setValueAtTime(1, context.currentTime);

    const file =  'assets/beat-128.wav';
    let source;

    await addAudioBuffer(context, file).then(async audioBuffer => {
        source = await prepareAudioSource(
            context,
            masterGainNode,
            globalConfig,
            audioBuffer,
        );
    });
    
    source.start(0);
    return context;
}

export const initMicAudio = async () => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const masterGainNode = context.createGain();
    masterGainNode.connect(context.destination);
    masterGainNode.gain.setValueAtTime(1, context.currentTime);

    await prepareAudioSource(
        context,
        masterGainNode,
        globalConfig,
        null,
    );

    return context;
}