# Deploy paid features

[x] Make AWS API
[x] Roll back Heroku backend
[x] Hook up front end to API
[] Whitelist Heroku ip on load balancer.
[x] Figure out why App not available offline => It was being unregistered on load
[x] Find good spot to unregister service worker => If backend response gives old date, disconnect

## Fixes

[x] Write wallet Id to local storage on wallet connect, not only on payment sucessful
[] Filter last date from transactions (on the backend) => Copy addTransaction code for resubscription
[] Add warning pop-up on mobile

### Auth

- [] Login with email

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

[x] Try Kurku website color sections

## Testing

### Local storage

A. Server error

1.  Pay with Stripe
2.  Have /getTransactions return a 500
3.  See if local storage works

B. Offline (same)

C. Test you can log in metamask different browsers

## Bugs

[x] When metamask disconnected and expiry in localStorage, app works as paying customer. => Remove expiry when disconnected.
[x] A user could not pay again before subscription expired.

## Encryption

- Manually change encryted date of another user into local storage
- Login offline
- It should throw an error in the UI
