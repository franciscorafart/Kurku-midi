import * as posenet from "@tensorflow-models/posenet";
import { Keypoints } from "config/shared";
import { BodyPartPositionType } from 'config/shared';

const color = "green";
const lineWidth = 2;

type Tuple = [number, number];

const toTuple = ({ x, y }: { x: number; y: number }): Tuple => [y, x];

function drawPoint(
  ctx: CanvasRenderingContext2D,
  y: number,
  x: number,
  r: number,
  color: string
): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawSegment(
  [ay, ax]: Tuple,
  [by, bx]: Tuple,
  color: string,
  scale: number,
  ctx: CanvasRenderingContext2D
): void {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
}

export function drawSkeleton(
  keypoints: Keypoints,
  minConfidence: number,
  ctx: CanvasRenderingContext2D,
  scale: number = 1
) {
  const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
    keypoints,
    minConfidence
  );

  adjacentKeyPoints.forEach((keypoints: Keypoints) => {
    drawSegment(
      toTuple(keypoints[0].position),
      toTuple(keypoints[1].position),
      color,
      scale,
      ctx
    );
  });
}

export function drawKeypoints(
  keypoints: Keypoints,
  minConfidence: number,
  ctx: CanvasRenderingContext2D,
  scale: number = 1
) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (keypoint.score < minConfidence) {
      continue;
    }

    const { x, y } = keypoint.position;
    drawPoint(ctx, y * scale, x * scale, 3, color);
  }
}

export const resetCanvas = (
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement
) => {
  ctx.clearRect(0, 0, video.height, video.width);
  ctx.save();
  ctx.scale(-1, 1);
  ctx.translate(-video.width, 0);
  ctx.drawImage(video, 0, 0, video.width, video.height);
  ctx.restore();
};

export const getBodyParts = (
  keypoints: Keypoints,
  minPoseConfidence: number,
  videoHeight: number,
  videoWidth: number
): BodyPartPositionType =>
  keypoints.reduce((acc, k) => {
    const position = translatePosition(
      k,
      minPoseConfidence,
      videoHeight,
      videoWidth,
    );

    return {
      ...acc,
      [k.part]: { x: position[0], y: position[1] }
    };
  }, {} as BodyPartPositionType);

const translatePosition = (
  keypoint: posenet.Keypoint,
  minPoseConfidence: number,
  videoHeight: number,
  videoWidth: number
): Tuple | [undefined, undefined] => {
  if (keypoint && keypoint.score > minPoseConfidence) {
    return [
      Math.abs(keypoint.position.x / videoWidth),
      Math.abs(keypoint.position.y / videoHeight - 1)
    ];
  }

  return [undefined, undefined];
};

// TODO: Unit Test
// Takes a segment (windowStart:windowEnd) of a 0 to 1 range, and scales it to go from (rangeStart:rangeEnd)
export const scaleWindowToRange = (
  windowStart: number,
  windowEnd: number,
  rangeStart: number,
  rangeEnd: number,
  v: number
): [number, number] => {
  const windowedValue = boundToValues(windowStart, windowEnd, v);
  const windowRange = Math.abs(windowEnd - windowStart);
  const scaleFactor = (1 / windowRange) * (rangeEnd - rangeStart);

  return [
    boundToValues(
      rangeStart,
      rangeEnd,
      rangeStart + (windowedValue - windowStart) * scaleFactor
    ),
    scaleFactor
  ];
};

// TODO: Problem with artifacts at limit of screen likely here
const moveTowardsPoint = (
  origin: number,
  destination: number,
  skipSize: number
): number => {
  const distance = Math.abs(destination - origin);

  if (distance <= skipSize) {
    return destination;
  }

  const sign = destination > origin ? 1 : -1;
  return origin + sign * skipSize;
};

const boundToValues = (start: number, finish: number, v: number): number => {
  if (v < start) {
    return start;
  }

  if (v > finish) {
    return finish;
  }

  return v;
};