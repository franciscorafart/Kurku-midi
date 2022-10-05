import { useRef, useState } from "react";
import styled from "styled-components";
import MidiFXPanel from "./MidiFXPanel";
import { initBodyTracking, setupCamera } from "utils/bodytracking";
import { useSetRecoilState } from "recoil";
import keypoints from "atoms/keypoints";
import BodyTrackingMidiPanel from "./BodyTrackingMidiPanel";
import theme from "config/theme";
import ConfigMidiBridge from "./ConfigMidiBridge";
import VideoCanvas from "./VideoCanvas";
import HowToUse from "./HowToUse";
import WhatIsKurku from "./WhatIsKurku";
import Header from "components/Header";
import { Text, SubTitle } from "./shared";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 600px;
  background-color: ${theme.background};
`;

const TextContainer = styled.div`
  display: flex;
  justify-items: flex-start;
`;

const VideoContentContainer = styled.div`
  padding: 20px;
`;

const StyledText = styled(Text)`
  color: ${theme.text};
`;

function SomaUI() {
  const setKeypoints = useSetRecoilState(keypoints);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [videoDim, setVideoDim] = useState({ height: 0, width: 0 });

  const [showModal, setShowModal] = useState(false);
  const [showKurkuModal, setShowKurkuModal] = useState(false);

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

      setVideoDim({ height: video.height, width: video.width });
      initBodyTracking("fast", video, setKeypoints, ratio);
    }
  };

  return (
    <>
      <Header
        kurkuModal={() => setShowKurkuModal(true)}
        howToUseModal={() => setShowModal(true)}
      />
      <Container>
        <ConfigMidiBridge
          onInit={initTracking}
          videoHeight={videoDim.height || 0}
          videoWidth={videoDim.width || 0}
        />
        <VideoContentContainer>
          <TextContainer>
            <SubTitle>
              <StyledText>Webcam view</StyledText>
            </SubTitle>
          </TextContainer>
          <VideoCanvas canvasRef={canvasRef} videoRef={videoRef} />
        </VideoContentContainer>
        <MidiFXPanel />
        <BodyTrackingMidiPanel />
        <HowToUse open={showModal} onClose={() => setShowModal(false)} />
        <WhatIsKurku
          open={showKurkuModal}
          onClose={() => setShowKurkuModal(false)}
        />
      </Container>
    </>
  );
}

export default SomaUI;
