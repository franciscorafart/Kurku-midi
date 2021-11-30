const color = 'red';
const lineWidth = 2;

const toTuple = ({x, y}) => [y, x];

function drawPoint(ctx, y, x, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
    ctx.beginPath();
    ctx.moveTo(ax * scale, ay * scale);
    ctx.lineTo(bx * scale, by * scale);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
}

export function drawSkeleton(keypoints, minConfidence, ctx, scale = 1){
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
        keypoints,
        minConfidence,
    );

    adjacentKeyPoints.forEach(keypoints => {
        drawSegment(
            toTuple(keypoints[0].position),
            toTuple(keypoints[1].position),
            color,
            scale,
            ctx,
        );
    });
}

export function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
    for (let i = 0; i < keypoints.length; i++) {
        const keypoint = keypoints[i];

        if (keypoint.score < minConfidence) {
            continue;
        }

        const {x, y} = keypoint.position;
        drawPoint(ctx, y * scale, x * scale, 3, color);
    }
}

export const getBodyParts = (keypoints, minPoseConfidence, videoHeight, videoWidth) =>
    keypoints.reduce(
        (acc, k) => ({
            ...acc,
            [k.part]: translatePosition(k, minPoseConfidence, videoHeight, videoWidth)
        }),
    {});

const translatePosition = (bodyPart, minPoseConfidence, videoHeight, videoWidth) => {
    if (bodyPart && bodyPart.score > 0.5) {
        return [Math.abs(bodyPart.position.x / videoWidth), Math.abs((bodyPart.position.y / videoHeight - 1))]
    }

    return [undefined, undefined];
}