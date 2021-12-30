import { initAudio, initMicAudio } from './audio-ctx.js';
import { initBodyTracking } from './bodytracking.js';
import { globalConfig } from './config-utils.js';

const btnStems = document.getElementById('btn');
const btnMic = document.getElementById('btn-mic');
let machineType = 'slow'; // fast / decent / slow

// TODO: Add radio buttons to chose machine speed

// TODO: 1. Create sequence of effects 
// 2. Adjust ranges
globalConfig.effects = [
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
    {
        direction: 'y', // or horizontal
        screenRange: { a: 0.1, b: 0.3},
        valueRange: { x: 0, y: 1 },
        key: 'bitcrusher',
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
    //     direction: 'y', // or horizontal
    //     screenRange: { a: 0, b: 1},
    //     valueRange: { x: 0, y: 0 },
    //     key: 'analyser',
    //     bodyPart: 'rightWrist',
    //     defaultValues: {
    //         gain: 1,
    //         delayInSec: 1,
    //         file: '',
    //         fftSize: 2948,
    //     },
    //     node: undefined,
    // },
]

btnStems.addEventListener('click', async () => {
    try {
        const audioCtx = await initAudio(globalConfig);
        await initBodyTracking(globalConfig, audioCtx, globalConfig.machineType);
    } catch (e) {
        throw e;
    }

    btnStems.hidden = true;
    btnMic.hidden = true;
});

btnMic.addEventListener('click', async () => {
    try {
        const audioCtx = await initMicAudio(globalConfig);
        await initBodyTracking(globalConfig, audioCtx, globalConfig.machineType);
    } catch (e) {
        throw e;
    }

    btnStems.hidden = true;
    btnMic.hidden = true;
});


