import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import MidiFXPanel from "./MidiFXPanel";
import { initBodyTracking, setupCamera } from "utils/bodytracking";
import { useRecoilValue, useSetRecoilState } from "recoil";
import keypoints from "atoms/keypoints";
import accountInState from "atoms/account";
import BodyTrackingMidiPanel from "./BodyTrackingMidiPanel";
import theme from "config/theme";
import ConfigMidiBridge from "./ConfigMidiBridge";
import VideoCanvas from "./VideoCanvas";
import HowToUse from "./HowToUse";
import WhatIsKurku from "./WhatIsKurku";
import Header from "components/Header";
import { Text, SubTitle } from "./shared";
import ADI, { initEffects, initSessions } from "localDB";

import storedSessions from "atoms/storedSessions";
import storedEffects from "atoms/storedEffects";
import sessionConfig from "atoms/sessionConfig";

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
  color: ${theme.text2};
`;

function SomaUI() {
  const setKeypoints = useSetRecoilState(keypoints);
  const setSessions = useSetRecoilState(storedSessions);
  const setEffects = useSetRecoilState(storedEffects);
  const sessionCfg = useRecoilValue(sessionConfig);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [videoDim, setVideoDim] = useState({ height: 0, width: 0 });

  const [showModal, setShowModal] = useState(false);
  const [showKurkuModal, setShowKurkuModal] = useState(false);
  const userAccount = useRecoilValue(accountInState);

  const isInitialized = ADI.isInitialized();
  const connected = useMemo(
    () => Boolean(userAccount.userId),
    [userAccount.userId]
  );

  useEffect(() => {
    const populateSessions = async () => {
      const cachedSessions = await initSessions();
      const cachedEffects = await initEffects();
      setSessions(cachedSessions);
      setEffects(cachedEffects);
    };
    if (connected && isInitialized) {
      populateSessions();
    }
  }, [setEffects, setSessions, connected, isInitialized]);

  const initTracking = useCallback(async () => {
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
      initBodyTracking(sessionCfg.machineType, video, setKeypoints, ratio);
    }
  }, [sessionCfg.machineType, setKeypoints]);

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
