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
import { MIDINoteType } from "config/midi";
import { DraggableCore } from "react-draggable";
import { Box } from "config/shared";

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

const DraggedBox = styled(BoxElement)`
  border: 2px solid ${theme.selectable};
`;

const StyledText = styled(Text)`
  color: ${theme.text};
`;

function MIDINoteView() {
  const [tempMidiNotes, setTempMidiNotes] = useRecoilState(midiNotes);
  const [selectedMidiNote, setSelectedMidiNote] = useState<
    MIDINoteType | undefined
  >(undefined);
  const [draggedBox, setDraggedBox] = useState<Box | undefined>(undefined);

  return (
    <NoteViewContainer>
      <BoxContainer>
        {Object.values(tempMidiNotes).map((tmn) => {
          const w = (tmn.box.xMax - tmn.box.xMin) * 500;
          const h = (tmn.box.yMax - tmn.box.yMin) * 375;
          const top = tmn.box.yMin * 375;
          const left = tmn.box.xMin * 500;

          return (
            <DraggableCore
              onStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedMidiNote(tmn);
                setDraggedBox(tmn.box);
              }}
              onStop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (draggedBox) {
                  const newMidiNotes = {
                    ...tempMidiNotes,
                    [tmn.uid]: {
                      ...tmn,
                      box: draggedBox,
                    },
                  };

                  setTempMidiNotes(newMidiNotes);
                  setDraggedBox(undefined);
                }
              }}
              onDrag={(e, data) => {
                e.stopPropagation();
                e.preventDefault();
                if (draggedBox) {
                  const originalW = tmn.box.xMax - tmn.box.xMin;
                  const originalH = tmn.box.yMax - tmn.box.yMin;

                  const xMin = Math.max(0, draggedBox.xMin + data.deltaX / 500);
                  const xMax = Math.min(1, draggedBox.xMax + data.deltaX / 500);
                  const yMin = Math.max(0, draggedBox.yMin + data.deltaY / 375);
                  const yMax = Math.min(1, draggedBox.yMax + data.deltaY / 375);

                  if (
                    originalW.toFixed(2) === (xMax - xMin).toFixed(2) &&
                    originalH.toFixed(2) === (yMax - yMin).toFixed(2)
                  ) {
                    setDraggedBox({
                      xMin,
                      xMax,
                      yMin,
                      yMax,
                    });
                  }
                }
              }}
            >
              <BoxElement
                key={`box-${tmn.uid}`}
                w={w}
                h={h}
                top={top}
                left={left}
              >
                Note: {tmn.note}
              </BoxElement>
            </DraggableCore>
          );
        })}
        {draggedBox && (
          <DraggedBox
            key="dragged-box"
            w={(draggedBox.xMax - draggedBox.xMin) * 500}
            h={(draggedBox.yMax - draggedBox.yMin) * 375}
            top={draggedBox.yMin * 375}
            left={draggedBox.xMin * 500}
          />
        )}
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
