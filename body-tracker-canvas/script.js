import { drawKeypoints, drawSkeleton } from './utils.js';

const videoWidth = window.innerWidth;
const videoHeight = window.innerHeight;

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

function detectPoseInRealTime(video, net) {
    const canvas = document.getElementById('output');
    const ctx = canvas.getContext('2d');

    const flipPoseHorizontal = true;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Draw video pixels on canvas and draw keypoints
    async function poseDetectionFrame() {

        const pose = await net.estimateMultiplePoses(video, {
            flipHorizontal: flipPoseHorizontal,
            scroreThreshold: 0.8,
        });

        const minPoseConfidence = 0.5;
        const minPartConfidence = 0.5;

        ctx.clearRect(0,0, videoWidth, videoHeight);
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-videoWidth, 0);
        ctx.drawImage(video, 0, 0, window.innerWidth, window.innerHeight);
        ctx.restore();

        for (const p of pose) {
            drawKeypoints(p.keypoints, minPoseConfidence, ctx);
            drawSkeleton(p.keypoints, minPartConfidence, ctx);
        }

        requestAnimationFrame(poseDetectionFrame);
    }

    poseDetectionFrame();
}


let net;

async function init() {
    net = await posenet.load();

    let video;

    try {
        video = await loadVideo();
    } catch (e) {
        throw e;
    }

    detectPoseInRealTime(video, net);
}

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
init();
