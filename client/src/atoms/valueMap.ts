import { atom } from "recoil";
import { InputOutputMap } from "utils/types";

const valueMap = atom({
  key: "valueMap",
  default: {} as InputOutputMap,
});

export default valueMap;
