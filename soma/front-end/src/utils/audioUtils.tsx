import { effectKeyType, SessionConfigType } from "./configUtils";

const setEffectValue = (
  effectKey: effectKeyType,
  node: any,
  currentTime: number,
  value: number
) => {
  if (effectKey === "gain") {
    node.gain.setValueAtTime(value, currentTime);
  } else if (effectKey === "pan") {
    node.pan.setValueAtTime(value, currentTime);
  } else if (effectKey === "distortion") {
    node.curve = makeDistortionCurve(value * 200);
    node.oversample = "4x";
  } else if (effectKey === "bitcrusher") {
    const bitSizeParam = node.parameters.get("bitSize");
    bitSizeParam.setValueAtTime(
      Math.max(4, Math.ceil(value * 16)),
      currentTime
    );
  } else if (effectKey === "hpf") {
    node.frequency.setValueAtTime(value, currentTime);
  } else if (effectKey === "delay") {
    node.delayTime.setValueAtTime(value, currentTime);
  } else if (effectKey === "reverb") {
    node.setValueAtTime(value, currentTime);
  }
};

export const mapGlobalConfigsToSound = (
  sessionConfig: SessionConfigType,
  bodyPartPositions: any, // TODO: create body part positions type
  audioCtx: BaseAudioContext
) => {
  for (const effect of sessionConfig.effects) {
    const bodyPart = effect.bodyPart;

    const position = bodyPartPositions[bodyPart][effect.direction];

    const node = effect.node;

    const screenRange = effect.screenRange;
    const valueRange = effect.valueRange;

    if (node) {
      if (position !== undefined) {
        const [scaledValue, scaleFactor] = scaleWindowToRange(
          screenRange.a,
          screenRange.b,
          valueRange.x,
          valueRange.y,
          position
        );
        effect.targetValue = scaledValue;
        effect.scaleFactor = scaleFactor;
      }

      const nextValue = moveTowardsPoint(
        effect.previousValue,
        effect.targetValue,
        sessionConfig.skipSize * effect.scaleFactor
      );

      setEffectValue(effect.key, node, audioCtx.currentTime, nextValue);
      effect.previousValue = nextValue;
    }
  }
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

// TODO: Test
// Takes a segment (windowStart:windowEnd) of a 0 to 1 range, and scales it to go from (rangeStart:rangeEnd)
const scaleWindowToRange = (
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

function makeDistortionCurve(amount: number): Float32Array {
  var k = typeof amount === "number" ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for (; i < n_samples; ++i) {
    x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }

  return curve;
}
