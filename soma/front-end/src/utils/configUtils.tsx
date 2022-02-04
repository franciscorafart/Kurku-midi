export const sessionConfig: sessionConfigType = {
    effects: [
        {
            direction: 'x', // horizontal
            screenRange: { a: 0.3, b: 0.7},
            valueRange: { x: -1, y: 1 },
            key: 'pan',
            bodyPart: 'nose',
            previousValue: 0,
            targetValue: 0,
            defaultValues: {
                gain: 1,
                delayInSec: 1,
                file: '',
                fftSize: 2948,
            },
            node: undefined,
        },
        {
            direction: 'y', // vertical
            screenRange: { a: 0.5, b: 0.8},
            valueRange: { x: 0, y: 1 },
            key: 'gain',
            bodyPart: 'nose',
            previousValue: 0,
            targetValue: 0,
            defaultValues: {
                gain: 1,
                delayInSec: 1,
                file: '',
                fftSize: 2948,
            },
            node: undefined,
        },
        {
            direction: 'y', // vertical
            screenRange: { a: 0.75, b: 1},
            valueRange: { x: 0, y: 1 },
            key: 'distortion',
            bodyPart: 'leftWrist',
            previousValue: 0,
            targetValue: 0,
            defaultValues: {
                gain: 1,
                delayInSec: 1,
                file: '',
                fftSize: 2948,
            },
            node: undefined,
        },
        // {
        //     direction: 'y', // or horizontal
        //     screenRange: { a: 0.1, b: 0.3},
        //     valueRange: { x: 0, y: 1 },
        //     key: 'bitcrusher',
        //     bodyPart: 'leftWrist',
        //     previousValue: 0,
        //     targetValue: 0,
        //     defaultValues: {
        //         gain: 1,
        //         delayInSec: 1,
        //         file: '',
        //         fftSize: 2948,
        //     },
        //     node: undefined,
        // },
        {
            direction: 'y', // vertical
            screenRange: { a: 0.25, b: 0.35},
            valueRange: { x: 0, y: 10000 },
            key: 'hpf',
            bodyPart: 'rightKnee',
            previousValue: 0,
            targetValue: 0,
            defaultValues: {
                gain: 1,
                delayInSec: 1,
                file: '',
                fftSize: 2948,
            },
            node: undefined,
        },
        // {
        //     direction: 'y', // vertical
        //     screenRange: { a: 0.6, b: 1},
        //     valueRange: { x: 0, y: 0.6 },
        //     key: 'reverb',
        //     bodyPart: 'rightWrist',
        //     previousValue: 0,
        //     targetValue: 0,
        //     defaultValues: {
        //         gain: 1,
        //         delayInSec: 1,
        //         file: 'assets/impulse-response.wav', // TODO: Fix file import issue
        //         fftSize: 2948,
        //     },
        //     node: undefined,
        // },
    ],
    machineType: 'slow', // fast / decent / slow
    bpm: 60,
    skipSize: 0.1,
}

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

export type MachineType = 'slow' | 'decent' | 'fast';

export interface sessionConfigType {
    effects: effectConfigType[];
    machineType: MachineType;
    bpm: number;
    skipSize: number;
}