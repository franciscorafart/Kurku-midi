import { atom } from "recoil";

const defaultAccount = {
  userId: "",
  dateExpiry: "",
  email: "",
};

const account = atom({
  key: "account",
  default: defaultAccount,
});

export default account;
