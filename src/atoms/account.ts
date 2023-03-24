import { atom } from "recoil";

const defaultAccount = {
  userId: "",
  dateExpiry: "",
};

const account = atom({
  key: "account",
  default: defaultAccount,
});

export default account;
