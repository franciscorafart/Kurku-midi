import { AudioEffectType } from "config/audio";
import { makeDistortionCurve } from "./audioUtils";
import file from "assets/beat-128.wav";
import { KeyedEffectType } from "./types";

const _bpmToSec = (bpm: number): number => 60 / bpm;

export const delaySubdivison = (
  bpm: number,
  num: number,
  denominator: number
): number => _bpmToSec(bpm) * (num / denominator);

const _getFile = async (
  audioCtx: BaseAudioContext,
  filepath: string
): Promise<AudioBuffer> => {
  const response = await fetch(filepath);
  const arrayBuffer = await response.arrayBuffer();
  let audioBuffer: AudioBuffer;

  audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  return audioBuffer;
};

const addAudioBuffer = async (
  audioCtx: BaseAudioContext,
  filepath: string
): Promise<AudioBuffer> => {
  const buffer = await _getFile(audioCtx, filepath);
  return buffer;
};

async function createConvolution(
  audioCtx: BaseAudioContext,
  impulseFile: string
): Promise<ConvolverNode> {
  const convolver = audioCtx.createConvolver();
  const response = await fetch(impulseFile);
  const arraybuffer = await response.arrayBuffer();
  convolver.buffer = await audioCtx.decodeAudioData(arraybuffer);

  return convolver;
}

type Effect =
  | ConvolverNode
  | StereoPannerNode
  | AnalyserNode
  | GainNode
  | DelayNode
  | WaveShaperNode
  | AudioWorkletNode;

const initializeEffect = async (
  audioCtx: BaseAudioContext,
  effect: AudioEffectType,
) => {
  let node;
  const defaultValues = effect.defaultValues;

  if (effect.key === "gain" && defaultValues.gain !== undefined) {
    node = audioCtx.createGain();
  } else if (effect.key === "pan") {
    node = audioCtx.createStereoPanner();
    node.pan.setValueAtTime(0, audioCtx.currentTime);
  } else if (effect.key === "delay") {
    node = audioCtx.createDelay(defaultValues.delayInSec);
  } else if (effect.key === "distortion") {
    node = audioCtx.createWaveShaper();
    node.curve = makeDistortionCurve(200);
    node.oversample = "4x";
  } else if (effect.key === "reverb" && defaultValues.file !== undefined) {
    node = createConvolution(audioCtx, defaultValues.file);
  } else if (effect.key === "analyser" && defaultValues.fftSize !== undefined) {
    node = audioCtx.createAnalyser();
    node.fftSize = defaultValues.fftSize;
  } else if (effect.key === "bitcrusher") {
    await audioCtx.audioWorklet.addModule("bitcrusher-processor.js");
    node = new AudioWorkletNode(audioCtx, "bitcrusher-processor");
  } else if (effect.key === "hpf") {
    node = audioCtx.createBiquadFilter();
    node.type = "highpass";
    node.frequency.value = 0;
    node.gain.setValueAtTime(25, 0);
  } else if (effect.key === "crosssynth" && defaultValues.file !== undefined) {
    node = await createConvolution(audioCtx, defaultValues.file);
  }

  return node;
};

export type WrappedEffect = GainNode & {
  originalGain?: GainNode;
  processedGain?: GainNode;
  setValueAtTime?: (wet: number, currentTime: number) => void;
  disconnect: () => void; // NOTE: Or whatever the disconnect method in WebAudio is
};

// NOTE: A wrapped effect's output value is determined by two gain nodes, dry and wet
const wrappedEffectKeys = ["reverb", "distortion", "crosssynth"];
const wrapAndConnectEffect = (
  previousEffect: AudioNode,
  effect: Effect,
  audioCtx: AudioContext,
  audioEffect: AudioEffectType,
): AudioNode | WrappedEffect => {
  if (wrappedEffectKeys.includes(audioEffect.key)) {
    const wrappedEffect: WrappedEffect = audioCtx.createGain();

    wrappedEffect.originalGain = audioCtx.createGain();
    wrappedEffect.processedGain = audioCtx.createGain();

    // Dry
    previousEffect.connect(wrappedEffect.originalGain);
    // Wet
    previousEffect.connect(effect);
    effect.connect(wrappedEffect.processedGain);

    wrappedEffect.originalGain.connect(wrappedEffect);
    wrappedEffect.processedGain.connect(wrappedEffect);

    // Replace original setValueAtTime with function that acts on two gain nodes
    wrappedEffect.setValueAtTime = function (wet: number, currentTime: number) {
      const dry = 1 - wet;
      wrappedEffect.originalGain?.gain.setValueAtTime(dry, currentTime);
      wrappedEffect.processedGain?.gain.setValueAtTime(wet, currentTime);
    };

    // TODO: Implement disconnect

    return wrappedEffect;
  }

  previousEffect.connect(effect);
  return effect;
};

