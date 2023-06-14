import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import { drawKeypoints, drawSkeleton, resetCanvas } from "utils/utils";
import { isEmpty } from "lodash";
import { machineConfig } from "utils/bodytracking";
import keypoints from "atoms/keypoints";
import midiNotes from "atoms/midiNotes";
import sessionConfig from "atoms/sessionConfig";
import theme from "config/theme";
import { Text, SubTitle } from "./shared";

const VideoCanvasContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: ${theme.background2};
  border-radius: 8px;
  gap: 20px;
`;

const Video = styled.video`
  display: none;
`;

// NOTE: Fix webcam view here
const Canvas = styled.canvas`
  min-height: 375px;
  width: 500px;
  border: 1px dashed ${theme.text};
  position: absolute:
  top: 0;
  left: 0;
`;

const TextContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const OverlapContainer = styled.div`
  position: relative;
`;

const NoteViewContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
`;

const BoxContainer = styled.div`
  position: relative;
  min-height: 375px;
  width: 500px;
  top: 0;
  left: 0;
`;

const BoxElement = styled.div<{
  top: number;
  left: number;
  w: number;
  h: number;
}>`
  position: absolute;
  width: ${({ w }) => w}px;
  height: ${({ h }) => h}px;
  top: ${({ top }) => top}px;
  left: ${({ left }) => left}px;
  border: 2px solid ${theme.border};
  padding: 4px;
  color: ${theme.border};
  float: left;
  z-index: 100;
  cursor: pointer;
`;

const StyledText = styled(Text)`
  color: ${theme.text};
`;

function MIDINoteView() {
  const [dragging, setDragging] = useState(false);
  const [tempMidiNotes, setTempMidiNotes] = useRecoilState(midiNotes);

  console.log("dragging", dragging);
  return (
    <NoteViewContainer>
      <BoxContainer>
        {Object.values(tempMidiNotes).map((tmn) => {
          const w = (tmn.box.xMax - tmn.box.xMin) * 500;
          const h = (tmn.box.yMax - tmn.box.yMin) * 375;
          const top = tmn.box.yMin * 375;
          const left = tmn.box.xMin * 500;

          return (
            <BoxElement
              key={`box-${tmn.uid}`}
              w={w}
              h={h}
              top={top}
              left={left}
              onMouseDown={(e) => {
                setDragging(true);
                e.stopPropagation();
                e.preventDefault();
              }}
              onMouseUp={(e) => {
                setDragging(false);
                e.stopPropagation();
                e.preventDefault();
              }}
              onMouseLeave={(e) => {
                setDragging(false);
                e.stopPropagation();
                e.preventDefault();
              }}
              onMouseMove={(e) => {
                // console.log("e", e);
                e.stopPropagation();
                e.preventDefault();
                if (dragging) {
                  const midiNote = { ...tmn };
                  const box = { ...midiNote.box };
                  const originalW = box.xMax - box.xMin;
                  const originalH = box.yMax - box.yMin;

                  const xMin = Math.max(0, box.xMin + e.movementX / 500);
                  const xMax = Math.min(1, box.xMax + e.movementX / 500);
                  const yMin = Math.max(0, box.yMin + e.movementY / 375);
                  const yMax = Math.min(1, box.yMax + e.movementY / 375);

                  if (originalW === xMax - xMin && originalH === yMax - yMin) {
                    box.xMin = xMin;
                    box.xMax = xMax;
                    box.yMin = yMin;
                    box.yMax = yMax;

                    midiNote.box = box;
                    const newMidiNotes = {
                      ...tempMidiNotes,
                      [tmn.uid]: midiNote,
                    };

                    setTempMidiNotes(newMidiNotes);
                  }
                }
              }}
            >
              Note: {tmn.note}
            </BoxElement>
          );
        })}
      </BoxContainer>
    </NoteViewContainer>
  );
}

function VideoCanvas({
  canvasRef,
  videoRef,
}: {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
}) {
  const kpValues = useRecoilValue(keypoints);
  const sessionCfg = useRecoilValue(sessionConfig);
  const video = videoRef.current;
  const canvas = canvasRef.current;
  const ctx: CanvasRenderingContext2D | null = canvas?.getContext("2d") || null;
  const config = machineConfig[sessionCfg.machineType];

  useEffect(() => {
    if (ctx && video && !isEmpty(kpValues)) {
      resetCanvas(ctx, video);
      drawKeypoints(kpValues, config.confidence, ctx);
      drawSkeleton(kpValues, config.confidence, ctx);
    }
  }, [kpValues, ctx, video, config.confidence]);
  return (
    <VideoCanvasContainer>
      <TextContainer>
        <SubTitle>
          <StyledText>Webcam view</StyledText>
        </SubTitle>
      </TextContainer>
      <OverlapContainer>
        <Video ref={videoRef} />
        <Canvas ref={canvasRef} />
        <MIDINoteView />
      </OverlapContainer>
    </VideoCanvasContainer>
  );
}

export default VideoCanvas;
