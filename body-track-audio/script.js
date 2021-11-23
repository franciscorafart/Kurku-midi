import { drawKeypoints, drawSkeleton } from './utils.js';
import { initAudio } from './audio-ctx.js';

const videoWidth = window.innerWidth;
const videoHeight = window.innerHeight;

let net;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

document.getElementById('btn').addEventListener('click', async () => {
    let audioCtx, sounds;
    try {
        [audioCtx, sounds] = await initAudio();
    } catch (e) {
        throw e;
    }

    init(sounds, audioCtx);
});

// Previous state
let prevDistortion = 0;
let targetDistortion = 0;

let previousLevel = 0;
let targetLevel = 0;

let previousPan = 0;
let targetPan = 0;

let previousRev = 0;
let targetRev = 0;

async function init(sounds, audioCtx) {
    net = await posenet.load();

    // Better accuracy model / slower to load
    // net = await posenet.load({
    //     architecture: 'ResNet50',
    //     outputStride: 32,
    //     inputResolution: { width: 640, height:480 },
    //     quantBytes: 2,
    // });

    let video;

    try {
        video = await loadVideo();
    } catch (e) {
        throw e;
    }

    detectPoseInRealTime(video, net, sounds, audioCtx);
}

async function setupCamera(){
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
            'Browser API navigator.mediaDevices.getUserMedia not available'
        )
    }

    const video = document.getElementById('video');
    video.width = videoWidth;
    video.height = videoHeight;

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: 'user',
            width: videoWidth,
            height: videoHeight,
        },
    });

    video.srcObject = stream;

    return new Promise(
        resolve => (video.onloadedmetadata = () =>
        resolve(video))
    );
}

async function loadVideo() {
    const video = await setupCamera();
    video.play();
    return video;
}

function detectPoseInRealTime(video, net, sounds, audioCtx) {
    const canvas = document.getElementById('output');
    const ctx = canvas.getContext('2d');

    const flipPoseHorizontal = true;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Draw video pixels on canvas and draw keypoints
    async function poseDetectionFrame() {

        const poses = await net.estimateMultiplePoses(video, {
            flipHorizontal: flipPoseHorizontal,
            scroreThreshold: 0.7,
        });

        const minPoseConfidence = 0.5;
        const minPartConfidence = 0.5;

        ctx.clearRect(0,0, videoWidth, videoHeight);
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-videoWidth, 0);
        ctx.drawImage(video, 0, 0, window.innerWidth, window.innerHeight);
        ctx.restore();

        for (const [idx, pose] of poses.entries()) {
            drawKeypoints(pose.keypoints, minPoseConfidence, ctx);
            drawSkeleton(pose.keypoints, minPartConfidence, ctx);

            if (sounds && sounds[idx]) {
                setAudio(pose.keypoints, audioCtx, sounds[idx]);
            }

            // TODO: Set visuals here.
        }

        requestAnimationFrame(poseDetectionFrame);
    }

    poseDetectionFrame();
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


function setAudio(keypoints, audioCtx, sound){
    const panControl = sound.panNode;
    const gainControl = sound.gainNode;
    // const delayControl = sound.delayNode;
    const distortionControl = sound.distortionNode;
    const reverbControl = sound.reverbLevelNode;

    const [nose_x, nose_y] = translatePosition(extractPosition(keypoints, 'nose'));
    const [rw_x, rw_y] = translatePosition(extractPosition(keypoints, 'rightWrist'))
    const [lw_x, lw_y] = translatePosition(extractPosition(keypoints, 'leftWrist'))
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
    //     delayControl.delayTime.value = rw_y || 0;
    // }
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

const extractPosition = (keypoints, bodyPart) => keypoints.find(k => k.part === bodyPart);
const translatePosition = bodyPart => {

    if (bodyPart && bodyPart.score > 0.5) {
        return [Math.abs(bodyPart.position.x / videoWidth), Math.abs((bodyPart.position.y / videoHeight - 1))]
    }

    return [undefined, undefined];
}

