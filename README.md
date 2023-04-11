# Soma controller

## Architecture Overview

### Audio Mode

In audio mode Soma combines three data sources to apply audio effects from body movement

- Body positions (Dynamic feed)
  Body positions are determined by the output of tensorflow's posetnet script

- Session Config (React Recoil state)
  Session config is a state object that stores different configurations as well as an effect list with the corresponding configurations such as effect type,
  body part that controls it, screen range to capture, value range to output. The front end UI allows the user to change these configurations. The combinations of these with the position provided by the posenet script allows to change the state of audio nodes.

- AudioFXs (Audio nodes ref object)
  This is a ref that stores the nodes of each effect, keyee on the effectType-bodyPart tuple. For example `reverb-nose` would be the key to store the audio node in the ref object for a Reverb effect controlled with the nose position.

BodyPosition |R SessionConfig => AudioFXs

### MIDI Controller mode

### Deployment

- To deploy in heroku you need to provide the buildpack for reach in Settings. Follow these instructions
  https://www.geeksforgeeks.org/how-to-deploy-react-app-to-heroku/

# Posnet

https://github.com/tensorflow/tfjs-models/tree/master/pose-detection
Apache 2 license: https://fossa.com/blog/open-source-licenses-101-apache-license-2-0/ => Open source commercial use

## TODO hand tracking

1. Create getHandParts function => Insert in ConfigMidiBridge
2. Draw hands on canvas
3. Create mapHandConfigToMidi => Insert into ConfigMidiBridge
