

let prevCrush = 1;
let targetCrush = 1;

let previousRev = 0;
let targetRev = 0;

let targetFeedback = 0;
let previousFeedback = 0;

let targetCross = 0;
let previousCross = 0;

const setEffectValue = (effect, node, currentTime, value) => {
    if (effect === 'gain') {
        node.gain.setValueAtTime(value, currentTime);
    } else if (effect === 'pan') {
        node.pan.setValueAtTime(value, currentTime);
    } else if (effect === 'distortion') {
        node.curve = makeDistortionCurve(value * 200);
        node.oversample = '4x';
    } else if (effect === 'bitcrusher') {
        const bitSizeParam = node.parameters.get('bitSize')
        bitSizeParam.setValueAtTime(Math.max(4, Math.ceil(value * 16)), currentTime);
    } else if (effect === 'hpf') {
        node.frequency.setValueAtTime(value, currentTime);
    } else if (effect === 'delay') {
        node.delayTime.setValueAtTime(value, currentTime);
    }
};

export const mapGlobalConfigsToSound = (globalConfig, bodyPartPositions, audioCtx) => {
    for (const effect of globalConfig.effects) {
        const bodyPart = effect.bodyPart;
        const direction = effect.direction === 'vertical' ? 'y' : 'x';

        const position = bodyPartPositions[bodyPart][direction];

        const node = effect.node;
        
        const screenRange = effect.screenRange;
        const valueRange = effect.valueRange;

        if (node){
            if (position !== undefined) {
                effect.targetValue = scaleWindowToRange(
                    screenRange.a, 
                    screenRange.b, 
                    valueRange.x,
                    valueRange.y, 
                    position,
                );
            }
    
            const nextValue = moveTowardsPoint(effect.previousValue, effect.targetValue, globalConfig.skipSize);
            setEffectValue(effect.effect, node, audioCtx.currentTime, nextValue);
            effect.previousValue = nextValue;
        }
    }
}

export function setAudio(
    fxPositions,
    audioCtx, 
    sound,
    audioSkipSize,
){

    const bitSizeParam = bitCrushNode.parameters.get('bitSize')

    if (bitCrushNode) {
        if (bitCrushPos !== undefined) {
            targetCrush = scaleWindowToRange(0.1, 0.3, 0, 1, bitCrushPos);
        }
        const nextCrush = moveTowardsPoint(prevCrush, targetCrush, audioSkipSize);
        bitSizeParam.setValueAtTime(Math.max(4, Math.ceil(nextCrush * 16)), audioCtx.currentTime);
        prevCrush = nextCrush;
    }
    
    if (reverbControl) {
        if (reverbPos !== undefined) {
            targetRev = scaleWindowToRange(0.5, 0.8, 0, 1, reverbPos);
        }

        const nextRev = moveTowardsPoint(previousRev, targetRev, audioSkipSize);
        reverbControl.gain.setValueAtTime(nextRev, audioCtx.currentTime);
        previousRev = nextRev;
    }

    if (feedbackNode) {
        if (feedbackPos !== undefined) {
            targetFeedback = scaleWindowToRange(0, 0.6, -1, 1, feedbackPos);
        }

        const nextFeedback = moveTowardsPoint(previousFeedback, targetFeedback, audioSkipSize);
        feedbackNode.gain.setValueAtTime(nextFeedback, audioCtx.currentTime);
        previousFeedback = nextFeedback;
    }

    if (crossSynthesisNode) {
        if (crossSynthPos !== undefined) {
            targetCross = scaleWindowToRange(0.2, 0.4, -1, 1, crossSynthPos);
        }

        const nextCross = moveTowardsPoint(previousCross, targetCross, audioSkipSize);
        crossSynthesisNode.gain.setValueAtTime(nextCross, audioCtx.currentTime);
        previousCross = nextCross;
    }
}

// TODO: Problem with artifacts at limit of screen likely here
const moveTowardsPoint = (origin, destination, skipSize) => {
    const distance = Math.abs(destination - origin)
    
    if (distance <= skipSize) {
        return destination
    }

    const sign = destination > origin ? 1 : -1;
    return origin+(sign*skipSize);
}

const boundToValues = (start, finish, v) => {
    if (v < start) {
        return start;
    }

    if (v > finish) {
        return finish;
    }

    return v;
}

// TODO: Test
// Takes a segment (windowStart:windowEnd) of a 0 to 1 range, and scales it to go from (rangeStart:rangeEnd)
const scaleWindowToRange = (windowStart, windowEnd, rangeStart, rangeEnd, v) => {
    const windowedValue = boundToValues(windowStart, windowEnd, v);
    const windowRange = Math.abs(windowEnd - windowStart); 
    const scaleFactor = 1 / windowRange * (rangeEnd - rangeStart);

    return boundToValues(rangeStart, rangeEnd, rangeStart + (windowedValue - windowStart) * scaleFactor);
}

const boundOneAndZero = n => boundToValues(0, 1, n);

function makeDistortionCurve(amount) {
    var k = typeof amount === 'number' ? amount : 50,
        n_samples = 44100,
        curve = new Float32Array(n_samples),
        deg = Math.PI / 180,
        i = 0,
        x;
    for ( ; i < n_samples; ++i ) {
        x = i * 2 / n_samples - 1;
        curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
    }

    return curve;
};

