import { atom } from "recoil";
import { defaultAudioEffects } from "config/audio";

const audioEffects = atom({
  key: "audioEffects",
  default: defaultAudioEffects,
});

export default audioEffects;
