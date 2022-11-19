import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export type ConfirmationModalBaseProps = {
  type: string;
  text: string;
  title: string;
  onCancel: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm?: () => void;
};

type ConfirmationModalProps = ConfirmationModalBaseProps & {
  type: string;
  show: boolean;
};

function ConfirmationModal({
  show,
  text,
  title = "",
  onCancel,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  onConfirm,
}: ConfirmationModalProps) {
  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>{text}</p>
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={onCancel} variant="secondary">
          {cancelButtonText}
        </Button>
        {onConfirm && (
          <Button onClick={onConfirm} variant="primary">
            {confirmButtonText}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmationModal;
