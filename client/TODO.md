### Auth

- [x] Metamask
  - [] Disconnect button

### Payment

[x] Stripe service + server - [] Stripe keys in production

[x] Server code

- [x] Modal code
- [x] Mongo db payment storage (walletAddress | amount | currency | pay day | expiry date)
- [] Integrate to UI flow
  - [] On load fetch user from api
    fetch from local storage if not
  - [] Disable functionality unpaid
  - [] Tooltips when unpaid
- [] Test and find bugs

### Expiry date storage

[] Assymetric encryption of date in the back end and decrypt in the front end https://stackoverflow.com/questions/54087514/asymmetric-encryption-using-nodejs-crypto-module

[] Use wallet Id as salt, to avoid someone copy pasting someone elses encypted date string into their local storage.

[] Store encrypted date in local storage

### Paid customers

- [] Enable / disable features
- [] Tooltips for disabled features
- [] How to use => Metamask connection and Stripe payment
- [] Look into crypto payments with metamask https://docs.metamask.io/guide/sending-transactions.html#example
