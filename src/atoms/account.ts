import { atom } from "recoil";

const defaultAccount = {
  userId: "",
  dateExpiry: "",
  email: "",
  sessionId: "",
};

const account = atom({
  key: "account",
  default: defaultAccount,
});

export default account;
