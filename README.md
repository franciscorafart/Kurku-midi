# Kurku MIDI controller

[Kurku](https://kurku.tech) is a web body-movement MIDI controller that runs your device's webcam.

Kurku captures body movements with your webcam and allows you to send them as MIDI messages to Digital Audio Workstations (DAW) such as Ableton Live or Logic Pro, or to any MIDI device connected to your machine or in your Wi-Fi network (with the proper setup).

## Features

MIDI CC
Map different limb movements to a MIDI CC message. This allows for continuous control, ideal for knob or fader-like parameters such as filters, dry/wet control, and volume knobs.

MIDI Notes
Kurku allows you to define trigger areas in your webcam view. Any time you touch one of these trigger areas, a MIDI note will be sent. You can turn it off by removing your body part from the trigger area.

Offline Use
With Progressive Web App technology, Kurku can run locally without the need for a connection. To do so locally, you will need to modify the code so that your user appears as a payingUser.

Lock Button
By pressing the Lock button or Space bar, Kurku will pause the sending of messages.

# Technologies

- React / Typescript
- Recoil => State management
- Styled components => Styling
- Progressive Web apps => Offline use
- localDB => Offline local storage
- Web MIDI API => MIDI messages
- Posenet => Body tracking
- Stripe => Payment processing

## Architecture Overview

Kurku is a single-page React app. Its purpose is to capture body movements and turn them into MIDI messages that can be routed outside of the browser into other MIDI-enabled software or MIDI devices connected to the machine.

### From body movement to MIDI - Data Pipeline
An overview of how the application works is as follows:

1. User opens the app, selects a MIDI device to route MIDI data to, and starts tracking body movements.
2. The app prompts the user to give access to the webcam.
3. The webcam captures body movements and sends image frame data to a PoseNet model that analyzes each image frame and returns an array with body positions and other relevant data.
4. Raw body movement data is parsed and transformed into MIDI CC and note messages.
5. Messages are sent to a MIDI bus or device using the WebMIDI API.

### Shared application state
Even though it's a single-page application, Kurku has many components that need to access body position, MIDI data, and other configurations simultaneously. All this shared application state is managed in a state store using the Recoil library.

### Bridge component
Kurku integrates PoseNet, WebMIDI, and webcam input—technologies with APIs not built for React application state. To achieve an integration with these APIs in a React environment, a "Bridge Component" is used. This is a React component with no visible UI element that acts as a wrapper, bridging video, PoseNet, and MIDI data with the React application state.

Here's how it works:

An automatic frame-by-frame process of updating body positions starts in the initTracking function when the user initiates the process. The body positions are stored in the Recoil state.
In the ConfigMidiBridge component, the position data in the Recoil state is parsed and turned into MIDI CC and note values, which are sent to the MIDI API. In this same component, all UI elements related to MIDI messages are updated to inform the user.

### Deployment

[Front-end]

The front end is hosted in Netlify. Via a webhook the `master` branch automatically builds when pushing a new commit.

Every time you push a new commit, you should change the version in the package-json so that the app is updated for users that have it cached as a Progressive Web App.

[Back end]
The backend is hosted on an EC2 instance on AWS. Check out the backend repo for documentation on how to deploy.

# License
This software is provided for personal and non-commercial use only. Users are permitted to run, modify, and share the software for personal, educational, or non-profit purposes. Commercial use, including but not limited to selling, licensing, or otherwise using the software for commercial gain, is strictly prohibited unless explicit permission is obtained from the owner of the software.

