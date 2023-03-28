import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function WhatIsKurku({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <Modal show={open} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>What is Kurku?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Kurku is a body tracking MIDI controller that works on your browser.
            Map the position of different body parts to MIDI continuous control
            messages (CC) using your webcam, and send it to midi devices or
            software.
          </p>
          <h4>Free Tier</h4>
          <p>By login in you get:</p>
          <ul>
            <li>
              <h5>Effects</h5>Three MIDI effects for you performance.
            </li>
            <li>
              <h5>Saving</h5>Save one session to pick up your work.
            </li>
          </ul>
          <h4>Paid Tier</h4>
          <p>Paying users get useful extra features:</p>
          <ul>
            <li>
              <h5>Offline use</h5>You don't need an internet connection, Kurku
              runs like a desktop app on your browser.
            </li>
            <li>
              <h5>Saving</h5>Save any number of sessions and don't waste time
              setting it up next time you use Kurku.
            </li>
            <li>
              <h5>Effects</h5>You can have eight MIDI effects for you
              performance.
            </li>
            <li>
              <h5>Mute</h5>Mute MIDI output when you don't need it in your
              performance
            </li>
            {/* <li>
              <h5>More accuracy:</h5>Use more precise algorithms for tracking
              body movement.
            </li> */}
          </ul>
          <p>
            Please provide feedback at <strong>admin@kurku.tech</strong>
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

export default WhatIsKurku;
