import * as posenet from "@tensorflow-models/posenet";
import "@tensorflow/tfjs";
import { Keypoints, MachineType } from "config/shared";
import { PoseNetQuantBytes } from "@tensorflow-models/posenet/dist/types";

// @ts-ignore
// prettier-ignore
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

let frame = 0;
let animationFrameId = 0;
const animationFrameIds = [];

export type PosenetConfigType = {
  arch: "MobileNetV1" | "ResNet50";
  skipSize: number;
  confidence: number;
  quantBytes?: PoseNetQuantBytes;
};

export const machineConfig: { [index: string]: PosenetConfigType } = {
  slow: {
    arch: "MobileNetV1",
    skipSize: 5,
    confidence: 0.5,
  },
  decent: {
    arch: "MobileNetV1",
    skipSize: 2,
    confidence: 0.7,
  },
  fast: {
    arch: "ResNet50",
    skipSize: 5,
    confidence: 0.9,
    quantBytes: 2,
  },
  beast: {
    arch: "ResNet50",
    skipSize: 2,
    confidence: 0.9,
    quantBytes: 2,
  },
};

// TODO: Separate init model from start / stop tracking: Atom state with initmodel and active tracking flags. Store Posenet in recoild state?
export const initModel = async (machineType: MachineType, ratio: number) => {
  const config = machineConfig[machineType];
  let net: posenet.PoseNet;

  if (config.arch === "MobileNetV1") {
    // Faster model / less accurate
    net = await posenet.load({
      architecture: config.arch,
      inputResolution: { width: 320, height: 320 / ratio },
      outputStride: 16,
    });
  } else {
    // Better accuracy model / slower to load
    // inputResolution changes the image size before sending it to the model, making it faster
    net = await posenet.load({
      architecture: config.arch,
      outputStride: 32,
      inputResolution: { width: 320, height: 320 / ratio },
      quantBytes: config.quantBytes,
    });
  }

  return net;
};

export async function initBodyTracking(
  machineType: MachineType,
  net: posenet.PoseNet,
  video: HTMLVideoElement,
  setKeypoints: (kps: Keypoints) => void
) {
  const config = machineConfig[machineType];
  detectPoseInRealTime(video, net, config, setKeypoints);
}

export async function stopBodyTracking() {
  console.log("canceled animationFrameId", animationFrameId);
  cancelAnimationFrame(animationFrameId);

  // cancelAnimationFrame(animationFrameId + 1);
  return;
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
    video: { facingMode: "user" },
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
  console.log("executing anumationFrame", animationFrameId);
  // % executes the calculation every `skipSize` number of frames
  if (frame % config.skipSize === 0) {
    const poses = await net.estimateMultiplePoses(video, {
      flipHorizontal: flipPoseHorizontal,
      // scoreThreshold: 0.7
    });
    frame = 0; // Reset to avoid huge number over time

    // console.log({ poses });
    // TODO: Filter out ones we don't need. Why does it break?
    // const filteredKeypoints = pose.keypoints.filter(
    //   (k) => filteredBodyKey[k.part]
    // );

    setKeypoints(poses[0].keypoints);
  }

  frame++;

  // TODO:
  animationFrameId = requestAnimationFrame(
    async () =>
      await poseDetectionFrame(
        video,
        net,
        flipPoseHorizontal,
        config,
        setKeypoints
      )
  );
  console.log("new animationFrameId", animationFrameId);
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
