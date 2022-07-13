import { AudioEffectType } from "config/audio";
import { effectKeyType } from "config/shared";
import { KeyedEffectType } from "./types";
import { scaleWindowToRange } from "./utils";

const setEffectValue = (
  effectKey: effectKeyType,
  node: any,
  currentTime: number,
  value: number
) => {
  if (effectKey === "gain") {
    node.gain.setValueAtTime(value, currentTime);
  } else if (effectKey === "pan") {
    node.pan.setValueAtTime(value, currentTime);
  } else if (
    effectKey === "distortion" ||
    effectKey === "reverb" ||
    effectKey === "crosssynth"
  ) {
    // NOTE: Setting dry/wet value on the gain wrapper
    node.setValueAtTime(value, currentTime);
  } else if (effectKey === "bitcrusher") {
    const bitSizeParam = node.parameters.get("bitSize");
    bitSizeParam.setValueAtTime(
      Math.max(4, Math.ceil(value * 16)),
      currentTime
    );
  } else if (effectKey === "hpf") {
    node.frequency.setValueAtTime(value, currentTime);
  } else if (effectKey === "delay") {
    node.delayTime.setValueAtTime(value, currentTime);
  }
};

export const mapGlobalConfigsToSound = (
  audioEffects: AudioEffectType[],
  bodyPartPositions: any, // TODO: create body part positions type
  audioCtx: BaseAudioContext,
  audioFXs: KeyedEffectType
) => {
  for (const effect of audioEffects) {
    const bodyPart = effect.bodyPart;
    const position = bodyPartPositions[bodyPart][effect.direction];
    const node = audioFXs[`${effect.key}-${bodyPart}`];

    if (node) {
      if (position !== undefined) {
        const screenRange = effect.screenRange;
        const valueRange = effect.valueRange;
        const [scaledValue, scaleFactor] = scaleWindowToRange(
          screenRange.a,
          screenRange.b,
          valueRange.x,
          valueRange.y,
          position
        );

        // TODO: How to re-implement gradual moveTowardsPoint without mutable state?
        // Maybe when I implement interface, every time there's a configuration change we can store previous value

        // const nextValue = moveTowardsPoint(
        //   effect.previousValue,
        //   scaledValue,
        //   audioEffects.skipSize * effectScaleFactor
        // );

        setEffectValue(effect.key, node, audioCtx.currentTime, scaledValue);
      }
    }
  }
};

export function makeDistortionCurve(amount: number): Float32Array {
  var k = typeof amount === "number" ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for (; i < n_samples; ++i) {
    x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }

  return curve;
}
