import midiSession from "atoms/midiEffects";
import { getBodyParts } from "utils/utils";
import { mapGlobalConfigsToMidi } from "utils/midiUtils";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { machineConfig } from "utils/bodytracking";
import keypoints from "atoms/keypoints";
import { useEffect, useMemo } from "react";
import { isEmpty } from "lodash";
import { makeCCSender } from "utils/midiCtx";
import sessionConfig from "atoms/sessionConfig";
import midiOutput from "atoms/selectedMidiOutput";
import valueMap from "atoms/valueMap";
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
  const setValueMap = useSetRecoilState(valueMap);
  const sessionCfg = useRecoilValue(sessionConfig);
  const config = machineConfig[sessionCfg.machineType];

  const selectedOutput = useRecoilValue(midiOutput);

  const ccSender = useMemo(
    () => (selectedOutput ? makeCCSender(selectedOutput) : undefined),
    [selectedOutput]
  );

  useEffect(() => {
    if (!isEmpty(kpValues) && ccSender) {
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
      setValueMap(valueObjectMap);
      // TODO: make object that stores input and outut values keyed on effect identifier and assign it to the recoil state
    }
  }, [
    kpValues,
    midiSessionControls,
    config.confidence,
    videoHeight,
    videoWidth,
    ccSender,
    setValueMap,
  ]);

  return (
    <div>
      <MidiSessionControls onInit={onInit} />
    </div>
  );
}

export default ConfigMidiBridge;
