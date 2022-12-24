import { atom } from "recoil";

const defaultAccount = {
  walletAddress: "",
  dateExpiry: "",
};

const account = atom({
  key: "account",
  default: defaultAccount,
});

export default account;
