import { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { initAudio, initMicAudio } from "utils/audioCtx";
import AudioFXPanel from "./AudioFXPanel";
import BodyTrackingPanel from "./BodyTrackingPanel";
import {
  initBodyTracking,
  machineConfig,
  setupCamera
} from "utils/bodytracking";
import { useRecoilValue, useSetRecoilState } from "recoil";
import keypoints from "atoms/keypoints";
import sessionConfig from "atoms/sessionConfig";
import {
  drawKeypoints,
  drawSkeleton,
  getBodyParts,
  resetCanvas
} from "utils/utils";
import { mapGlobalConfigsToSound } from "utils/audioUtils";
import { KeyedEffectType } from "utils/types";

const videoWidth = window.innerWidth;
const videoHeight = window.innerHeight;

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

function VideoCanvas({
  canvasRef,
  videoRef
}: {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
}) {
  const kpValues = useRecoilValue(keypoints);
  const video = videoRef.current;
  const canvas = canvasRef.current;

  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  const ctx: CanvasRenderingContext2D | null = canvas?.getContext("2d") || null;
  const config = machineConfig["fast"]; // TODO: This should come from the global state

  useEffect(() => {
    if (ctx && video) {
      resetCanvas(ctx, video);
      drawKeypoints(kpValues, config.confidence, ctx);
      drawSkeleton(kpValues, config.confidence, ctx);
    }
  }, [kpValues, ctx, video, config.confidence]);

  return (
    <div>
      <Video ref={videoRef} />
      <Canvas ref={canvasRef} />
    </div>
  );
}

function UIAudioBridge({
  audioCtx,
  audioFXs
}: {
  audioCtx: AudioContext;
  audioFXs: KeyedEffectType;
}) {
  const kpValues = useRecoilValue(keypoints);
  const sessionCfg = useRecoilValue(sessionConfig);

  const config = machineConfig["fast"]; // TODO: This should come from the global state

  useEffect(() => {
    const bodyPartPositions = getBodyParts(
      kpValues,
      config.confidence,
      videoHeight,
      videoWidth
    );

    //TODO: pass only skip size from config and deal with FX with ref
    mapGlobalConfigsToSound(sessionCfg, bodyPartPositions, audioCtx, audioFXs);
  }, [kpValues, sessionCfg, audioCtx, audioFXs, config.confidence]);

  return <div></div>;
}

function SomaUI() {
  const setKeypoints = useSetRecoilState(keypoints);
  const sessionCfg = useRecoilValue(sessionConfig);

  const audioFXs = useRef<KeyedEffectType>({}); // keyed store of audio nodes
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [audioCtx, setAudioCtx] = useState<AudioContext | undefined>(undefined);

  const initAudioSource = async (source: "audio" | "mic") => {
    const audioCtx =
      source === "audio"
        ? await initAudio(sessionCfg, audioFXs.current)
        : await initMicAudio(sessionCfg, audioFXs.current);

    setAudioCtx(audioCtx);
  };

  const initTracking = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      await setupCamera(video);

      video.play();
      video.hidden = true;

      initBodyTracking("fast", video, setKeypoints);
    }
  };

  const initAll = async (source: "audio" | "mic") => {
    await initTracking();
    await initAudioSource(source);
  };

  return (
    <Container>
      <BodyTrackingContainer>
        <button onClick={() => initAll("audio")}>Start audio</button>
        <button onClick={() => initAll("mic")}>Start mic</button>
        <VideoCanvas canvasRef={canvasRef} videoRef={videoRef} />
        <BodyTrackingPanel />
        {audioCtx && (
          <UIAudioBridge audioCtx={audioCtx} audioFXs={audioFXs.current} />
        )}
      </BodyTrackingContainer>
      <AudioFXPanel />
    </Container>
  );
}

export default SomaUI;
