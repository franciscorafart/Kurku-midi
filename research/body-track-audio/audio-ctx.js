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
const initializeEffect = async (audioCtx, effect) => {
    let node;
    const defaultValues = effect.defaultValues;

    if (effect.key === 'gain') {
        node = audioCtx.createGain(defaultValues.gain);
    } else if (effect.key === 'pan') {
        node = audioCtx.createStereoPanner();
        node.pan.setValueAtTime(0, audioCtx.currentTime);
    } else if (effect.key === 'delay') {
        node = audioCtx.createDelay(defaultValues.delayInSec);
    } else if (effect.key === 'distortion') {
        node = audioCtx.createWaveShaper();
    } else if (effect.key === 'reverb') {
        node = createConvolution(audioCtx, defaultValues.file);
    } else if (effect.key === 'analyser') {
        node = audioCtx.createAnalyser();
        node.fftSize = defaultValues.fftSize;
    } else if (effect.key === 'bitcrusher') {
        await audioCtx.audioWorklet.addModule('bitcrusher-processor.js')
        node = new AudioWorkletNode(audioCtx, 'bitcrusher-processor')
    } else if (effect.key === 'hpf') {
        node = audioCtx.createBiquadFilter();
        node.type = 'highpass';
        node.frequency.value = 0;
        node.gain.setValueAtTime(25, 0);
    } else if (effect.key === 'crosssynth') {
        node = await createConvolution(audioCtx, 'assets/sound1.wav');
    }

    return node;
}

const wrapAndConnectEffect = (previousEffect, effect, audioCtx, effectConfig) => {
    if(effectConfig.key === 'reverb') {
        const wrappedEffect = audioCtx.createGain(1);
        wrappedEffect.originalGain = audioCtx.createGain(0.5);
        wrappedEffect.processedGain = audioCtx.createGain(0.5);

        // Dry
        previousEffect.connect(wrappedEffect.originalGain);
        // Wet
        previousEffect.connect(effect);
        effect.connect(wrappedEffect.processedGain);

        wrappedEffect.originalGain.connect(wrappedEffect);
        wrappedEffect.processedGain.connect(wrappedEffect);

        wrappedEffect.setValueAtTime = function(wet, currentTime) {
            const dry = 1 - wet;
            wrappedEffect.originalGain.gain.setValueAtTime(dry, currentTime);
            wrappedEffect.processedGain.gain.setValueAtTime(wet, currentTime);
        }

        return wrappedEffect;
    }

    previousEffect.connect(effect);
    return effect;
}

const prepareAudioSource = async (audioCtx, masterGainNode, sessionConfig, buffer=null) => {
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
    for (const effectConfig of sessionConfig.effects) {
        const effect = await initializeEffect(audioCtx, effectConfig);

        // Wrap in dryWet node if a complex effect (Reverb)
        const wrappedEffect = wrapAndConnectEffect(
            previousEffect,
            effect,
            audioCtx,
            effectConfig,
        );

        // Store node in global config
        effectConfig.node = wrappedEffect;
        previousEffect = wrappedEffect;
    }

    previousEffect.connect(outputGainNode);
    outputGainNode.connect(masterGainNode);

    return source;
}

export const initAudio = async (sessionConfig) => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    context.bpm = sessionConfig.bpm;

    const masterGainNode = context.createGain();
    masterGainNode.connect(context.destination);
    masterGainNode.gain.setValueAtTime(1, context.currentTime);

    const file =  'assets/beat-128.wav';
    let source;

    await addAudioBuffer(context, file).then(async audioBuffer => {
        source = await prepareAudioSource(
            context,
            masterGainNode,
            sessionConfig,
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
        sessionConfig,
        null,
    );

    return context;
}