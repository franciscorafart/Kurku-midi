// Previous state
let prevDistortion = 0;
let targetDistortion = 0;

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

export function mapPositionToSoundParams(
    pan,
    gain,
    crossSynthesis,
    distortion,
    feedback,
    reverb,
) { 
    return ({
        pan,
        gain,
        crossSynthesis,
        distortion,
        feedback,
        reverb,
    })
};

export function setAudio(
    fxPositions,
    audioCtx, 
    sound,
){

    const panNode = sound.panNode;
    const gainNode = sound.gainNode;
    const feedbackNode = sound.feedback;
    const distortionNode = sound.distortionNode;
    const reverbControl = sound.reverbLevelNode;
    const crossSynthesisNode = sound.crossSynthesisNode;
    const delayNode = sound.delayNode;

    const panPos = fxPositions.pan;
    const gainPos = fxPositions.gain;
    const crossSynthPos = fxPositions.crossSynthesis;
    const distortionPos = fxPositions.distortion;
    const feedbackPos = fxPositions.feedback;
    const reverbPos = fxPositions.reverb;
    // const delayPos = fxPositions.delay;

    // TODO: Implement more complex/interesting interactions.
    // 1. Distance from camera => Filter
    // 2. Hand howizontal => Delay and feedback
    // Feet => Delay / Filter / Bitcrusher
    // Try out continuous pulsating sounds instead of synth, so I can try delay.
    if (panNode){
        if (panPos !== undefined) {
            targetPan = panPos;
        }
        const nextPan = moveTowardsPoint(previousPan, targetPan);
        panNode.pan.value = (nextPan * 2) - 1;
        previousPan = nextPan;
    }

    if (gainNode) {
        if (gainPos !== undefined) {
            targetLevel = gainPos;
        }

        const nextLevel = moveTowardsPoint(previousLevel, targetLevel);
        gainNode.gain.setValueAtTime(nextLevel, audioCtx.currentTime);
        previousLevel = nextLevel;
    }

    if(distortionNode) {
        if (distortionPos !== undefined) {
            targetDistortion = distortionPos;
        }

        const nextPosition = moveTowardsPoint(prevDistortion, targetDistortion);
        distortionNode.curve = makeDistortionCurve(nextPosition * 60);
        prevDistortion = nextPosition;
        distortionNode.oversample = '4x';
    }
    
    if (reverbControl) {
        if (reverbPos !== undefined) {
            targetRev = reverbPos;
        }

        const nextRev = moveTowardsPoint(previousRev, targetRev);
        reverbControl.gain.setValueAtTime(nextRev, audioCtx.currentTime);
        previousRev = nextRev;
    }


    // if (delayNode) {
    //     if (delayPos !== undefined) {
    //         targetDelay = delayPos;
    //     }

    //     const nextDelay = moveTowardsPoint(previousDelay, targetDelay);
    //     delayNode.delayTime.setValueAtTime(nextDelay * 10, audioCtx.currentTime);
    //     previousDelay = nextDelay;
    // }

    if (feedbackNode) {
        if (feedbackPos !== undefined) {
            targetFeedback = feedbackPos;
        }

        const nextFeedback = moveTowardsPoint(previousFeedback, targetFeedback);
        feedbackNode.gain.setValueAtTime(nextFeedback, audioCtx.currentTime);
        previousFeedback = nextFeedback;
    }

    if (crossSynthesisNode) {
        if (crossSynthPos !== undefined) {
            targetCross = Math.abs(crossSynthPos - 1);
        }

        const nextCross = moveTowardsPoint(previousCross, targetCross);
        crossSynthesisNode.gain.setValueAtTime(nextCross, audioCtx.currentTime);
        previousCross = nextCross;
    }
}

// TODO: Problem with artifacts at limit of screen likely here
const moveTowardsPoint = (origin, destination) => {
    const distance = Math.abs(destination - origin)
    
    if (distance <= 0.01) {
        return destination
    }

    const sign = destination > origin ? 1 : -1;
    return boundOneAndZero(origin+(sign*0.01));
}

const boundOneAndZero = n => {
    if (n >= 1) {
        return 1;
    } else if (n <= 0.01) {
        return 0.01;
    }

    return n;
}

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

