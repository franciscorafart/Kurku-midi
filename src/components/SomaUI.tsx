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
import WhatIsKurku from "./WhatIsKurku";
import webcam from "assets/webcam-placeholder.png";
// import ConfigAudioBridge from "./ConfigAudioBridge";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px 80px;
  min-height: 600px;
  background-color: ${theme.background};
`;

const VideoAndConfig = styled.div`
  display: flex;
  flex-direction: column;
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

const ImagePlaceholder = styled.div`
  display: flex;
  justify-content: center;
  padding: 60px 0;
`;

const Img = styled.img`
  width: 200px;
  height: auto;
`;

function SomaUI() {
  const setKeypoints = useSetRecoilState(keypoints);
  // const audioFXs = useRef<KeyedEffectType>({}); // keyed store of audio nodes
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // const [audioCtx, setAudioCtx] = useState<AudioContext | undefined>(undefined);
  const [mode, setMode] = useState<"audio" | "midi" | undefined>("midi");
  const [videoDim, setVideoDim] = useState({ height: 0, width: 0 });
  const [idle, setIdle] = useState(true);

  // const initAudioSource = async (source: "audio" | "mic") => {
  //   const audioCtx =
  //     source === "audio"
  //       ? await initAudio(sessionCfg, audioFXs.current)
  //       : await initMicAudio(sessionCfg, audioFXs.current);

  //   setAudioCtx(audioCtx);
  // };

  const [showModal, setShowModal] = useState(false);
  const [showKurkuModal, setShowKurkuModal] = useState(false);

  const initTracking = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      await setupCamera(video);
      setIdle(false);
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

      setVideoDim({ height: video.height, width: video.width });
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
        <Title>Kurku</Title>
        <SubTitle>Body tracking web MIDI controller</SubTitle>
        <SubTitle2>Beta version 0.1</SubTitle2>
        <SubTitle2 onClick={() => setShowKurkuModal(true)}>
          <ClickSpan>What is Kurku?</ClickSpan>
        </SubTitle2>
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
            videoHeight={videoDim.height || 0}
            videoWidth={videoDim.width || 0}
          />
        )}

        {idle && (
          <ImagePlaceholder>
            <Img alt="webcam" src={webcam} />
          </ImagePlaceholder>
        )}
        <VideoCanvas canvasRef={canvasRef} videoRef={videoRef} />

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
      <WhatIsKurku
        open={showKurkuModal}
        onClose={() => setShowKurkuModal(false)}
      />
    </Container>
  );
}

export default SomaUI;
