import { useRef, useState } from "react";
import styled from "styled-components";
// import { initAudio, initMicAudio } from "utils/audioCtx";
// import AudioFXPanel from "./AudioFXPanel";
import MidiFXPanel from "./MidiFXPanel";
// import BodyTrackingPanel from "./BodyTrackingPanel";
import { initBodyTracking, setupCamera } from "utils/bodytracking";
import { useSetRecoilState } from "recoil";
import keypoints from "atoms/keypoints";
import BodyTrackingMidiPanel from "./BodyTrackingMidiPanel";
// import { Button, ButtonGroup } from "react-bootstrap";
import theme from "config/theme";
import { Title, SubTitle, SubTitle2 } from "./shared";
import ConfigMidiBridge from "./ConfigMidiBridge";
import VideoCanvas from "./VideoCanvas";
import HowToUse from "./HowToUse";
// import ConfigAudioBridge from "./ConfigAudioBridge";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px 80px;
  min-height: 1000px;
  background-color: ${theme.background};
`;

// const Buttons = styled.div`
//   display: flex;
//   justify-content: center;
//   gap: 10px;
// `;

const VideoAndConfig = styled.div`
  display: flex;
  border: 1px solid ${theme.background2};
  border-radius: 10px 10px 0 0;
`;

const TitlesContainer = styled.div`
  padding-bottom: 30px;
`;

const ClickSpan = styled.span`
  cursor: pointer;
  color: ${theme.text2};
`;

function SomaUI() {
  const setKeypoints = useSetRecoilState(keypoints);
  // const audioFXs = useRef<KeyedEffectType>({}); // keyed store of audio nodes
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // const [audioCtx, setAudioCtx] = useState<AudioContext | undefined>(undefined);
  const [mode, setMode] = useState<"audio" | "midi" | undefined>("midi");

  // const initAudioSource = async (source: "audio" | "mic") => {
  //   const audioCtx =
  //     source === "audio"
  //       ? await initAudio(sessionCfg, audioFXs.current)
  //       : await initMicAudio(sessionCfg, audioFXs.current);

  //   setAudioCtx(audioCtx);
  // };

  const [showModal, setShowModal] = useState(false);

  const initTracking = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      await setupCamera(video);

      video.play();
      video.hidden = true;

      // NOTE: Set video and Canvas size from ratio of video src
      const ratio = video.videoWidth / video.videoHeight;
      const width = 720;
      const height = Math.floor(width / ratio);

      video.setAttribute("height", String(height));
      video.setAttribute("width", String(width));

      canvas.width = width;
      canvas.height = height;

      initBodyTracking("fast", video, setKeypoints, ratio);
    }
  };

  // const initAll = async (source: "audio" | "mic") => {
  //   await initTracking();
  //   await initAudioSource(source);
  //   setMode("audio");
  // };

  return (
    <Container>
      <TitlesContainer>
        <Title>Soma</Title>
        <SubTitle>Body tracking web MIDI controller</SubTitle>
        <SubTitle2 onClick={() => setShowModal(true)}>
          <ClickSpan>How to use?</ClickSpan>
        </SubTitle2>
      </TitlesContainer>
      {/* <Buttons>
        <ButtonGroup>
          <Button disabled onClick={() => setMode("audio")}>
            Audio mode
          </Button>
          <Button onClick={() => setMode("midi")}>MIDI mode</Button>
        </ButtonGroup>
      </Buttons> */}
      <VideoAndConfig>
        {mode === "midi" && (
          <ConfigMidiBridge
            onInit={initTracking}
            videoHeight={videoRef.current?.height || 0}
            videoWidth={videoRef.current?.width || 0}
          />
        )}
        {mode && <VideoCanvas canvasRef={canvasRef} videoRef={videoRef} />}
        {/* {mode === "audio" && <AudioFXPanel audioFXs={audioFXs.current} />} */}
        {/* {audioCtx && mode === "audio" && (
          <ConfigAudioBridge
          audioCtx={audioCtx}
          audioFXs={audioFXs.current}
          videoHeight={videoRef.current?.height || 0}
          videoWidth={videoRef.current?.width || 0}
          />
        )} */}
      </VideoAndConfig>
      {mode === "midi" && <MidiFXPanel />}
      {/* {mode === "audio" && <BodyTrackingPanel />} */}
      {mode === "midi" && <BodyTrackingMidiPanel />}
      <HowToUse open={showModal} onClose={() => setShowModal(false)} />
    </Container>
  );
}

export default SomaUI;
