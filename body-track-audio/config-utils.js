// TODO: Make a dynamic configuration object that allows to:
    // Associate effects to spaces in the screen
    // Constrain the values to sections of the screen
    // Assign range of values to a section of the screen

// 2. Load audio ctx from configs instead of harcoded
// 3. Process nodes and positions dinamically
// 4. Build config interface in React-typescript: Make draggable interface for screen range
// 6. Add Midi CC functionality

export const globalConfig = {
    effects: [],
    machineType: 'slow',
    bmp: 60,
    skipSize: 0.1,
}

export const effectConfig = {
    direction: 'vertical', // or horizontal
    screenRange: { a: 0, b: 1},
    valueRange: { x: 0, y: 0 },
    effect: 'gain',
    bodyPart: 'rightWrist',
    previousValue: 0,
    targetValue: 0,
    defaultValues: {
        gain: 1,
        delayInSec: 1,
        file: '',
        fftSize: 2948,
    },
    node: undefined,
}

const createOrUpdateConfig = config => (
    direction,
    screenRange,
    valueRange,
    effect,
    bodyPart,
) => ({
    direction: direction || config.direction || 'vertical', // or horizontal
    screenRange: screenRange || config.screenRange || { a: 0, b: 1},
    valueRange: valueRange || config.valueRange || { x: 0, y: 0 },
    effect: effect || config.effect || 'gain',
    bodyPart: bodyPart || config.bodyPart || 'rightWrist',
});