import { useEffect, useMemo } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { isEmpty } from "lodash";

import keypoints from "atoms/keypoints";
import handKeypoints from "atoms/handKeypoints";
import sessionConfig from "atoms/sessionConfig";
import midiOutput from "atoms/selectedMidiOutput";
import valueMap from "atoms/valueMap";
import midiSession from "atoms/midiEffects";
import muteMidi from "atoms/muteMidi";

import MidiSessionControls from "./MidiSessionControls";

import { machineConfig } from "utils/bodytracking";
import { makeCCSender } from "utils/midiCtx";
import { mapGlobalConfigsToMidi } from "utils/midiUtils";
import { getBodyParts, getHandsPart } from "utils/utils";

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
  const handKpValues = useRecoilValue(handKeypoints);
  const midiSessionControls = useRecoilValue(midiSession);
  const setValueMap = useSetRecoilState(valueMap);
  const sessionCfg = useRecoilValue(sessionConfig);
  const config = machineConfig[sessionCfg.machineType];

  const selectedOutput = useRecoilValue(midiOutput);
  const muted = useRecoilValue(muteMidi);

  const ccSender = useMemo(
    () => (selectedOutput ? makeCCSender(selectedOutput) : undefined),
    [selectedOutput]
  );

  useEffect(() => {
    if (ccSender && !muted) {
      if (!isEmpty(kpValues)) {
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
        // TODO: Add get Hand parts
        // Add mapHandConfigToMidi
        setValueMap(valueObjectMap);
        // TODO: make object that stores input and outut values keyed on effect identifier and assign it to the recoil state
      }

      if (!isEmpty(handKpValues)) {
        const handParts = getHandsPart(handKpValues.Left["3d"]);
      }
    }
  }, [
    ccSender,
    config.confidence,
    handKpValues,
    kpValues,
    midiSessionControls,
    muted,
    setValueMap,
    videoHeight,
    videoWidth,
  ]);

  return (
    <div>
      <MidiSessionControls onInit={onInit} />
    </div>
  );
}

export default ConfigMidiBridge;
