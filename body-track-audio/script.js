import { drawKeypoints, drawSkeleton, getBodyParts } from './utils.js';
import { initAudio, initMicAudio } from './audio-ctx.js';
import { setAudio } from './audio-utils.js'

const videoWidth = window.innerWidth;
const videoHeight = window.innerHeight;

let net;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

const btnStems = document.getElementById('btn');
const btnMic = document.getElementById('btn-mic');

btnStems.addEventListener('click', async () => {
    try {
        const [audioCtx, sounds, playAll] = await initAudio();
        await initBodyTracking(sounds, audioCtx);
        playAll();
    } catch (e) {
        throw e;
    }

    btnStems.hidden = true;
    btnMic.hidden = true;
});

btnMic.addEventListener('click', async () => {
    try {
        const [audioCtx, sounds] = await initMicAudio();
        await initBodyTracking(sounds, audioCtx);
    } catch (e) {
        throw e;
    }

    btnStems.hidden = true;
    btnMic.hidden = true;
});

async function initBodyTracking(sounds, audioCtx) {
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
    const poses = await net.estimateMultiplePoses(video, {
        flipHorizontal: flipPoseHorizontal,
        scroreThreshold: 0.7,
    });

    const minPoseConfidence = 0.5;
    const minPartConfidence = 0.5;

    resetCanvas(ctx);

    for (const [idx, pose] of poses.entries()) {
        // Drwaing and settign audio should be separate process than getting positions
        drawKeypoints(pose.keypoints, minPoseConfidence, ctx);
        drawSkeleton(pose.keypoints, minPartConfidence, ctx);

        const bodyPartPositions = getBodyParts(
            pose.keypoints,
            ['nose', 'rightWrist', 'leftWrist'],
            videoHeight,
            videoWidth,
        );

        if (sounds && sounds[idx]) {
            // Interface between audio controls and position
            const fxPositions = {
                pan: bodyPartPositions['nose'][0],
                gain: bodyPartPositions['nose'][1],
                crossSynthesis: bodyPartPositions['leftWrist'][0],
                distortion: bodyPartPositions['leftWrist'][1],
                feedback: bodyPartPositions['rightWrist'][0],
                reverb: bodyPartPositions['rightWrist'][1],
            }


            setAudio(fxPositions, audioCtx, sounds[idx]);
        }

        // TODO: Set visuals here.
    }

    requestAnimationFrame(() => poseDetectionFrame(video, net, ctx, sounds, audioCtx, flipPoseHorizontal));
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


