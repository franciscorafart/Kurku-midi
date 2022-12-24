import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function NewVersionModal({
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
          <Modal.Title>App Updated!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            The app was updated. Please refresh to get the latest improvements
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Refresh
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default NewVersionModal;
