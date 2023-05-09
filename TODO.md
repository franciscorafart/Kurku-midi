# Deploy paid features

## Hand tracking

- Fix isPaidUs

## Fixes

[] Filter last date from transactions (on the backend) => Copy addTransaction code for resubscription

### Expiry date storage

[] Assymetric encryption of date in the back end and decrypt in the front end https://stackoverflow.com/questions/54087514/asymmetric-encryption-using-nodejs-crypto-module

[] Use wallet Id as salt, to avoid someone copy pasting someone elses encypted date string into their local storage.

[] Store encrypted date in local storage

### Paid customers

# UI

## Testing

### Local storage

A. Server error

1.  Pay with Stripe
2.  Have /getTransactions return a 500
3.  See if local storage works

B. Offline (same)

## Index DB

- Implement delete saved sessions

## Bugs

## Encryption

- Manually change encryted date of another user into local storage
- Login offline
- It should throw an error in the UI

# Tech debt

- Remove localhost logic in ServiceWorker
- Make tests
-
