# Version documentation

## 1.0

MVP of the application. Body tracking, Midi mapping, interface design, payment integration with Stripe, Progressive Web App implemention, offline functionality, login and JWT tokens, email verification and reset, different tensorflow algorithms.

### 1.0.1

First official version change for users to get most recent updates. Amongst these are: Loging system, redis cache, email validation and recovery, separate free/logged-in/paid tiers.

### 1.0.2

Added a light circle and email information so that a user knows clearly if they're logged in, logged out, or are a paid user.

### 0.1.3

Fix session saving and retreival issues for paid users.

### 0.1.4

Delete sessions

### 0.1.5

- Refurbish user Interface
- Add Midi Note trigger functionality
- Fix multiple bugs on Saving and retreiving sessions

### 0.1.6

- Add Midi notes box ovelay to Webvam view
- Implement graphic resizing and dragging of Midi notes

### 0.1.7

- Implement Stripe subcription instead of direct payment

### 0.1.8

- Use of multiple tracking algorithm to avoid confusion when multiple people on webcam view.
- Reset frame counter to avoid number overflow