const disconnectEffect = (
  previous: AudioNode | WrappedEffect,
  current: AudioNode | WrappedEffect,
  next: AudioNode | WrappedEffect
) => {
  // TODO: Implement
};

const attachEffects = async (
  audioCtx: AudioContext,
  source: AudioBufferSourceNode | MediaStreamAudioSourceNode,
  masterGainNode: AudioNode,
  audioEffects: AudioEffectType[],
  audioFXs: KeyedEffectType
) => {
  const inputGainNode = audioCtx.createGain();
  inputGainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);

  const outputGainNode = audioCtx.createGain();
  outputGainNode.gain.setValueAtTime(1, audioCtx.currentTime);

  source.connect(inputGainNode);
  let previousEffect: AudioNode | WrappedEffect = inputGainNode;
  audioFXs["input-gain"] = inputGainNode;

  // Interate through effects, intialize and connect
  for (const effectConfig of audioEffects) {
    // console.log("effectConfig", effectConfig);
    const effect = await initializeEffect(audioCtx, effectConfig);

    if (effect) {
      // Wrap in dryWet node if a complex effect (Reverb)
      const wrappedEffect = wrapAndConnectEffect(
        previousEffect,
        effect,
        audioCtx,
        effectConfig
      );

      // Store node in global config
      const effectKey = `${effectConfig.key}-${effectConfig.bodyPart}`;

      audioFXs[effectKey] = wrappedEffect; // Actual Nodes
      previousEffect = wrappedEffect;
    }
  }

  audioFXs["output-gain"] = outputGainNode;

  previousEffect.connect(outputGainNode);
  outputGainNode.connect(masterGainNode);
  console.log("audioFX in memory", audioFXs);
  return source;
};

const insertEffect = async () => {
  // 1. Get NewEffect and figure out which one would be previous and next => I can get it from Recoil state (if fist and last index, input and output nodes)
  // 2. Disconnect Previous from Next (regular or Wrapped Effect)
  // 3. Connect Previous to NewEffect, connect NewEffect to Next
  // 4. In another stateful code, update the Recoil state to reflect that
};

const removeEffect = async () => {
  // 1. Get Effect by stored key
  // 2. Figure out Previous and next => Check the recoil state for stoarage key
  // 3. Disconnect Previous from Effect, Disonnect Effect from Next
  // 4. Connect Previous to Next
  // 5. Update recoil state to reflect
};

const swapEffect = async () => {
  // 1. Get Effect by stored key
  // 2. Get NewEffect
  // 2. Figure out Previous and Next => Check the recoil state for storage key
  // 3. Disconnect Previous from Effect, Disonnect Effect from Next
  // 4. Connect Previous to NewEffect, Connect NewEffect to Next
};

const prepareMicSource = async (
  audioCtx: AudioContext,
  masterGainNode: AudioNode,
  audioEffects: AudioEffectType[],
  audioFXs: KeyedEffectType
): Promise<MediaStreamAudioSourceNode> => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true
  });

  const micSource = audioCtx.createMediaStreamSource(stream);
  const source = micSource;
  // @ts-ignore
  return attachEffects(
    audioCtx,
    source,
    masterGainNode,
    audioEffects,
    audioFXs
  );
};

const prepareAudioSource = async (
  audioCtx: AudioContext,
  masterGainNode: AudioNode,
  audioEffects: AudioEffectType[],
  buffer: AudioBuffer | null = null,
  audioFXs: KeyedEffectType
): Promise<AudioBufferSourceNode> => {
  const stemAudioSource = audioCtx.createBufferSource();
  stemAudioSource.buffer = buffer;
  stemAudioSource.loop = true;

  const source = stemAudioSource;
  // @ts-ignore
  return attachEffects(
    audioCtx,
    source,
    masterGainNode,
    audioEffects,
    audioFXs
  );
};

export const initAudio = async (
  audioEffects: AudioEffectType[],
  audioFXs: KeyedEffectType
) => {
  // @ts-ignore
  const context = new (window.AudioContext || window.webkitAudioContext)();

  const masterGainNode = context.createGain();
  masterGainNode.connect(context.destination);
  masterGainNode.gain.setValueAtTime(1, context.currentTime);

  let source: AudioBufferSourceNode;

  await addAudioBuffer(context, file).then(async (audioBuffer) => {
    source = await prepareAudioSource(
      context,
      masterGainNode,
      audioEffects,
      audioBuffer,
      audioFXs
    );

    source.start(0);
  });

  return context;
};

export const initMicAudio = async (
  audioEffects: AudioEffectType[],
  audioFXs: KeyedEffectType
) => {
  // @ts-ignore
  const context = new (window.AudioContext || window.webkitAudioContext)();
  const masterGainNode = context.createGain();
  masterGainNode.connect(context.destination);
  masterGainNode.gain.setValueAtTime(1, context.currentTime);

  await prepareMicSource(context, masterGainNode, audioEffects, audioFXs);

  return context;
};
