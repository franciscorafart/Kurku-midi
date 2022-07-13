import * as posenet from "@tensorflow-models/posenet";
import "@tensorflow/tfjs";
import { Keypoints, MachineType } from "config/shared";
import { PoseNetQuantBytes } from "@tensorflow-models/posenet/dist/types";

// @ts-ignore
// prettier-ignore
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

let frame = 0;

export type PosenetConfigType = {
  arch: "MobileNetV1" | "ResNet50";
  skipSize: number;
  audioSkipSize: number;
  confidence: number;
  quantBytes?: PoseNetQuantBytes;
};

export const machineConfig: { [index: string]: PosenetConfigType } = {
  slow: {
    arch: "MobileNetV1",
    skipSize: 5,
    audioSkipSize: 0.05,
    confidence: 0.5
  },
  decent: {
    arch: "MobileNetV1",
    skipSize: 2,
    audioSkipSize: 0.1,
    confidence: 0.7
  },
  fast: {
    arch: "ResNet50",
    skipSize: 5,
    audioSkipSize: 0.2,
    confidence: 0.9,
    quantBytes: 2
  }
};

export async function initBodyTracking(
  machineType: MachineType,
  video: HTMLVideoElement,
  setKeypoints: (kps: Keypoints) => void,
  ratio: number,
) {
  const config = machineConfig[machineType];
  let net: posenet.PoseNet;

  if (config.arch === "MobileNetV1") {
    // Faster model / less accurate
    net = await posenet.load({
      architecture: config.arch,
      inputResolution: { width: 320, height: 320 / ratio },
      outputStride: 16
    });
  } else {
    // Better accuracy model / slower to load
    // inputResolution changes the image size before sending it to the model, making it faster
    net = await posenet.load({
      architecture: config.arch,
      outputStride: 32,
      inputResolution: { width: 320, height: 320 / ratio },
      quantBytes: config.quantBytes
    });
  }

  detectPoseInRealTime(video, net, config, setKeypoints);
}

export async function setupCamera(
  video: HTMLVideoElement
): Promise<HTMLVideoElement> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      "Browser API navigator.mediaDevices.getUserMedia not available"
    );
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: 'user'}
    // NOTE: Lower resolution
    // video: { facingMode: "user", width: video.height, height: video.height }

  });

  // @ts-ignore
  video.srcObject = stream;

  return new Promise(
    (resolve) => (video.onloadedmetadata = () => resolve(video))
  );
}

async function poseDetectionFrame(
  video: HTMLVideoElement,
  net: posenet.PoseNet,
  flipPoseHorizontal: boolean,
  config: PosenetConfigType,
  setKeypoints: (kps: Keypoints) => void
) {
  // % executes the calculation every `skipSize` number of frames
  if (frame % config.skipSize === 0) {
    const pose = await net.estimateSinglePose(video, {
      flipHorizontal: flipPoseHorizontal
      // scoreThreshold: 0.7
    });
    setKeypoints(pose.keypoints);
  }

  frame++;

  requestAnimationFrame(() =>
    poseDetectionFrame(video, net, flipPoseHorizontal, config, setKeypoints)
  );
}

function detectPoseInRealTime(
  video: HTMLVideoElement,
  net: posenet.PoseNet,
  config: PosenetConfigType,
  setKeypoints: (kps: Keypoints) => void
) {
  const flipPoseHorizontal = true;

  // Draw video pixels on canvas, draw keypoints, and set audio state
  poseDetectionFrame(video, net, flipPoseHorizontal, config, setKeypoints);
}
