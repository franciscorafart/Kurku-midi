# Deploy paid features

[x] Make AWS API
[] Roll back Heroku backend
[] Hook up front end to API
[] Whitelist Heroku ip on load balancer.

## Fixes

[] Write wallet Id to local storage on wallet connect, not only on payment sucessful
[] Filter last date from transactions (on the backend)

### Auth

- [x] Metamask
  - [x] Disconnect button => With metamask

### Payment

[x] Stripe service + server - [] Stripe keys in production

[x] Server code

- [x] Modal code
- [x] Mongo db payment storage (walletAddress | amount | currency | pay day | expiry date)
- [] Integrate to UI flow
  - [] On load fetch user from api
    fetch from local storage if not
  - [x] Disable functionality unpaid
  - [x] Tooltips when unpaid
- [] Test and find bugs

### Expiry date storage

[] Assymetric encryption of date in the back end and decrypt in the front end https://stackoverflow.com/questions/54087514/asymmetric-encryption-using-nodejs-crypto-module

[] Use wallet Id as salt, to avoid someone copy pasting someone elses encypted date string into their local storage.

[] Store encrypted date in local storage

### Paid customers

- [x] Enable / disable features
- [x] Tooltips for disabled features
- [x] How to use => Metamask connection and Stripe payment
- [] Look into crypto payments with metamask https://docs.metamask.io/guide/sending-transactions.html#example

# UI

[] Try Kurku website color sections

## Testing

### Local storage

A. Server error

1.  Pay with Stripe
2.  Have /addTransaction return a 500
3.  See if local storage works

B. Offline (same)

Encryption

- Manually change encryted date of another user into local storage
- Login offline
- It should throw an error in the UI
