import { atom } from "recoil";

const defaultAccount = {
  userId: "",
  dateExpiry: "",
  email: "",
  checkoutId: "",
};

const account = atom({
  key: "account",
  default: defaultAccount,
});

export default account;
