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
          <h4>Paid Tier</h4>
          <p>Paying users get useful extra features:</p>
          <ul>
            <li>
              <h5>Offline use</h5>You don't need an internet connection, Kurku
              runs like a desktop app on your browser.
            </li>
            <li>
              <h5>Saving</h5>Save your sessions and don't waste time setting it
              up next time you use Kurku.
            </li>
            {/* <li>
              <h5>More accuracy:</h5>Use more precise algorithms for tracking
              body movement.
            </li> */}
          </ul>
          <h4>MetaMask login</h4>
          <p>
            Kurku uses MetaMask wallet to authenticate users that want to access
            the Paid Tier. By using MetaMask we avoid storing your personal
            information.
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

export default WhatIsKurku;
