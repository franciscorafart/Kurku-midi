import { tensor } from "@tensorflow/tfjs";
import { ArrayOfNumArrayType, HandKeypoints } from "config/shared";

export const handPositionToTensor = (
  handPositionArray: ArrayOfNumArrayType[] // Left and right
) => {
  // [ [[x1,x2,x3], [y1, y2, y3], [z1, z2, z3]], [[x1,x2,x3], [y1, y2, y3], [z1, z2, z3]] ]

  const tensorData = tensor(handPositionArray);

  // Transpose the tensor to have each row represent a point
  const pointsTensor = tensorData.transpose();
  return pointsTensor;
};

export const handKeypointsToDataArrayForTensor = (keypoints: HandKeypoints) => {
  // First, create separate arrays for each dimension
  const x = [];
  const y = [];
  const z = [];
  for (const keypoint of keypoints) {
    if (
      keypoint.x !== undefined &&
      keypoint.y !== undefined &&
      keypoint.z !== undefined
    ) {
      x.push(keypoint.x);
      y.push(keypoint.y);
      z.push(keypoint.z);
    }
  }

  // Concatenate the arrays into a single 2D array
  return [x, y, z];
};
