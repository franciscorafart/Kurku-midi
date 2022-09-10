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
          <Modal.Title>How to use?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://youtu.be/6bNk6V5h9YU"
          >
            How to use video
          </a>
          <h4>Steps</h4>
          <h6>1. Select Midi Ouput</h6>
          <p>
            In the dropdown you will find your connected midi devices and
            enabled midi buses. Here are helpful links to set up internal MIDI
            buses:
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
            permission to access the webcam. Allow it.
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
            On the Midi effects panel you will see all the individual MIDI CC
            messages. Click on it to open the configuration panel to customize
            it.
          </p>
          <p>
            Use a Chromium based browser for a better experience (Brave, Chrome,
            Opera).
          </p>
          <p>Please provide feedback at rafart@rafartmusic.com</p>
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
