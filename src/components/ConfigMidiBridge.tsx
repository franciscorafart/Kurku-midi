import midiSession from "atoms/midiEffects";
import { getBodyParts } from "utils/utils";
import { mapGlobalConfigsToMidi } from "utils/midiUtils";
import { useRecoilValue } from "recoil";
import { machineConfig } from "utils/bodytracking";
import keypoints from "atoms/keypoints";
import { useEffect, useMemo } from "react";
import { isEmpty } from "lodash";
import { makeCCSender } from "utils/midiCtx";
import sessionConfig from "atoms/sessionConfig";
import midiOutput from "atoms/selectedMidiOutput";
import MidiSessionConfig from "./MidiSessionConfig";

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
  const midiSessionConfig = useRecoilValue(midiSession);
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

      mapGlobalConfigsToMidi(midiSessionConfig, bodyPartPositions, ccSender);
    }
  }, [
    kpValues,
    midiSessionConfig,
    config.confidence,
    videoHeight,
    videoWidth,
    ccSender,
  ]);

  return (
    <div>
      <MidiSessionConfig onInit={onInit} />
    </div>
  );
}

export default ConfigMidiBridge;
