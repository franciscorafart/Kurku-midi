import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import MidiCC from "./MidiCC";
import MidiNotes from "./MidiNotes";
import {
  initBodyTracking,
  initModel,
  setupCamera,
  stopBodyTracking,
} from "utils/bodytracking";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import keypoints from "atoms/keypoints";
import accountInState from "atoms/account";
import BodyTrackingMidiPanel from "./BodyTrackingMidiPanel";
import theme from "config/theme";
import ConfigMidiBridge from "./ConfigMidiBridge";
import VideoCanvas from "./VideoCanvas";
import HowToUse from "./HowToUse";
import Header from "components/Header";
import { initEffects, initMidiNotes, initSessions } from "localDB";
import initializedADI from "atoms/initializedADI";
import storedSessions from "atoms/storedSessions";
import storedMidiNotes from "atoms/storedMidiNotes";
import storedEffects from "atoms/storedEffects";
import sessionConfig from "atoms/sessionConfig";
import GlobalMidi from "./GobalMIDI";
import MidiNotePanel from "./MidiNotePanel";
import AdCommponent from "./AdComponent";
import trackingStatus from "atoms/status";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
  padding: 20px;
  gap: 20px;
  background-color: ${theme.background};
`;

const VideoContentContainer = styled.div`
  flex: 5;
`;

const HContainer = styled.div`
  display: flex;
  gap: 20px;
`;

function SomaUI() {
  const setKeypoints = useSetRecoilState(keypoints);
  const setSessions = useSetRecoilState(storedSessions);
  const setEffects = useSetRecoilState(storedEffects);
  const setMidiNotes = useSetRecoilState(storedMidiNotes);
  const [status, setStatus] = useRecoilState(trackingStatus);
  const sessionCfg = useRecoilValue(sessionConfig);
  const isInitialized = useRecoilValue(initializedADI);
  const userAccount = useRecoilValue(accountInState);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [videoDim, setVideoDim] = useState({ height: 0, width: 0 });

  const [showModal, setShowModal] = useState(false);

  const connected = useMemo(
    () => Boolean(userAccount.userId),
    [userAccount.userId]
  );

  useEffect(() => {
    const populateSessions = async () => {
      const cachedSessions = await initSessions();
      const cachedEffects = await initEffects();
      const cachedMidiNotes = await initMidiNotes();

      setSessions(cachedSessions);
      setEffects(cachedEffects);
      setMidiNotes(cachedMidiNotes);
    };
    if (connected && isInitialized) {
      populateSessions();
    }
  }, [setEffects, setSessions, connected, isInitialized, setMidiNotes]);

  const initTracking = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      await setupCamera(video);
      setStatus({ modelLoaded: null, tracking: false, loading: true });

      video.play();
      video.hidden = true;
      // NOTE: Set video and Canvas size from ratio of video src
      const ratio = video.videoWidth / video.videoHeight;
      const width = 560;
      const height = Math.floor(width / ratio);

      video.setAttribute("height", String(height));
      video.setAttribute("width", String(width));

      canvas.width = width;
      canvas.height = height;

      setVideoDim({ height: video.height, width: video.width });

      const net = await initModel(sessionCfg.machineType, ratio);

      await initBodyTracking(sessionCfg.machineType, net, video, setKeypoints);
      setStatus({ modelLoaded: net, tracking: true, loading: false });
    }
  }, [sessionCfg.machineType, setKeypoints, setStatus]);

  const resumeBodyTracking = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && status.modelLoaded && !status.tracking) {
      await initBodyTracking(
        sessionCfg.machineType,
        status.modelLoaded,
        video,
        setKeypoints
      );
      setStatus({ ...status, tracking: true });
    }
  }, [sessionCfg.machineType, setKeypoints, setStatus, status]);

  const pauseBodyTracking = useCallback(async () => {
    setStatus({ ...status, tracking: false });
    stopBodyTracking();
  }, [setStatus, status]);

  return (
    <>
      <Header howToUseModal={() => setShowModal(true)} />
      <Container>
        <AdCommponent />
        <HContainer>
          <ConfigMidiBridge
            onInit={initTracking}
            onResume={resumeBodyTracking}
            onPause={pauseBodyTracking}
            videoHeight={videoDim.height || 0}
            videoWidth={videoDim.width || 0}
          />
          <VideoContentContainer>
            <VideoCanvas canvasRef={canvasRef} videoRef={videoRef} />
          </VideoContentContainer>
          <GlobalMidi />
        </HContainer>
        <HContainer>
          <MidiCC />
          <MidiNotes />
        </HContainer>
        <BodyTrackingMidiPanel />
        <MidiNotePanel />
        <HowToUse open={showModal} onClose={() => setShowModal(false)} />
      </Container>
    </>
  );
}

export default SomaUI;
