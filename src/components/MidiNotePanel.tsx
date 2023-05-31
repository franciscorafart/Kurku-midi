import { useCallback } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import styled from "styled-components";
import dirtyAtom from "atoms/dirty";
import selectedMidiNote from "atoms/selectedMidiNote";
import midiNotes from "atoms/midiNotes";
import { Button, Form, Offcanvas, InputGroup, Col } from "react-bootstrap";
import { isEmpty } from "lodash";
import { defaultMidiNote } from "config/midi";
import { useFormik } from "formik";

const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-content: space-between;
`;

const UpperBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const MidiNoteForm = ({ noteValue }: { noteValue: number }) => {
  const [notes, setNotes] = useRecoilState(midiNotes);
  const setSelectedNoteValue = useSetRecoilState(selectedMidiNote);
  const setDirty = useSetRecoilState(dirtyAtom);

  const noteExists = Boolean(notes[noteValue]);
  const startingNote = notes[noteValue] || {
    ...defaultMidiNote,
    note: noteValue,
  };

  const removeNote = useCallback(() => {
    const newNotes = { ...notes };
    delete newNotes[noteValue];

    setNotes(newNotes);
    setSelectedNoteValue(null);
  }, [noteValue, notes, setNotes, setSelectedNoteValue]);

  const formik = useFormik({
    initialValues: {
      channel: startingNote.channel,
      note: startingNote.note,
      xMin: startingNote.box.xMin,
      xMax: startingNote.box.xMax,
      yMin: startingNote.box.yMin,
      yMax: startingNote.box.yMax,
    },
    onSubmit: (values) => {
      const newNotes = { ...notes };

      newNotes[values.note] = {
        note: values.note,
        channel: values.channel,
        box: {
          xMin: values.xMin,
          xMax: values.xMax,
          yMin: values.yMin,
          yMax: values.yMax,
        },
      };

      setDirty(true);
      setNotes(newNotes);
      setSelectedNoteValue(null);
    },
    validate: (values) => {
      const errors: { [index: string]: string } = {};
      if (values.channel < 1 || values.channel > 16) {
        errors.channel = "Out of range";
      }

      if (values.channel - Math.floor(values.channel) !== 0) {
        errors.channel = "Use Integers";
      }

      if (values.note > 127 || values.note < 0) {
        errors.note = "Out of range";
      }

      if (values.note - Math.floor(values.note) !== 0) {
        errors.note = "Use Integers";
      }

      if (values.xMax <= values.xMin) {
        errors.xMin = "Larger than max value";
        errors.xMax = "Lower than min value";
      }
      if (values.xMin < 0 || values.xMin > 1) {
        errors.screenRangeMin = "Out of range";
      }
      if (values.xMax < 0 || values.xMax > 1) {
        errors.xMax = "Out of range";
      }

      if (values.yMax <= values.xMin) {
        errors.yMin = "Larger than max value";
        errors.yMax = "Lower than min value";
      }
      if (values.yMin < 0 || values.yMin > 1) {
        errors.screenRangeMin = "Out of range";
      }
      if (values.yMax < 0 || values.yMax > 1) {
        errors.yMax = "Out of range";
      }

      return errors;
    },
  });
  return (
    <Form onSubmit={formik.handleSubmit}>
      <UpperBody>
        <Form.Group>
          <Form.Label>MIDI Note: {noteValue}</Form.Label>
          <InputGroup hasValidation>
            <Form.Control
              id="note"
              name="note"
              type="number"
              value={formik.values.note}
              // onChange={formik.handleChange}
              disabled
              isInvalid={Boolean(formik.errors.note)}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.channel}
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label>Midi Channel (1-16)</Form.Label>
          <InputGroup hasValidation>
            <Form.Control
              id="channel"
              name="channel"
              type="number"
              value={formik.values.channel}
              onChange={formik.handleChange}
              isInvalid={Boolean(formik.errors.channel)}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.channel}
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label>Screen Range (0.0 - 1.0)</Form.Label>
          <InputGroup as={Col} md="6" hasValidation>
            <InputGroup.Text id="inputGroupPrepend">Min</InputGroup.Text>
            <Form.Control
              id="xMin"
              name="xMin"
              type="number"
              value={formik.values.xMin}
              onChange={formik.handleChange}
              isInvalid={Boolean(formik.errors.xMin)}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.xMin}
            </Form.Control.Feedback>
          </InputGroup>
          <InputGroup as={Col} md="6" hasValidation>
            <InputGroup.Text id="inputGroupPrepend">Max</InputGroup.Text>
            <Form.Control
              id="xMax"
              name="xMax"
              type="number"
              value={formik.values.xMax}
              onChange={formik.handleChange}
              isInvalid={Boolean(formik.errors.xMax)}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.xMax}
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label>Output Range (0 - 127)</Form.Label>
          <InputGroup hasValidation>
            <InputGroup.Text id="inputGroupPrepend">
              Lower bound
            </InputGroup.Text>
            <Form.Control
              id="yMin"
              name="yMin"
              type="number"
              value={formik.values.yMin}
              onChange={formik.handleChange}
              isInvalid={Boolean(formik.errors.yMin)}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.yMin}
            </Form.Control.Feedback>
          </InputGroup>
          <InputGroup hasValidation>
            <InputGroup.Text id="inputGroupPrepend">
              Upper bound
            </InputGroup.Text>
            <Form.Control
              id="yMax"
              name="yMax"
              type="number"
              value={formik.values.yMax}
              onChange={formik.handleChange}
              isInvalid={Boolean(formik.errors.yMax)}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.yMax}
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
      </UpperBody>
      <Footer>
        {noteExists && (
          <Button variant="danger" onClick={removeNote}>
            Remove
          </Button>
        )}
        <Button variant="secondary" onClick={() => setSelectedNoteValue(null)}>
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={!isEmpty(formik.errors)}
        >
          {noteExists ? "Overwrite Note" : "Add Note"}
        </Button>
      </Footer>
    </Form>
  );
};

function MidiNotePanel() {
  const [selected, setSelected] = useRecoilState(selectedMidiNote);

  return (
    <Offcanvas
      show={selected !== null}
      placement="end"
      onHide={() => setSelected(null)}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>MIDI Note Configuration</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <BodyContainer>
          {selected !== null && <MidiNoteForm noteValue={selected} />}
        </BodyContainer>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default MidiNotePanel;
