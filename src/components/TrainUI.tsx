import { useCallback, useContext, useEffect, useRef, useState } from "react";
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

      setThumbnails(newThumbnails);
    },
    [thumbnails]
  );

  const capture = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const ctx: CanvasRenderingContext2D | null =
      canvas?.getContext("2d") || null;
    if (video && canvas && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      // TODO: Do not store as thumbnails
      const data = canvas.toDataURL("image/png");
      setThumbnails([...thumbnails, data]);

      if (detector) {
        // Extract hand positions data from image
        const hands = await detectHandsSinglePose(detector, video);
        console.log("hands", hands);

        // TODO: Store keypoints instead of thumbails
      }
    }
  }, [detector, thumbnails]);

  const train = () => {
    const cv = canvasRef.current;
    if (cv) {
      const ratio = cv.width / cv.height;
      const trainingWidth = 110;
      const trainingHeigh = trainingWidth / ratio;

      // TODO: Don't train directly from the image.
      for (const th of thumbnails) {
        const img = new Image();
        img.src = th;
        const tensor = browser.fromPixels(img);

        const resized = image.resizeBilinear(tensor, [
          trainingHeigh,
          trainingWidth,
        ]);
        const normalized = div(resized, 255);
        console.log("normalized", normalized);
      }

      // TODO: Make tensor out of parsed keypoints
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
