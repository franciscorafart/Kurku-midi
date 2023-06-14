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
import Draggable from "react-draggable";

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
  const [tempMidiNotes, setTempMidiNotes] = useRecoilState(midiNotes);
  const [startPos, setStartPos] = useState<
    { [index: string]: number } | undefined
  >(undefined);

  return (
    <NoteViewContainer>
      <BoxContainer>
        {Object.values(tempMidiNotes).map((tmn) => {
          const w = (tmn.box.xMax - tmn.box.xMin) * 500;
          const h = (tmn.box.yMax - tmn.box.yMin) * 375;
          const top = tmn.box.yMin * 375;
          const left = tmn.box.xMin * 500;

          return (
            <Draggable
              bounds="parent"
              onStart={(e) => {
                console.log("e start", e);
                e.preventDefault();
                e.stopPropagation();
                // @ts-ignore
                setStartPos({ x: e.pageX, y: e.pageY });
              }}
              onStop={(e) => {
                console.log("e stop", e);
                e.preventDefault();
                e.stopPropagation();
                if (startPos) {
                  // @ts-ignore
                  const [endX, endY] = [e.pageX, e.pageY] as number[];
                  const [movementX, movementY] = [
                    endX - startPos.x,
                    endY - startPos.y,
                  ];

                  console.log({
                    startPos,
                    movementX: movementX / 500,
                    movementY: movementY / 500,
                  });

                  const xMin = Math.max(0, tmn.box.xMin + movementX / 500);
                  const xMax = Math.min(1, tmn.box.xMax + movementX / 500);
                  const yMin = Math.max(0, tmn.box.yMin + movementY / 375);
                  const yMax = Math.min(1, tmn.box.yMax + movementY / 375);

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
            </Draggable>
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
