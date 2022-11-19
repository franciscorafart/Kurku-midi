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
          <p>Paid tier with extra features coming soon.</p>
          {/* <h4>Paid Tier</h4>
          <p>Paying users get a few extra features:</p>
          <ul>
            <li>Offline use</li>
            <li>Session saving</li>
            <li>Faster tracking algorithms</li>
          </ul> */}
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
