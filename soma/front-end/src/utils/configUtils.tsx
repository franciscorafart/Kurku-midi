// export const sessionConfig = {
//     effects: [],
//     machineType: 'slow', // fast / decent / slow
//     bmp: 60,
//     skipSize: 0.1,
// }

interface screenRange {
    a: number;
    b: number;
}

interface valueRange {
    x: number;
    y: number;
}

export type effectKeyType = 'gain' | 'pan' | 'reverb' | 'bitcrusher' | 'hpf' | 'distortion' | 'delay' | 'crosssynth' | 'analyser';
export type BodyPartKey = 'nose' | 'rightWrist' | 'leftWrist' | 'rightKnee' | 'leftKnee';

export type BodyPartType = any; // TODO: Implement type correctly

export interface effectConfigType {
    direction: 'x' | 'y';
    screenRange: screenRange;
    valueRange: valueRange;
    key: effectKeyType;
    bodyPart: BodyPartKey;
    previousValue: number;
    targetValue: number,
    defaultValues: {
        gain?: number,
        delayInSec?: number,
        file?: string,
        fftSize?: number,
    },
    node: any | undefined, // Create Node type
}

export interface sessionConfigType {
    effects: effectConfigType[];
    machineType: 'slow' | 'decent' | 'fast';
    bpm: number;
    skipSize: number;
}