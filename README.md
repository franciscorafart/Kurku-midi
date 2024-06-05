# Kurku MIDI controller

[Kurku](https://kurku.tech) is a web body-movement MIDI controller that runs your devices webcam.

Kurku captures body movements with your webcam and allows you to send them as MIDI messages to Digital Audio Workstations (DAW) such as Ableton Live or Logic pro, or to any MIDI device connected to your machine, or in your WIFI network (with the proper setup).

## Architecture Overview

Kurku is a react app.

Shared application state is stored with Recoil library in `atoms`

## Features

- MIDI CC
  Map different limb movement to a MIDI CC message. This will allow you to have continous control. Ideal for knob or fader-like parameters such as filters, dry/wet control, volume knobs.

- MIDI Notes
  Kurku allows you to define trigger areas in your webcam view. Any time you touch one of this trigger areas a MIDI note will be sent. You turn it of by removing your body part from the trigger area.

- Offline use
  With Progressive Web App technology Kurku is able to run locally without the need of a connection. To do so locally, you will need to modify the code so that your user appears as a `payingUser`

- Lock Button. By pressing the Lock button or Space bar, Kurku will pause the sending of messages.

# Technologies

- React / Typescript
- Recoil => State management
- Styled components => Styling
- Progressive Web apps => Offline use
- localDB => Offline local storage
- Web MIDI API => MIDI messages
- Posenet => Body tracking
- Stripe => Payment processing

### Deployment

[Front-end]

The front end is hosted in Netlify. Via a webhook the `master` branch automatically builds when pushing a new commit.

Every time you push a new commit, you should change the version in the package-json so that the app is updated for users that have it cached as a Progressive Web App.

[Back end]
The backend is hosted on an EC2 instance on AWS. Check out the backend repo for documentation on how to deploy.

# Posnet

https://github.com/tensorflow/tfjs-models/tree/master/pose-detection
Apache 2 license: https://fossa.com/blog/open-source-licenses-101-apache-license-2-0/ => Open source commercial use
