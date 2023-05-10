import * as posenet from "@tensorflow-models/posenet";
import { Keypoints, HandKeypoints } from "config/shared";
import { BodyPartPositionType } from "config/shared";

const color = "green";
const handColor = "red";
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

export function drawHandKeypoints(
  keypoints: HandKeypoints,
  minConfidence: number,
  ctx: CanvasRenderingContext2D,
  scale: number = 1
) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];
    const { x, y } = keypoint;
    drawPoint(ctx, y * scale, x * scale, 2, handColor);
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
      videoWidth
    );
    return {
      ...acc,
      [k.part]: { x: position[0], y: position[1] },
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
      Math.abs(keypoint.position.y / videoHeight - 1),
    ];
  }

  return [undefined, undefined];
};

// TODO: Remove this function, not being used for anything
export const getHandParts = (handKeypoints: HandKeypoints) => {
  // metric scale, with the origin in auxiliary keypoint formed as an average between the first knuckles of index, middle, ring and pinky fingers.
  const fingerTip = handKeypoints.filter(
    (p) => p.name === "index_finger_tip"
  )[0];

  const ringFingerTip = handKeypoints.filter(
    (p) => p.name === "ring_finger_pip"
  )[0];
  // * 100 for centimeters from origin.
  if (fingerTip && ringFingerTip) {
    const { x, y } = fingerTip;
    console.log(
      "index: x",
      x * 100,
      "y",
      y * 100,
      "ring x",
      ringFingerTip.x * 100,
      "y",
      ringFingerTip.y * 100
    );
  }
  return;
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
    windowedValue,
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

export const passwordValid = (pw1: string) => pw1.length >= 8;

export const isRepeatValid = (pw1: string, pw2: string) =>
  Boolean(pw1) && pw1 === pw2;

export const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const goHome = () => {
  window.location.href = "/";
};

// Hand position data structure
// [{x: -0.048322901129722595, y: 0.07273854315280914, z: 0.01486968994140625, name: 'wrist'},
// {x: -0.01267671212553978, y: 0.07119046151638031, z: 0.0032558441162109375, name: 'thumb_cmc'},
// {x: 0.018702559173107147, y: 0.06250479817390442, z: -0.007114410400390625, name: 'thumb_mcp'},
// {x: 0.046741388738155365, y: 0.047045137733221054, z: -0.01568603515625, name: 'thumb_ip'},
// {x: 0.06838750839233398, y: 0.031775377690792084, z: -0.0172882080078125, name: 'thumb_tip'},
// {x: 0.024450086057186127, y: 0.012492155656218529, z: 0.0032711029052734375, name: 'index_finger_mcp'},
// {x: 0.04752703011035919, y: -0.0052698757499456406, z: -0.00615692138671875, name: 'index_finger_pip'},
// {x: 0.0622435063123703, y: -0.018781479448080063, z: -0.01522064208984375, name: 'index_finger_dip'},
// {x: 0.07123430073261261, y: -0.03018733486533165, z: -0.0423583984375, name: 'index_finger_tip'},
// {x: 0.0039240531623363495, y: -0.0033406794536858797, z: 0.005870819091796875, name: 'middle_finger_mcp'},
// {x: 0.028399135917425156, y: -0.035430632531642914, z: -0.006359100341796875, name: 'middle_finger_pip'},
// {x: 0.04041396826505661, y: -0.0516623891890049, z: -0.0220184326171875, name: 'middle_finger_dip'},
// {x: 0.056379035115242004, y: -0.06966200470924377, z: -0.042755126953125, name: 'middle_finger_tip'},
// {x: -0.016108648851513863, y: -0.01143411174416542, z: -0.00276947021484375, name: 'ring_finger_mcp'},
// {x: -0.000886840745806694, y: -0.03763489052653313, z: -0.01416015625, name: 'ring_finger_pip'},
// {x: 0.01084420457482338, y: -0.055163294076919556, z: -0.0289306640625, name: 'ring_finger_dip'},
// {x: 0.021640939638018608, y: -0.06796975433826447, z: -0.0496826171875, name: 'ring_finger_tip'},
// {x: -0.040806546807289124, y: -0.007021280005574226, z: -0.00814056396484375, name: 'pinky_finger_mcp'},
// {x: -0.03502532094717026, y: -0.029139254242181778, z: -0.01103973388671875, name: 'pinky_finger_pip'},
// {x: -0.03257390484213829, y: -0.05039885640144348, z: -0.01995849609375, name: 'pinky_finger_dip'},
// {x: -0.026762252673506737, y: -0.06428325921297073, z: -0.03021240234375, name: 'pinky_finger_tip'}]
