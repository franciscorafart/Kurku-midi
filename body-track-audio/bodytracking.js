
import { setAudio, mapPositionToSoundParams } from './audio-utils.js'
import { drawKeypoints, drawSkeleton, getBodyParts } from './utils.js';

const videoWidth = window.innerWidth;
const videoHeight = window.innerHeight;

let net;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
let frame = 0;

const machineConfig = {
    slow: {
        arch: 'MobileNetV1',
        skipSize: 5,
        audioSkipSize: 0.05,
        confidence: 0.5,
    },
    decent: {
        arch: 'MobileNetV1',
        skipSize: 2,
        audioSkipSize: 0.1,
        confidence: 0.7,
    },
    fast: { // Tested ok
        arch: 'ResNet50',
        skipSize: 5,
        audioSkipSize: 0.2,
        confidence: 0.9,
        quantBytes: 2,
    },
}
export async function initBodyTracking(sounds, audioCtx, machineType) {
    const config = machineConfig[machineType];
    if (config.arch === 'MobileNetV1') {
        // Faster model / less accurate
        net = await posenet.load(
            {
                architecture: config.arch,
                inputResolution: { width: 320, height: 240 },
            }
        );
    } else {
        // Better accuracy model / slower to load
        // inputResolution changes the image size before sending it to the model, making it faster
        net = await posenet.load({
            architecture: config.arch,
            outputStride: 32,
            inputResolution: { width: 320, height: 240 },
            quantBytes: config.quantBytes,
        });
    }

    let video;

    try {
        video = await loadVideo();
    } catch (e) {
        throw e;
    }

    detectPoseInRealTime(video, net, sounds, audioCtx, config);
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

async function poseDetectionFrame(
    video, 
    net, 
    ctx, 
    sounds, 
    audioCtx, 
    flipPoseHorizontal, 
    config) {
    // TODO: Tune this.
    // % executes the calculation every `skipSize` number of frames 
    if (frame%config.skipSize === 0) {
        const poses = await net.estimateMultiplePoses(video, {
            flipHorizontal: flipPoseHorizontal,
            scroreThreshold: 0.7,
        });
        
        resetCanvas(ctx);
        
        for (const [idx, pose] of poses.entries()) {
            const bodyPartPositions = getBodyParts(pose.keypoints, config.confidence, videoHeight, videoWidth);
            
            // Draw tracking figure
            // TODO: Remove when application finished
            drawKeypoints(pose.keypoints, config.confidence, ctx);
            drawSkeleton(pose.keypoints, config.confidence, ctx);
            
            // TODO: Set visuals.
            
            // Set sounds.
            if (sounds && sounds[idx]) {
                const fxPositions = mapPositionToSoundParams({
                    pan: bodyPartPositions['nose'].x,
                    gain: bodyPartPositions['nose'].y,
                    crossSynthesis: bodyPartPositions['leftWrist'].x,
                    distortion: bodyPartPositions['leftWrist'].y,
                    bitCrusher: bodyPartPositions['leftWrist'].y,
                    delay: bodyPartPositions['leftWrist'].x,
                    feedback: bodyPartPositions['rightWrist'].x,
                    reverb: bodyPartPositions['rightWrist'].y,
                    hpf: bodyPartPositions['rightKnee'].y,
                })
                
                setAudio(fxPositions, audioCtx, sounds[idx], config.audioSkipSize);
            }
        }
    }

    frame++;
        
    requestAnimationFrame(() => poseDetectionFrame(
        video,
        net,
        ctx,
        sounds,
        audioCtx,
        flipPoseHorizontal,
        config,
    ));
}

function detectPoseInRealTime(video, net, sounds, audioCtx, config) {
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
        config,
    );
}
