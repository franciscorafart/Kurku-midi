// Previous state
let prevDistortion = 0;
let targetDistortion = 0;

let prevCrush = 1;
let targetCrush = 1;

let previousLevel = 0;
let targetLevel = 0;

let previousPan = 0;
let targetPan = 0;

let previousRev = 0;
let targetRev = 0;

let targetDelay = 0;
let previousDelay = 0;
let targetFeedback = 0;
let previousFeedback = 0;

let targetCross = 0;
let previousCross = 0;

let targetHpf = 0;
let previousHpf = 0;

const fixedDelay = true;

export function mapPositionToSoundParams(params) { 
    return {
        pan: params.pan,
        gain: params.gain,
        crossSynthesis: params.crossSynthesis,
        distortion: params.distortion,
        bitCrusher: params.bitCrusher,
        delay: params.delay,
        feedback: params.feedback,
        reverb: params.reverb,
        hpf: params.hpf,
    }
};

export function setAudio(
    fxPositions,
    audioCtx, 
    sound,
    audioSkipSize,
){
    const panNode = sound.panNode;
    const gainNode = sound.gainNode;
    const feedbackNode = sound.feedback;
    const distortionNode = sound.distortionNode;
    const bitCrushNode = sound.bitCrushNode;
    const reverbControl = sound.reverbLevelNode;
    const crossSynthesisNode = sound.crossSynthesisNode;
    const delayNode = sound.delayNode;
    const hpfNode = sound.hpfNode;

    const panPos = fxPositions.pan;
    const gainPos = fxPositions.gain;
    const crossSynthPos = fxPositions.crossSynthesis;
    const distortionPos = fxPositions.distortion;
    const bitCrushPos = fxPositions.bitCrusher;
    const feedbackPos = fxPositions.feedback;
    const reverbPos = fxPositions.reverb;
    const delayPos = fxPositions.delay;
    const hpfPos = fxPositions.hpf;

    // 1. Distance from camera => Filter

    if (panNode){
        if (panPos !== undefined) {
            // targetPan = scaleCenterdWindow(-0.2, 0.2, zeroCenter(panPos));;
            targetPan = scaleWindowToRange(-0.2, 0.2, -1, 1, panPos);
        }

        const nextPan = moveTowardsPoint(previousPan, targetPan, audioSkipSize);
        panNode.pan.value = nextPan;
        previousPan = nextPan;
    }

    if (gainNode) {
        if (gainPos !== undefined) {
            targetLevel = scaleWindowToRange(0.5, 0.8, 0, 1, gainPos);
            // targetLevel = scaleWindow(0.5, 0.8, gainPos);
        }

        const nextLevel = moveTowardsPoint(previousLevel, targetLevel, audioSkipSize);
        gainNode.gain.setValueAtTime(nextLevel, audioCtx.currentTime);
        previousLevel = nextLevel;
    }

    if(distortionNode) {
        if (distortionPos !== undefined) {
            targetDistortion = scaleWindowToRange(0.75, 1, 0, 1, distortionPos);
            // targetDistortion = scaleWindow(0.75, 1, distortionPos);
        }

        const nextPosition = moveTowardsPoint(prevDistortion, targetDistortion, audioSkipSize);
        distortionNode.curve = makeDistortionCurve(nextPosition * 200);
        prevDistortion = nextPosition;
        distortionNode.oversample = '4x';
    }

    const bitSizeParam = bitCrushNode.parameters.get('bitSize')

    if (bitCrushNode) {
        if (bitCrushPos !== undefined) {
            targetCrush = scaleWindowToRange(0.1, 0.3, 0, 1, bitCrushPos);
            // targetCrush = scaleWindow(0.1, 0.3, bitCrushPos);
        }
        const nextCrush = moveTowardsPoint(prevCrush, targetCrush, audioSkipSize);
        bitSizeParam.setValueAtTime(Math.max(4, Math.ceil(nextCrush * 16)), audioCtx.currentTime);
        prevCrush = nextCrush;
    }
    
    if (reverbControl) {
        if (reverbPos !== undefined) {
            targetRev = scaleWindowToRange(0.5, 0.8, 0, 1, reverbPos);
            // targetRev = scaleWindow(0.5, 1, reverbPos);
        }

        const nextRev = moveTowardsPoint(previousRev, targetRev, audioSkipSize);
        reverbControl.gain.setValueAtTime(nextRev, audioCtx.currentTime);
        previousRev = nextRev;
    }


    if (delayNode) {
        if (!fixedDelay) {
            if (delayPos !== undefined) {
                targetDelay = scaleWindowToRange(0.2, 0.4, 0, 1, delayPos);
                // targetDelay = scaleWindow(0.2, 0.4, delayPos);
            }
            const nextDelay = moveTowardsPoint(previousDelay, targetDelay, audioSkipSize);
            delayNode.delayTime.setValueAtTime(nextDelay, audioCtx.currentTime);
            previousDelay = nextDelay;
        }
        
    }

    if (feedbackNode) {
        if (feedbackPos !== undefined) {
            targetFeedback = scaleWindowToRange(0, 0.6, -1, 1, feedbackPos);
            // targetFeedback = scaleWindow(0, 0.6, zeroToOneScaleCentered(feedbackPos));
        }

        const nextFeedback = moveTowardsPoint(previousFeedback, targetFeedback, audioSkipSize);
        feedbackNode.gain.setValueAtTime(nextFeedback, audioCtx.currentTime);
        previousFeedback = nextFeedback;
    }

    if (crossSynthesisNode) {
        if (crossSynthPos !== undefined) {
            targetCross = scaleWindowToRange(0.2, 0.4, -1, 1, crossSynthPos);
            // targetCross = scaleWindow(0.2, 0.4, zeroToOneScaleCentered(crossSynthPos));
        }

        const nextCross = moveTowardsPoint(previousCross, targetCross, audioSkipSize);
        crossSynthesisNode.gain.setValueAtTime(nextCross, audioCtx.currentTime);
        previousCross = nextCross;
    }

    if (hpfNode) {
        if (hpfPos !== undefined) {
            targetHpf = hpfPos;
        }

        const nextHpf = moveTowardsPoint(previousHpf, targetHpf, audioSkipSize);
        const frequency = scaleWindowToRange(0.25, 0.35, 0, 10000, nextHpf);
        // const frequency = scaleWindow(0.25, 0.35, nextHpf) * 10000;
        hpfNode.frequency.setValueAtTime(frequency, audioCtx.currentTime);

        previousHpf = nextHpf;
    }
}

// TODO: Problem with artifacts at limit of screen likely here
const moveTowardsPoint = (origin, destination, skipSize) => {
    const distance = Math.abs(destination - origin)
    
    if (distance <= skipSize) {
        return destination
    }

    const sign = destination > origin ? 1 : -1;
    return boundOneAndZero(origin+(sign*skipSize));
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

    return boundToValues(rangeStart, rangeEnd, rangeStart + (windowedValue * scaleFactor));
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

