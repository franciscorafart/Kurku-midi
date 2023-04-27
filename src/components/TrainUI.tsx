import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Header from "./Header";
import styled from "styled-components";
import theme from "config/theme";
import { User } from "context";
import { setupCamera } from "utils/bodytracking";
import { Button } from "react-bootstrap";

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

function TrainUI() {
  const [showModal, setShowModal] = useState(false);
  const [showKurkuModal, setShowKurkuModal] = useState(false);

  const isPaidUser = useContext(User);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const startVideo = async () => {
      const video = videoRef.current;
      if (video) {
        await setupCamera(video);
        video.play();
      }
    };

    startVideo();
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const ctx: CanvasRenderingContext2D | null =
      canvas?.getContext("2d") || null;
    if (video && canvas && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      const data = canvas.toDataURL("image/png");

      setThumbnails([...thumbnails, data]);
    }
  }, [thumbnails]);

  return (
    <Container>
      <Header
        kurkuModal={() => setShowKurkuModal(true)}
        howToUseModal={() => setShowModal(true)}
      />
      <TrainContainer>
        <ThumbnailContainer>
          {thumbnails.map((th, idx) => (
            <ImgContainer>
              <Span>Image {idx}</Span>
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
            <Button disabled={!isPaidUser}>Train</Button>
          </TrainControls>
        </ControlContainer>
      </TrainContainer>
    </Container>
  );
}

export default TrainUI;
