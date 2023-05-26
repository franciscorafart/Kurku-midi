import midiSession from "atoms/midiEffects";
import { getBodyParts } from "utils/utils";
import {
  mapGlobalConfigsToMidi,
  mapPositionsToMIDINotes,
} from "utils/midiUtils";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { machineConfig } from "utils/bodytracking";
import keypoints from "atoms/keypoints";
import { useEffect, useMemo } from "react";
import { isEmpty } from "lodash";
import { makeCCSender, makeNoteSender } from "utils/midiCtx";
import sessionConfig from "atoms/sessionConfig";
import midiOutput from "atoms/selectedMidiOutput";
import ccMeterMap from "atoms/ccMeterMap";
import muteMidi from "atoms/muteMidi";
import MidiSessionControls from "./MidiSessionControls";

function ConfigMidiBridge({
  videoHeight,
  videoWidth,
  onInit,
}: {
  videoHeight: number;
  videoWidth: number;
  onInit: () => Promise<void>;
}) {
  const kpValues = useRecoilValue(keypoints);
  const midiSessionControls = useRecoilValue(midiSession);
  const setCCMeterMap = useSetRecoilState(ccMeterMap);
  const sessionCfg = useRecoilValue(sessionConfig);
  const config = machineConfig[sessionCfg.machineType];

  const selectedOutput = useRecoilValue(midiOutput);
  const muted = useRecoilValue(muteMidi);

  const ccSender = useMemo(
    () => (selectedOutput ? makeCCSender(selectedOutput) : undefined),
    [selectedOutput]
  );

  const noteSender = useMemo(
    () => (selectedOutput ? makeNoteSender(selectedOutput) : undefined),
    [selectedOutput]
  );

  useEffect(() => {
    if (!isEmpty(kpValues) && noteSender && ccSender && !muted) {
      const bodyPartPositions = getBodyParts(
        kpValues,
        config.confidence,
        videoHeight,
        videoWidth
      );

      const valueObjectMap = mapGlobalConfigsToMidi(
        midiSessionControls,
        bodyPartPositions,
        ccSender
      );
      setCCMeterMap(valueObjectMap);

      // TODO: Add Note mapper here
      mapPositionsToMIDINotes(bodyPartPositions, noteSender);
    }
  }, [
    ccSender,
    config.confidence,
    kpValues,
    midiSessionControls,
    muted,
    noteSender,
    setCCMeterMap,
    videoHeight,
    videoWidth,
  ]);

  return <MidiSessionControls onInit={onInit} />;
}

export default ConfigMidiBridge;
