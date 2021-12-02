
import { setAudio, mapPositionToSoundParams } from './audio-utils.js'
import { drawKeypoints, drawSkeleton, getBodyParts } from './utils.js';

const videoWidth = window.innerWidth;
const videoHeight = window.innerHeight;

let net;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
let frame = 0;

export async function initBodyTracking(sounds, audioCtx) {
    // Faster model / less accurate
    // net = await posenet.load();

    // Better accuracy model / slower to load
    // inputResolution changes the image size before sending it to the model, making it faster
    net = await posenet.load({
        architecture: 'ResNet50',
        outputStride: 32,
        inputResolution: { width: 320, height: 240 },
        quantBytes: 2,
    });

    let video;

    try {
        video = await loadVideo();
    } catch (e) {
        throw e;
    }

    detectPoseInRealTime(video, net, sounds, audioCtx);
}

async function loadVideo() {
    const video = await setupCamera();
    video.play();
    return video;
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

const resetCanvas = (ctx) => {
    ctx.clearRect(0,0, videoWidth, videoHeight);
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-videoWidth, 0);
    ctx.drawImage(video, 0, 0, window.innerWidth, window.innerHeight);
    ctx.restore();
}

async function poseDetectionFrame(video, net, ctx, sounds, audioCtx, flipPoseHorizontal) {
    // TODO: Tune this.
    // % executes the calculation every `skipSize` number of frames 
    const skipSize = 10;
    if (frame%skipSize !== 0){
        requestAnimationFrame(() => poseDetectionFrame(
            video,
            net,
            ctx,
            sounds,
            audioCtx,
            flipPoseHorizontal,
        ));
    }

    const poses = await net.estimateMultiplePoses(video, {
        flipHorizontal: flipPoseHorizontal,
        scroreThreshold: 0.7,
    });

    const minPoseConfidence = 0.9;
    const minPartConfidence = 0.9;

    resetCanvas(ctx);

    for (const [idx, pose] of poses.entries()) {
        const bodyPartPositions = getBodyParts(pose.keypoints, minPoseConfidence, videoHeight, videoWidth);

        // Draw tracking figure
        // TODO: Remove when application finished
        drawKeypoints(pose.keypoints, minPoseConfidence, ctx);
        drawSkeleton(pose.keypoints, minPartConfidence, ctx);

        // TODO: Set visuals.

        // Set sounds.
        if (sounds && sounds[idx]) {
            const fxPositions = mapPositionToSoundParams({
                pan: bodyPartPositions['nose'].x,
                gain: bodyPartPositions['nose'].y,
                crossSynthesis: bodyPartPositions['leftWrist'].x,
                distortion: bodyPartPositions['leftWrist'].y,
                // feedback: bodyPartPositions['rightWrist'].x,
                reverb: bodyPartPositions['rightWrist'].y,
                lpf: bodyPartPositions['rightKnee'].y,
                // add bitcrusher
            })

            setAudio(fxPositions, audioCtx, sounds[idx]);
        }
    }

    requestAnimationFrame(() => poseDetectionFrame(
        video,
        net,
        ctx,
        sounds,
        audioCtx,
        flipPoseHorizontal,
    ));
}

function detectPoseInRealTime(video, net, sounds, audioCtx) {
    const canvas = document.getElementById('output');
    const ctx = canvas.getContext('2d');

    const flipPoseHorizontal = true;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Draw video pixels on canvas, draw keypoints, and set audio state
    poseDetectionFrame(
        video, 
        net, 
        ctx, 
        sounds, 
        audioCtx, 
        flipPoseHorizontal,
    );
}
