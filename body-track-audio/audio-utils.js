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

export function setAudio(
    keypoints, 
    audioCtx, 
    sound, 
    videoHeight, 
    videoWidth
){
    const panControl = sound.panNode;
    const gainControl = sound.gainNode;
    const delayControl = sound.delayNode;
    const feedback = sound.feedback;
    const distortionControl = sound.distortionNode;
    const reverbControl = sound.reverbLevelNode;
    const crossSynthesisControl = sound.crossSynthesisNode;

    const [nose_x, nose_y] = translatePosition(extractPosition(keypoints, 'nose'), videoHeight, videoWidth);
    const [rw_x, rw_y] = translatePosition(extractPosition(keypoints, 'rightWrist'), videoHeight, videoWidth)
    const [lw_x, lw_y] = translatePosition(extractPosition(keypoints, 'leftWrist'), videoHeight, videoWidth)

    // TODO: Implement more complex/interesting interactions.
    // 1. Distance from camera => Filter
    // 2. Hand howizontal => Delay and feedback
    // Feet => Delay / Filter / Bitcrusher
    // Try out continuous pulsating sounds instead of synth, so I can try delay.
    if (panControl){
        if (nose_x !== undefined) {
            targetPan = nose_x;
        }
        const nextPan = moveTowardsPoint(previousPan, targetPan);
        // console.log('nextPan', nextPan)
        panControl.pan.value = (nextPan * 2) - 1;
        previousPan = nextPan;
    }

    if (gainControl) {
        if (nose_y !== undefined) {
            targetLevel = nose_y;
        }

        const nextLevel = moveTowardsPoint(previousLevel, targetLevel);
        gainControl.gain.setValueAtTime(nextLevel, audioCtx.currentTime);
        previousLevel = nextLevel;
    }

    if(distortionControl) {
        if (lw_y !== undefined) {
            targetDistortion = lw_y;
        }

        const nextPosition = moveTowardsPoint(prevDistortion, targetDistortion);
        distortionControl.curve = makeDistortionCurve(nextPosition * 60);
        prevDistortion = nextPosition;
        distortionControl.oversample = '4x';
    }
    
    if (reverbControl) {
        if (rw_y !== undefined) {
            targetRev = rw_y;
        }

        const nextRev = moveTowardsPoint(previousRev, targetRev);
        reverbControl.gain.setValueAtTime(nextRev, audioCtx.currentTime);
        previousRev = nextRev;
    }


    // if (delayControl) {
    //     if (rw_x !== undefined) {
    //         targetDelay = rw_x;
    //     }

    //     const nextDelay = moveTowardsPoint(previousDelay, targetDelay);
    //     delayControl.delayTime.setValueAtTime(nextDelay * 10, audioCtx.currentTime);
    //     previousDelay = nextDelay;
    // }

    if (feedback) {
        if (rw_x !== undefined) {
            targetFeedback = rw_x;
        }

        const nextFeedback = moveTowardsPoint(previousFeedback, targetFeedback);
        feedback.gain.setValueAtTime(nextFeedback, audioCtx.currentTime);
        previousFeedback = nextFeedback;
    }

    if (crossSynthesisControl) {
        if (lw_x !== undefined) {
            targetCross = Math.abs(lw_x - 1);
        }

        const nextCross = moveTowardsPoint(previousCross, targetCross);
        crossSynthesisControl.gain.setValueAtTime(nextCross, audioCtx.currentTime);
        previousCross = nextCross;
    }
}

const extractPosition = (keypoints, bodyPart) => keypoints.find(k => k.part === bodyPart);

const translatePosition = (bodyPart, videoHeight, videoWidth) => {

    if (bodyPart && bodyPart.score > 0.5) {
        return [Math.abs(bodyPart.position.x / videoWidth), Math.abs((bodyPart.position.y / videoHeight - 1))]
    }

    return [undefined, undefined];
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

