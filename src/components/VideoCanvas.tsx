import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import {
  drawKeypoints,
  drawHandKeypoints,
  drawSkeleton,
  resetCanvas,
} from "utils/utils";
import { isEmpty } from "lodash";
import { machineConfig } from "utils/bodytracking";
import keypoints from "atoms/keypoints";
import handKeypoints from "atoms/handKeypoints";
import sessionConfig from "atoms/sessionConfig";

const VideoCanvasContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 8px;
`;

const Video = styled.video`
  display: none;
`;
const Canvas = styled.canvas`
  min-height: 380px;
  border: 1px dashed black;
`;

function VideoCanvas({
  canvasRef,
  videoRef,
}: {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
}) {
  const kpValues = useRecoilValue(keypoints);
  const handKpValues = useRecoilValue(handKeypoints);
  const sessionCfg = useRecoilValue(sessionConfig);
  const video = videoRef.current;
  const canvas = canvasRef.current;
  const ctx: CanvasRenderingContext2D | null = canvas?.getContext("2d") || null;
  const config = machineConfig[sessionCfg.machineType];

  useEffect(() => {
    if (ctx && video) {
      resetCanvas(ctx, video);

      if (!isEmpty(kpValues)) {
        drawKeypoints(kpValues, config.confidence, ctx);
        drawSkeleton(kpValues, config.confidence, ctx);
      }
      if (!isEmpty(handKpValues)) {
        drawHandKeypoints(handKpValues.Left["2d"], config.confidence, ctx);
        drawHandKeypoints(handKpValues.Right["2d"], config.confidence, ctx);
      }
    }
  }, [handKpValues, kpValues, ctx, video, config.confidence]);

  return (
    <VideoCanvasContainer>
      <Video ref={videoRef} />
      <Canvas ref={canvasRef} />
    </VideoCanvasContainer>
  );
}

export default VideoCanvas;
