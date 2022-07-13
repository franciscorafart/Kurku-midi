import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import { drawKeypoints, drawSkeleton, resetCanvas } from "utils/utils";
import { isEmpty } from "lodash";
import { machineConfig } from "utils/bodytracking";
import keypoints from "atoms/keypoints";
import sessionConfig from "atoms/sessionConfig";
import theme from "config/theme";

const VideoCanvasContainer = styled.div`
  display: flex;
  justify-content: center;
  min-height: 500px;
  padding: 20px;
  border: 1px solid ${theme.background2};
`;

const Video = styled.video``;
const Canvas = styled.canvas``;

function VideoCanvas({
  canvasRef,
  videoRef,
}: {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
}) {
  const kpValues = useRecoilValue(keypoints);
  const sessionCfg = useRecoilValue(sessionConfig);
  const video = videoRef.current;
  const canvas = canvasRef.current;
  const ctx: CanvasRenderingContext2D | null = canvas?.getContext("2d") || null;
  const config = machineConfig[sessionCfg.machineType];

  useEffect(() => {
    if (ctx && video && !isEmpty(kpValues)) {
      resetCanvas(ctx, video);
      drawKeypoints(kpValues, config.confidence, ctx);
      drawSkeleton(kpValues, config.confidence, ctx);
    }
  }, [kpValues, ctx, video, config.confidence]);

  return (
    <VideoCanvasContainer>
      <Video ref={videoRef} />
      <Canvas ref={canvasRef} />
    </VideoCanvasContainer>
  );
}

export default VideoCanvas;
