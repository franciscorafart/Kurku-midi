import { mapGlobalConfigsToSound } from "./audioUtils";
import { drawKeypoints, drawSkeleton, getBodyParts} from "./utils";
import * as posenet from "@tensorflow-models/posenet";
import "@tensorflow/tfjs";
import { MachineType, SessionConfigType } from "./configUtils";
import { PoseNetQuantBytes } from "@tensorflow-models/posenet/dist/types";

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

const machineConfig: { [index: string]: PosenetConfigType } = {
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
  sessionConfig: SessionConfigType,
  audioCtx: AudioContext,
  machineType: MachineType,
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement
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

  detectPoseInRealTime(video, net, sessionConfig, audioCtx, config, canvas);
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

const resetCanvas = (
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement
) => {
  ctx.clearRect(0, 0, videoWidth, videoHeight);
  ctx.save();
  ctx.scale(-1, 1);
  ctx.translate(-videoWidth, 0);
  ctx.drawImage(video, 0, 0, window.innerWidth, window.innerHeight);
  ctx.restore();
};

async function poseDetectionFrame(
  video: HTMLVideoElement,
  net: posenet.PoseNet,
  ctx: CanvasRenderingContext2D,
  sessionConfig: SessionConfigType,
  audioCtx: AudioContext,
  flipPoseHorizontal: boolean,
  config: PosenetConfigType
) {
  // TODO: Tune this.
  // % executes the calculation every `skipSize` number of frames
  if (frame % config.skipSize === 0) {
    const poses = await net.estimateMultiplePoses(video, {
      // TODO: Change to 1 pose while only one input
      flipHorizontal: flipPoseHorizontal,
      scoreThreshold: 0.7
    });

    resetCanvas(ctx, video);

    for (const pose of poses) {
      const bodyPartPositions = getBodyParts(
        pose.keypoints,
        config.confidence,
        videoHeight,
        videoWidth
      );

      // Draw tracking figure TODO: Remove when application finished
      drawKeypoints(pose.keypoints, config.confidence, ctx);
      drawSkeleton(pose.keypoints, config.confidence, ctx);

      // TODO: Set visuals.

      mapGlobalConfigsToSound(sessionConfig, bodyPartPositions, audioCtx);
    }
  }

  frame++;

  requestAnimationFrame(() =>
    poseDetectionFrame(
      video,
      net,
      ctx,
      sessionConfig,
      audioCtx,
      flipPoseHorizontal,
      config
    )
  );
}

function detectPoseInRealTime(
  video: HTMLVideoElement,
  net: posenet.PoseNet,
  sessionConfig: SessionConfigType,
  audioCtx: AudioContext,
  config: PosenetConfigType,
  canvas: HTMLCanvasElement
) {
  const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");

  const flipPoseHorizontal = true;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (ctx) {
    // Draw video pixels on canvas, draw keypoints, and set audio state
    poseDetectionFrame(
      video,
      net,
      ctx,
      sessionConfig,
      audioCtx,
      flipPoseHorizontal,
      config
    );
  }
}
