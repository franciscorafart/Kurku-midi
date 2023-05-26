import { useMemo } from "react";
import { useRecoilState, useSetRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import selectedMidiEffect from "atoms/selectedMidiEffect";
import midiEffects from "atoms/midiEffects";
import {
  Button,
  ButtonGroup,
  Form,
  Offcanvas,
  ToggleButton,
  InputGroup,
  Col,
} from "react-bootstrap";
import { isEmpty } from "lodash";
import { BodyPartEnum } from "config/shared";
import { CCEffectType } from "config/midi";
import { useFormik } from "formik";

const UpperBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;
const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-content: space-between;
`;

const BtnGroup = styled(ButtonGroup)`
  padding-left: 8px;
`;

const MidiForm = ({
  initialEffect,
  idxEffect,
}: {
  initialEffect: CCEffectType;
  idxEffect: number;
}) => {
  const [fx, setFx] = useRecoilState(midiEffects);
  const setSelected = useSetRecoilState(selectedMidiEffect);

  const formik = useFormik({
    initialValues: {
      bodyPart: initialEffect.bodyPart,
      channel: initialEffect.channel,
      cc: initialEffect.controller,
      direction: initialEffect.direction,
      screenRangeMin: initialEffect.screenRange.a,
      screenRangeMax: initialEffect.screenRange.b,
      scaleFactorX: initialEffect.valueRange.x,
      scaleFactorY: initialEffect.valueRange.y,
    },
    onSubmit: (values) => {
      const newFx = [...fx];
      newFx[idxEffect] = {
        ...initialEffect,
        bodyPart: values.bodyPart,
        channel: values.channel,
        controller: values.cc,
        direction: values.direction,
        screenRange: {
          a: values.screenRangeMin,
          b: values.screenRangeMax,
        },
        valueRange: {
          x: values.scaleFactorX,
          y: values.scaleFactorY,
        },
      };
      setFx(newFx);
      setSelected("");
    },
    validate: (values) => {
      const errors: { [index: string]: string } = {};
      if (values.channel < 1 || values.channel > 16) {
        errors.channel = "Out of range";
      }

      if (values.channel - Math.floor(values.channel) !== 0) {
        errors.channel = "Use Integers";
      }

      if (values.cc > 127 || values.cc < 0) {
        errors.cc = "Out of range";
      }

      if (values.cc - Math.floor(values.cc) !== 0) {
        errors.cc = "Use Integers";
      }

      if (values.screenRangeMax <= values.screenRangeMin) {
        errors.screenRangeMin = "Larger than max value";
        errors.screenRangeMax = "Lower than min value";
      }
      if (values.screenRangeMin < 0 || values.screenRangeMin > 1) {
        errors.screenRangeMin = "Out of range";
      }
      if (values.screenRangeMax < 0 || values.screenRangeMax > 1) {
        errors.screenRangeMax = "Out of range";
      }

      if (values.scaleFactorY < 0 || values.scaleFactorY > 127) {
        errors.scaleFactorY = "Out of range";
      }
      if (values.scaleFactorX < 0 || values.scaleFactorX > 127) {
        errors.scaleFactorX = "Out of range";
      }
      if (values.scaleFactorX >= values.scaleFactorY) {
        errors.scaleFactorY = "Larger than max value";
        errors.scaleFactorX = "Lower than min value";
      }

      if (values.scaleFactorY - Math.floor(values.scaleFactorY) !== 0) {
        errors.scaleFactorY = "Use integers";
      }
      if (values.scaleFactorX - Math.floor(values.scaleFactorX) !== 0) {
        errors.scaleFactorX = "Use integers";
      }

      return errors;
    },
  });

  return (
    <Form onSubmit={formik.handleSubmit}>
      <UpperBody>
        <Form.Group className="mb-4">
          <Form.Label>Body Part</Form.Label>
          <Form.Select
            id="bodyPart"
            name="bodyPart"
            title={BodyPartEnum[formik.values.bodyPart]}
            onChange={formik.handleChange}
          >
            {Object.entries(BodyPartEnum).map(([key, name]) => (
              <option
                key={key}
                value={key}
                selected={key === formik.values.bodyPart}
              >
                {name}
              </option>
            ))}
          </Form.Select>
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
          <Form.Label>CC Control (0-127)</Form.Label>
          <InputGroup hasValidation>
            <Form.Control
              id="cc"
              name="cc"
              type="number"
              value={formik.values.cc}
              onChange={formik.handleChange}
              isInvalid={Boolean(formik.errors.cc)}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.cc}
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label>Axis</Form.Label>
          <BtnGroup>
            <ToggleButton
              id="directionX"
              name="direction"
              type="radio"
              value="x"
              checked={formik.values.direction === "x"}
              onChange={formik.handleChange}
            >
              Horizontal
            </ToggleButton>
            <ToggleButton
              id="directionY"
              type="radio"
              name="direction"
              value="y"
              checked={formik.values.direction === "y"}
              onChange={formik.handleChange}
            >
              Vertical
            </ToggleButton>
          </BtnGroup>
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label>Screen Range (0.0 - 1.0)</Form.Label>
          <InputGroup as={Col} md="6" hasValidation>
            <InputGroup.Text id="inputGroupPrepend">Min</InputGroup.Text>
            <Form.Control
              id="screenRangeMin"
              name="screenRangeMin"
              type="number"
              value={formik.values.screenRangeMin}
              onChange={formik.handleChange}
              isInvalid={Boolean(formik.errors.screenRangeMin)}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.screenRangeMin}
            </Form.Control.Feedback>
          </InputGroup>
          <InputGroup as={Col} md="6" hasValidation>
            <InputGroup.Text id="inputGroupPrepend">Max</InputGroup.Text>
            <Form.Control
              id="screenRangeMax"
              name="screenRangeMax"
              type="number"
              value={formik.values.screenRangeMax}
              onChange={formik.handleChange}
              isInvalid={Boolean(formik.errors.screenRangeMax)}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.screenRangeMax}
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
              id="scaleFactorX"
              name="scaleFactorX"
              type="number"
              value={formik.values.scaleFactorX}
              onChange={formik.handleChange}
              isInvalid={Boolean(formik.errors.scaleFactorX)}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.scaleFactorX}
            </Form.Control.Feedback>
          </InputGroup>
          <InputGroup hasValidation>
            <InputGroup.Text id="inputGroupPrepend">
              Upper bound
            </InputGroup.Text>
            <Form.Control
              id="scaleFactorY"
              name="scaleFactorY"
              type="number"
              value={formik.values.scaleFactorY}
              onChange={formik.handleChange}
              isInvalid={Boolean(formik.errors.scaleFactorY)}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.scaleFactorY}
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
      </UpperBody>
      <Footer>
        <Button variant="secondary" onClick={() => setSelected("")}>
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={!isEmpty(formik.errors)}
        >
          Save
        </Button>
      </Footer>
    </Form>
  );
};

function BodyTrackingMidiPanel() {
  const [selected, setSelected] = useRecoilState(selectedMidiEffect);
  const fx = useRecoilValue(midiEffects);

  const idxEffect = useMemo(() => {
    return fx.findIndex((eff) => selected === eff.uid);
  }, [fx, selected]);

  const effect = idxEffect !== undefined ? fx[idxEffect] : undefined;

  return (
    <Offcanvas
      show={!isEmpty(selected)}
      placement="end"
      onHide={() => setSelected("")}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>MIDI Effect Configuration</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <BodyContainer>
          {effect && <MidiForm initialEffect={effect} idxEffect={idxEffect} />}
        </BodyContainer>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default BodyTrackingMidiPanel;
