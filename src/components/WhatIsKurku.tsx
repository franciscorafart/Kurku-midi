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
            This software allows you to map the position of different body parts
            to MIDI continuous control messages (CC) using just your webcam.
          </p>
          <h4>Paid Tier</h4>
          <p>Paying users get a few extra features:</p>
          <ul>
            <li>
              <h5>Offline use</h5>You don't need an internet connection, Kurku
              runs like a desktop app on your browser for paying users.
            </li>
            <li>
              <h5>Session saving:</h5>Save your confgurations and don't waste
              time setting it up next time you use Kurku.
            </li>
            <li>
              <h5>More accuracy:</h5>Use more precise algorithms for tracking
              body movement.
            </li>
          </ul>
          <h4>MetaMask login</h4>
          <p>
            We use the MetaMask crypto wallet to authenticate users that want to
            access the Paid Tier. By using MetaMask we avoid storing your
            personal information. Crypto payments coming soon{" "}
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
