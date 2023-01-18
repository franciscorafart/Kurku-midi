import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function MobileWarning() {
  return (
    <Modal show>
      <Modal.Header>
        <Modal.Title>Welcome to Kurku</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h6>Kurku is a Desktop browser app!</h6>
        <p>
          Kurku was designed to work as a desktop browser app due to performance
          issues and because of inconsistent support of the Web MIDI api on
          mobile devices (thanks Apple)
        </p>
        <p>
          Please use the app on a desktop computer using Chromium based browsers
          (Chrome, Brave) or the latest version of Firefox
        </p>
      </Modal.Body>
    </Modal>
  );
}

export default MobileWarning;
