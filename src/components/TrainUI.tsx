import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./Header";
import styled from "styled-components";
import theme from "config/theme";
import { setupCamera } from "utils/bodytracking";
import { Button } from "react-bootstrap";

const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${theme.background};
`;

const ThumbnailContainer = styled.div`
  background-color: ${theme.background2};
  width: 25%;
`;
const VideoContentContainer = styled.div`
  width: 50%;
`;

const ControlContainer = styled.div`
  width: 25%;
`;

const Img = styled.img`
  width: 100px;
`;

const Video = styled.video``;
const Canvas = styled.canvas`
  display: none;
`;

function TrainUI() {
  const [showModal, setShowModal] = useState(false);
  const [showKurkuModal, setShowKurkuModal] = useState(false);

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
    <>
      <Header
        kurkuModal={() => setShowKurkuModal(true)}
        howToUseModal={() => setShowModal(true)}
      />
      <Container>
        <ThumbnailContainer>
          {thumbnails.map((th, idx) => (
            <Img key={`image-${idx}`} src={th} alt="thumbnail" />
          ))}
        </ThumbnailContainer>
        <VideoContentContainer>
          <Video ref={videoRef} />
          <Canvas ref={canvasRef} />
        </VideoContentContainer>
        <ControlContainer>
          <Button onClick={capture}>Capture</Button>

          <Button>Train</Button>
        </ControlContainer>
      </Container>
    </>
  );
}

export default TrainUI;
