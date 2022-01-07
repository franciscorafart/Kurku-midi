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

export type effectKeyType = 'gain' | 'pan' | 'reverb' | 'bitcrusher' | 'hpf' | 'distortion' | 'delay' | 'crossSynthesis';
export type bodyPartType = 'nose' | 'rightWrist' | 'leftWrist' | 'rightKnee' | 'leftKnee';

export interface effectConfigType {
    direction: 'x' | 'y';
    screenRange: screenRange;
    valueRange: valueRange;
    key: effectKeyType;
    bodyPart: bodyPartType;
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

// const createOrUpdateConfig = config => (
//     direction,
//     screenRange,
//     valueRange,
//     effect,
//     bodyPart,
// ) => ({
//     direction: direction || config.direction || 'vertical', // or horizontal
//     screenRange: screenRange || config.screenRange || { a: 0, b: 1},
//     valueRange: valueRange || config.valueRange || { x: 0, y: 0 },
//     effect: effect || config.effect || 'gain',
//     bodyPart: bodyPart || config.bodyPart || 'rightWrist',
// });