import { mapGlobalConfigsToSound } from "./audioUtils";
import { drawKeypoints, drawSkeleton, getBodyParts } from "./utils";
import * as posenet from "@tensorflow-models/posenet";
import "@tensorflow/tfjs";
import { Keypoints, MachineType, SessionConfigType } from "./configUtils";
import { PoseNetQuantBytes } from "@tensorflow-models/posenet/dist/types";
import { useSetRecoilState } from "recoil";
import keypoints from "atoms/keypoints";

const videoWidth = window.innerWidth;
const videoHeight = window.innerHeight;

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
    // Tested ok
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
  setKeypoints: (kps: Keypoints) => void
) {
  const config = machineConfig[machineType];
  let net: posenet.PoseNet;

  if (config.arch === "MobileNetV1") {
    // Faster model / less accurate
    net = await posenet.load({
      architecture: config.arch,
      inputResolution: { width: 320, height: 240 },
      outputStride: 16
    });
  } else {
    // Better accuracy model / slower to load
    // inputResolution changes the image size before sending it to the model, making it faster
    net = await posenet.load({
      architecture: config.arch,
      outputStride: 32,
      inputResolution: { width: 320, height: 240 },
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
  video.width = videoWidth;
  video.height = videoHeight;

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: "user", width: videoWidth, height: videoHeight }
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
  // sessionConfig: SessionConfigType,
  // audioCtx: AudioContext,
  flipPoseHorizontal: boolean,
  config: PosenetConfigType,
  setKeypoints: (kps: Keypoints) => void
) {
  // TODO: Move this to a higher level in a react component
  // % executes the calculation every `skipSize` number of frames
  if (frame % config.skipSize === 0) {
    const pose = await net.estimateSinglePose(video, {
      flipHorizontal: flipPoseHorizontal
      // scoreThreshold: 0.7
    });

    setKeypoints(pose.keypoints);

    // TODO: decouple audio

    // Audio portion

    // const bodyPartPositions = getBodyParts(
    //   pose.keypoints,
    //   config.confidence,
    //   videoHeight,
    //   videoWidth
    // );

    // mapGlobalConfigsToSound(sessionConfig, bodyPartPositions, audioCtx);
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
