import midiSession from "atoms/midiEffects";
import { getBodyParts } from "utils/utils";
import {
  mapGlobalConfigsToMidi,
  mapPositionsToMIDINotes,
} from "utils/midiUtils";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { machineConfig } from "utils/bodytracking";
import keypoints from "atoms/keypoints";
import { useEffect, useMemo } from "react";
import { isEmpty } from "lodash";
import { makeCCSender, makeNoteSender } from "utils/midiCtx";
import ccMeterMap from "atoms/ccMeterMap";
import midiOutput from "atoms/selectedMidiOutput";
import sessionConfig from "atoms/sessionConfig";
import midiNotes from "atoms/midiNotes";
import muteMidi from "atoms/muteMidi";
import MidiSessionControls from "./MidiSessionControls";
import noteOnOffMap from "atoms/noteOnOffMap";

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
  const [onOffMap, setOnOffMap] = useRecoilState(noteOnOffMap);
  const sessionCfg = useRecoilValue(sessionConfig);
  const notes = useRecoilValue(midiNotes);
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
      const midinotesPlaying = mapPositionsToMIDINotes(
        bodyPartPositions,
        noteSender,
        notes,
        onOffMap
      );

      setCCMeterMap(valueObjectMap);
      setOnOffMap(midinotesPlaying);
    }
  }, [
    // Keep onOffMap out of dependencies to not trigger an extra unecessary cycle
    ccSender,
    config.confidence,
    kpValues,
    midiSessionControls,
    muted,
    noteSender,
    notes,
    setCCMeterMap,
    setOnOffMap,
    videoHeight,
    videoWidth,
  ]);

  return <MidiSessionControls onInit={onInit} />;
}

export default ConfigMidiBridge;
