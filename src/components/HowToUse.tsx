import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import styled from "styled-components";

const Links = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 10px;
`;

function HowToUse({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <Modal show={open} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>How to use</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://youtu.be/6bNk6V5h9YU"
          >
            How to use video
          </a>
          <p>
            Soma is a body tracking MIDI controller that works on your browser.
            This software allows you to map the position of different body parts
            to MIDI continuous control messages (CC) using just your webcam.
          </p>
          <p>
            Use a Chromium based browser for a better experience (Brave, Chrome,
            Opera)
          </p>
          <h4>Steps</h4>
          <h6>1. Select Midi Ouput</h6>
          <p>
            In the dropdown you will find your connected midi devices and
            enabled midi buses. If you want to route Soma into your DAW (For ex.
            Ableton) you will have to create an internal MIDI bus. Here are
            helpful links to do that:
          </p>
          <Links>
            <a href="https://support.apple.com/guide/audio-midi-setup/set-up-midi-devices-ams875bae1e0/mac">
              MAC Midi Configuration
            </a>
            <a href="https://help.ableton.com/hc/en-us/articles/209774225-How-to-setup-a-virtual-MIDI-bus#Windows">
              Mac: MIDI bus to Ableton
            </a>
            <a href="https://help.ableton.com/hc/en-us/articles/209774225-How-to-setup-a-virtual-MIDI-bus#Windows">
              Windows: MIDI bus to Ableton
            </a>
          </Links>
          <h6>2. Start MIDI</h6>
          <p>
            When you start body tracking, a pop-up will appear asking for
            permission to access the webcam. Allow it, otherwise this
            application doesn't work. If you need to change session configs
            after starting body tracking, reload the page and start over.
          </p>
          {/* <h6>Computer speed</h6>
          <p>
            The computer speed option will determine which kind of algorithm
            will be used for body tracking. If your computer is slow, select
            `Slow`. This will give you a faster, but less accurate body
            tracking.
          </p> */}
          <h6>MIDI FX Panel</h6>
          <p>
            On the Midi effects panel below, you'll see all the individual MIDI
            CC messages you're sending. Clicking to open the configuration panel
            to customize it. Add more by clicking `Add Effects`` on the right
            side button.
          </p>
          <p>
            Thank you for trying out SOMA. Please provide feedback at
            rafart@rafartmusic.com
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default HowToUse;
