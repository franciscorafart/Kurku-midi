import { useRef } from "react";
import styled from "styled-components";
import { initAudio, initMicAudio } from "utils/audioCtx";
import { sessionConfig } from "utils/configUtils";
import AudioFXPanel from "./AudioFXPanel";
import BodyTrackingPanel from "./BodyTrackingPanel";
import { initBodyTracking, setupCamera } from "utils/bodytracking";

const Container = styled.div`
  width: 100%;
  height: 700px;
  display: flex;
`;

const BodyTrackingContainer = styled.div`
  width: 75%;
  display: flex;
  flex-direction: column;
`;

const Video = styled.video``;
const Canvas = styled.canvas``;

function SomaUI() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const initAll = async (source: "audio" | "mic") => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const audioCtx =
        source === "audio"
          ? await initAudio(sessionConfig)
          : await initMicAudio(sessionConfig);
      await setupCamera(video);

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      video.play();
      video.hidden = true;

      initBodyTracking(sessionConfig, audioCtx, "fast", canvas, video);
    }
  };

  return (
    <Container>
      <BodyTrackingContainer>
        <button onClick={() => initAll("audio")}>Start audio</button>
        <button onClick={() => initAll("mic")}>Start mic</button>
        <Video ref={videoRef} />
        <Canvas ref={canvasRef} />
        <BodyTrackingPanel />
      </BodyTrackingContainer>
      <AudioFXPanel />
    </Container>
  );
}

export default SomaUI;
