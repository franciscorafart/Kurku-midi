import impulseResponse from "assets/impulse-response.wav";
import soprano from "assets/sound2.wav";
import { BodyPartKey, effectKeyType, ScreenRange, ValueRange } from "./shared";

export const defaultAudioEffects: AudioEffectType[] = [
    {
      direction: "x", // horizontal
      screenRange: { a: 0.3, b: 0.7 },
      valueRange: { x: -1, y: 1 },
      scaleFactor: 1,
      key: "pan",
      bodyPart: "nose",
      previousValue: 0,
      targetValue: 0,
      defaultValues: {
        gain: 1,
        delayInSec: 1,
        file: "",
        fftSize: 2948
      },
      node: undefined
    },
    {
      direction: "y", // vertical
      screenRange: { a: 0.5, b: 0.8 },
      valueRange: { x: 0, y: 1 },
      scaleFactor: 1,
      key: "gain",
      bodyPart: "nose",
      previousValue: 0,
      targetValue: 0,
      defaultValues: {
        gain: 1,
        delayInSec: 1,
        file: "",
        fftSize: 2948
      },
      node: undefined
    },
    {
      direction: "y", // vertical
      screenRange: { a: 0.75, b: 1 },
      valueRange: { x: 0, y: 1 },
      scaleFactor: 1,
      key: "distortion",
      bodyPart: "leftWrist",
      previousValue: 0,
      targetValue: 0,
      defaultValues: {
        gain: 1,
        delayInSec: 1,
        file: "",
        fftSize: 2948
      },
      node: undefined
    },
    // {
    //   direction: "y", // or horizontal
    //   screenRange: { a: 0.1, b: 0.3 },
    //   valueRange: { x: 0, y: 1 },
    //   scaleFactor: 1,
    //   key: "bitcrusher",
    //   bodyPart: "leftWrist",
    //   previousValue: 0,
    //   targetValue: 0,
    //   defaultValues: {
    //     gain: 1,
    //     delayInSec: 1,
    //     file: "",
    //     fftSize: 2948
    //   },
    //   node: undefined
    // },
    {
      direction: "y", // vertical
      screenRange: { a: 0.25, b: 0.35 },
      valueRange: { x: 0, y: 10000 },
      scaleFactor: 1,
      key: "hpf",
      bodyPart: "rightKnee",
      previousValue: 0,
      targetValue: 0,
      defaultValues: {
        gain: 1,
        delayInSec: 1,
        file: "",
        fftSize: 2948
      },
      node: undefined
    },
    {
      direction: "y", // vertical
      screenRange: { a: 0.25, b: 0.35 },
      valueRange: { x: 0, y: 1 },
      scaleFactor: 1,
      key: "crosssynth",
      bodyPart: "leftKnee",
      previousValue: 0,
      targetValue: 0,
      defaultValues: {
        gain: 1,
        delayInSec: 1,
        file: soprano,
        fftSize: 2948
      },
      node: undefined
    },
    {
      direction: "y", // vertical
      screenRange: { a: 0.6, b: 1 },
      valueRange: { x: 0, y: 0.6 },
      scaleFactor: 1,
      key: "reverb",
      bodyPart: "rightWrist",
      previousValue: 0,
      targetValue: 0,
      defaultValues: {
        gain: 1,
        delayInSec: 1,
        file: impulseResponse,
        fftSize: 2948
      },
      node: undefined
    }
  ]

export interface AudioEffectType {
  direction: "x" | "y";
  screenRange: ScreenRange;
  valueRange: ValueRange;
  scaleFactor: number;
  key: effectKeyType;
  bodyPart: BodyPartKey;
  previousValue: number;
  targetValue: number;
  defaultValues: {
    gain?: number;
    delayInSec?: number;
    file?: string;
    fftSize?: number;
  };
  node: any | undefined; // Create Node type
}


