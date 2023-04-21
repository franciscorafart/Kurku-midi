# Soma controller

## Architecture Overview

### Audio Mode

In audio mode Soma combines three data sources to apply audio effects from body movement

- Body positions (Dynamic feed)
  Body positions are determined by the output of tensorflow's posetnet script

- Session Config (React Recoil state)
  Session config is a state object that stores different configurations as well as an effect list with the corresponding configurations such as effect type, body part that controls it, screen range to capture, value range to output. The front end UI allows the user to change these configurations. The combinations of these with the position provided by the posenet script allows to change the state of audio nodes.

### MIDI Controller mode

### Deployment

[Front-end]

The front end is hosted in Netlify. Via a webhook the `master` branch automatically builds when pushing a new commit.

Every time you push a new commit, you should change the version in the package-json so that the app is updated for users that have it cached as a Progressive Web App.

[Back end]
The backend is hosted on an EC2 instance on AWS. Check out the backend repo for documentation on how to deploy.

# Posnet

https://github.com/tensorflow/tfjs-models/tree/master/pose-detection
Apache 2 license: https://fossa.com/blog/open-source-licenses-101-apache-license-2-0/ => Open source commercial use
