import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { mapGlobalConfigsToSound } from "utils/audioUtils";
import { getBodyParts } from "utils/utils";
import { KeyedEffectType } from "utils/types";
import audioEffects from "atoms/audioEffects";
import { isEmpty } from "lodash";
import { machineConfig } from "utils/bodytracking";
import sessionConfig from "atoms/sessionConfig";
import keypoints from "atoms/keypoints";

function ConfigAudioBridge({
  audioCtx,
  audioFXs,
  videoHeight,
  videoWidth,
}: {
  audioCtx: AudioContext;
  audioFXs: KeyedEffectType;
  videoHeight: number;
  videoWidth: number;
}) {
  const kpValues = useRecoilValue(keypoints);
  const audioFXState = useRecoilValue(audioEffects);
  const sessionCfg = useRecoilValue(sessionConfig);
  const config = machineConfig[sessionCfg.machineType];

  useEffect(() => {
    if (!isEmpty(kpValues)) {
      const bodyPartPositions = getBodyParts(
        kpValues,
        config.confidence,
        videoHeight,
        videoWidth
      );

      //TODO: pass only skip size from config and deal with FX with ref
      mapGlobalConfigsToSound(
        audioFXState,
        bodyPartPositions,
        audioCtx,
        audioFXs
      );
    }
  }, [
    kpValues,
    audioFXState,
    audioCtx,
    audioFXs,
    config.confidence,
    videoHeight,
    videoWidth,
  ]);

  return <div></div>;
}

export default ConfigAudioBridge;
