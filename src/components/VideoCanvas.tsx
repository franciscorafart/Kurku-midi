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
import selectedMidiNote from "atoms/selectedMidiNote";
import Draggable from "react-draggable";
import { Box } from "config/shared";

const VIEW_W = 500;
const VIEW_H = 375;

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
  min-height: ${VIEW_H}px;
  width: ${VIEW_W}px;
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
  min-height: ${VIEW_H}px;
  width: ${VIEW_W}px;
  top: 0;
  left: 0;
`;

const BoxElement = styled.div<{
  w: number;
  h: number;
  selected?: boolean;
}>`
  position: absolute;
  min-width: 50px;
  min-height: 50px;
  width: ${({ w }) => w}px;
  height: ${({ h }) => h}px;
  border: 2px solid
    ${({ selected }) => (selected ? theme.border : theme.selectable)};
  color: ${({ selected }) => (selected ? theme.border : theme.selectable)};
  float: left;
  z-index: 100;
  cursor: move;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-direction: column;
`;

const Sizer = styled.div`
  width: 6px;
  height: 6px;
  background-color: ${theme.selectable};
  cursor: nwse-resize;
  transform: none !important; // Prevent translate when resizing element
`;

const NoteData = styled.div`
  width: 100%;
  font-size: 0.7em;
  text-align: left;
`;

const StyledText = styled(Text)`
  color: ${theme.text};
`;

const ResizableBox = styled(BoxElement)<{ top: number; left: number }>`
  border: 1px dashed
    ${({ selected }) => (selected ? theme.border : theme.selectable)};
  top: ${({ top }) => top}px;
  left: ${({ left }) => left}px;
`;

function MIDINoteView() {
  const [tempMidiNotes, setTempMidiNotes] = useRecoilState(midiNotes);
  const selectedNoteValue = useRecoilValue(selectedMidiNote);
  const [resizableBox, setResizableBox] = useState<Box | undefined>(undefined);

  const [startPos, setStartPos] = useState<
    { [index: string]: number } | undefined
  >(undefined);

  return (
    <NoteViewContainer>
      <BoxContainer>
        {Object.values(tempMidiNotes).map((tmn) => {
          const w = (tmn.box.xMax - tmn.box.xMin) * VIEW_W;
          const h = (tmn.box.yMax - tmn.box.yMin) * VIEW_H;
          const top = tmn.box.yMin * VIEW_H;
          const left = tmn.box.xMin * VIEW_W;

          return (
            <Draggable
              bounds="parent"
              defaultPosition={{ x: left, y: top }}
              onStart={(e, data) => {
                e.preventDefault();
                e.stopPropagation();
                setStartPos({ x: data.x, y: data.y });
                // Set dirty
              }}
              onStop={(e, data) => {
                e.preventDefault();
                e.stopPropagation();
                if (startPos) {
                  const [movementX, movementY] = [
                    data.x - startPos.x,
                    data.y - startPos.y,
                  ];

                  const xMin = Math.max(0, tmn.box.xMin + movementX / VIEW_W);
                  const xMax = Math.min(1, tmn.box.xMax + movementX / VIEW_W);
                  const yMin = Math.max(0, tmn.box.yMin + movementY / VIEW_H);
                  const yMax = Math.min(1, tmn.box.yMax + movementY / VIEW_H);
                  const newMidiNotes = {
                    ...tempMidiNotes,
                    [tmn.uid]: {
                      ...tmn,
                      box: {
                        xMin,
                        xMax,
                        yMin,
                        yMax,
                      },
                    },
                  };

                  setTempMidiNotes(newMidiNotes);
                  setStartPos(undefined);
                }
              }}
              key={`box-${tmn.uid}`}
            >
              <BoxElement w={w} h={h} selected={tmn.uid === selectedNoteValue}>
                <NoteData>Note: {tmn.note}</NoteData>
                <Draggable
                  onStart={(e, data) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setStartPos({ x: data.x, y: data.y });
                  }}
                  onStop={(e, data) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (startPos) {
                      const [movementX, movementY] = [
                        data.x - startPos.x,
                        data.y - startPos.y,
                      ];
                      const xMin = tmn.box.xMin;
                      const xMax = Math.min(
                        1,
                        tmn.box.xMax + movementX / VIEW_W
                      );
                      const yMin = tmn.box.yMin;
                      const yMax = Math.min(
                        1,
                        tmn.box.yMax + movementY / VIEW_H
                      );

                      const newMidiNotes = {
                        ...tempMidiNotes,
                        [tmn.uid]: {
                          ...tmn,
                          box: {
                            xMin,
                            xMax,
                            yMin,
                            yMax,
                          },
                        },
                      };
                      setTempMidiNotes(newMidiNotes);
                      setStartPos(undefined);
                      setResizableBox(undefined);
                    }
                  }}
                  onDrag={(e, data) => {
                    if (startPos) {
                      const [movementX, movementY] = [
                        data.x - startPos.x,
                        data.y - startPos.y,
                      ];
                      const xMin = tmn.box.xMin;
                      const xMax = Math.min(
                        1,
                        Math.max(
                          tmn.box.xMin + 0.1,
                          tmn.box.xMax + movementX / VIEW_W
                        )
                      );
                      const yMin = tmn.box.yMin;
                      const yMax = Math.min(
                        1,
                        Math.max(
                          tmn.box.yMin + 0.1,
                          tmn.box.yMax + movementY / VIEW_H
                        )
                      );
                      setResizableBox({ xMin, xMax, yMin, yMax });
                    }
                  }}
                >
                  <Sizer key={`sizer-${tmn.uid}`} />
                </Draggable>
              </BoxElement>
            </Draggable>
          );
        })}
        {resizableBox && (
          <ResizableBox
            w={(resizableBox.xMax - resizableBox.xMin) * VIEW_W}
            h={(resizableBox.yMax - resizableBox.yMin) * VIEW_H}
            left={resizableBox.xMin * VIEW_W}
            top={resizableBox.yMin * VIEW_H}
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
