import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  handKeypointsToDataArrayForTensor,
  handPositionToTensor,
} from "utils/tf";
import Header from "./Header";
import styled from "styled-components";
import theme from "config/theme";
import { User } from "context";
import {
  setupCamera,
  detectHandsSinglePose,
  makeTrainingHandDetector,
  DetectorType,
} from "utils/bodytracking";
import { Button } from "react-bootstrap";
import { image, div, browser } from "@tensorflow/tfjs";
import { HandPositionObject, HandType } from "config/shared";

const Container = styled.div`
  height: 100vh;
`;

const TrainContainer = styled.div`
  display: flex;
  background-color: ${theme.background};
`;

const ThumbnailContainer = styled.div`
  display: flex;
  background-color: ${theme.background2};
  padding: 10px;
  gap: 2%;
  width: 25%;
  align-content: flex-start;
  flex-wrap: wrap;
  overflow-y: scroll;
  height: calc(100vh - 56px);
`;

const VideoContentContainer = styled.div`
  width: 50%;
  display: flex;
  justify-content: center;
`;

const ControlContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 25%;
  background-color: ${theme.background2};
`;

const TrainControls = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding: 10px;
  height: 62px;
  gap: 10px;
`;

const ImgContainer = styled.div`
  max-width: 48%;
  height: 190px;
  padding: 10px;
  border: 1px solid ${theme.border};
  border-radius: 8px;
`;

const Img = styled.img`
  width: 100%;
`;

const Span = styled.span`
  color: ${theme.text};
`;

const Video = styled.video`
  width: 80%;
`;
const Canvas = styled.canvas`
  display: none;
`;

const TopImageContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const XContainer = styled.div`
  height: 16px;
  width: 16px;
  background-color: ${theme.background};
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  font-size: 0.7em;
`;

function TrainUI() {
  const [showModal, setShowModal] = useState(false);
  const [showKurkuModal, setShowKurkuModal] = useState(false);

  const isPaidUser = useContext(User);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [parsedKeypoints, setParsedKeypoints] = useState<HandPositionObject[]>(
    []
  );

  const [detector, setDetector] = useState<DetectorType | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const startVideo = async () => {
      const video = videoRef.current;
      if (video) {
        await setupCamera(video);
        video.play();
      }
      // NOTE: Use machine type for training portion?
      const dtktor = await makeTrainingHandDetector("full");
      setDetector(dtktor);
    };

    startVideo();
  }, []);

  const removeImage = useCallback(
    (idx: number) => {
      const newThumbnails = [...thumbnails];
      newThumbnails.splice(idx, 1);

      const newKeypoints = [...parsedKeypoints];
      newKeypoints.splice(idx, 1);

      setThumbnails(newThumbnails);
      setParsedKeypoints(newKeypoints);
    },
    [parsedKeypoints, thumbnails]
  );

  const capture = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const ctx: CanvasRenderingContext2D | null =
      canvas?.getContext("2d") || null;
    if (video && canvas && ctx && detector) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // 1. Thumbnail visualization
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const data = canvas.toDataURL("image/png");
      setThumbnails([...thumbnails, data]);

      // 2. Hands keypoint data
      const hands = await detectHandsSinglePose(detector, video);
      const left = hands.find((h) => h?.handedness === "Left");
      const right = hands.find((h) => h?.handedness === "Right");

      const handsObject: HandPositionObject = {
        Left: [],
        Right: [],
      }; // left and right
      if (left?.keypoints3D) {
        handsObject["Left"] = handKeypointsToDataArrayForTensor(
          left.keypoints3D
        );
      }
      if (right?.keypoints3D) {
        handsObject["Right"] = handKeypointsToDataArrayForTensor(
          right.keypoints3D
        );
      }

      setParsedKeypoints([...parsedKeypoints, handsObject]);
    }
  }, [detector, parsedKeypoints, thumbnails]);

  const train = () => {
    for (const k of parsedKeypoints) {
      const kpTensor = handPositionToTensor([k.Left, k.Right]);
      kpTensor.print();
      // NOTE: NaN values in tensor if one of the hands is not present. Will this be a problem
      // when creating the model?
    }
  };

  return (
    <Container>
      <Header
        kurkuModal={() => setShowKurkuModal(true)}
        howToUseModal={() => setShowModal(true)}
      />
      <TrainContainer>
        <ThumbnailContainer>
          {thumbnails.map((th, idx) => (
            <ImgContainer key={`train-image-${th.slice(0, 5)}-${idx}}`}>
              <TopImageContainer>
                <Span>Image {idx}</Span>
                <XContainer onClick={() => removeImage(idx)}>X</XContainer>
              </TopImageContainer>
              <Img key={`image-${idx}`} src={th} alt="thumbnail" />
            </ImgContainer>
          ))}
        </ThumbnailContainer>
        <VideoContentContainer>
          <Video ref={videoRef} />
          <Canvas ref={canvasRef} />
        </VideoContentContainer>
        <ControlContainer>
          <div></div>
          <TrainControls>
            <Button disabled={!isPaidUser} onClick={capture}>
              Capture
            </Button>
            <Button onClick={train} disabled={!isPaidUser}>
              Train
            </Button>
          </TrainControls>
        </ControlContainer>
      </TrainContainer>
    </Container>
  );
}

export default TrainUI;
