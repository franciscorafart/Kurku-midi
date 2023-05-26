import { atom } from "recoil";
import { InputOutputMap } from "utils/types";

const ccMeterMap = atom({
  key: "ccMeterMap",
  default: {} as InputOutputMap,
});

export default ccMeterMap;
