import { useEffect, useMemo, useState } from "react";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import selectedMidiEffect from "atoms/selectedMidiEffect";
import midiSession from "atoms/midiSession";
import { Button, ButtonGroup, Offcanvas, DropdownButton, Dropdown, ToggleButton } from "react-bootstrap";
import { isEmpty } from "lodash";
import { BodyPartEnum, BodyPartKey } from "config/shared";
import { MidiSessionConfigType } from "config/midi";

const InputContainer = styled.div`
  display: flex;
  padding-bottom: 10px;
`;

const Input = styled.input``;

const Label = styled.label`
  display: block;
  padding-bottom: 10px;
`;

const UpperBody = styled.div`
  display: flex;
  flex-direction: column;
`

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
`
const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-content: space-between;
`

function BodyTrackingMidiPanel() {
  const [selected, setSelected] = useRecoilState(selectedMidiEffect);

  const [sessionCfg, setSessionCfg] = useRecoilState(midiSession);
  const [locSessionCfg, setLocSessionCfg] = useState<MidiSessionConfigType | undefined>(undefined)

  useEffect(() => {
    setLocSessionCfg(sessionCfg)
  }, [sessionCfg])

  const idxEffect = useMemo(() => {
      return locSessionCfg?.midi.findIndex(
        (eff) =>
          selected === eff.uid
      );
  }, [selected, locSessionCfg]);

  const effect =
    idxEffect !== undefined && locSessionCfg ? locSessionCfg.midi[idxEffect] : undefined;

  const onChangeScreen = (
    e: React.ChangeEvent<HTMLInputElement>,
    d: "a" | "b"
  ) => {
    const v = e.target.value;
    if (locSessionCfg && effect && idxEffect !== undefined) {
      const newEffects = locSessionCfg.midi.map((eff, idx) =>
        idxEffect === idx
          ? {
              ...eff,
              screenRange: { ...eff.screenRange, [d]: Number(v) },
            }
          : eff
      );
      setLocSessionCfg({
        ...locSessionCfg,
        midi: newEffects,
      });
    }
  };

  const onChangeMidiConfig = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "controller" | "channel"
  ) => {
    const v = e.target.value;
    if (locSessionCfg && effect && idxEffect !== undefined) {
      const newEffects = locSessionCfg.midi.map((eff, idx) =>
        idxEffect === idx
          ? {
              ...eff,
              [type]: Number(v),
            }
          : eff
      );
      setLocSessionCfg({
        ...locSessionCfg,
        midi: newEffects,
      });
    }
  };

  const onChangeRange = (
    e: React.ChangeEvent<HTMLInputElement>,
    d: "x" | "y"
  ) => {
    const v = e.target.value;
    if (locSessionCfg && effect && idxEffect !== undefined) {
      const newEffects = locSessionCfg.midi.map((eff, idx) =>
        idxEffect === idx
          ? {
              ...eff,
              valueRange: { ...eff.valueRange, [d]: Number(v) },
            }
          : eff
      );

      setLocSessionCfg({
        ...locSessionCfg,
        midi: newEffects,
      });
    }
  };

  const onSelectBodyPart = (bp: keyof BodyPartEnum) => {
    if (locSessionCfg && effect && idxEffect !== undefined) {
      const newEffects = locSessionCfg.midi.map((eff, idx) =>
        idxEffect === idx
          ? {
              ...eff,
              bodyPart: bp as BodyPartKey
            }
          : eff
      );

      setLocSessionCfg({
        ...locSessionCfg,
        midi: newEffects
      });

    }
  }

  const onAxisChange = (axis: "x" | "y") => {
    if (locSessionCfg && effect && idxEffect !== undefined) {
      const newEffects = locSessionCfg.midi.map((eff, idx) =>
        idxEffect === idx
          ? {
              ...eff,
              direction: axis,
            }
          : eff
      );

      setLocSessionCfg({
        ...locSessionCfg,
        midi: newEffects
      });
    }
  }

  const saveConfig = () => {
    if (locSessionCfg && effect){
      setSessionCfg(locSessionCfg)
      setSelected('')
    }
  }
  console.log('locSessionCfg', locSessionCfg)
  return (
    <Offcanvas
      show={!isEmpty(selected)}
      placement="end"
      onHide={() => setSelected('')}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>MIDI Effect Configuration</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <BodyContainer>
        <UpperBody>
        <Label>Body Part</Label>
        <InputContainer>
          <DropdownButton title={effect ?  BodyPartEnum[effect.bodyPart] : ''} onSelect={(e) => onSelectBodyPart(e as keyof BodyPartEnum)} >
            {Object.entries(BodyPartEnum).map(([key, name]) => <Dropdown.Item key={key} eventKey={key}>{name}</Dropdown.Item>)}
          </DropdownButton> 
        </InputContainer>
        <Label>Midi Channel (1-16)</Label>
        <InputContainer>
          <Input
              type="number"
              value={effect?.channel}
              onChange={(e) => onChangeMidiConfig(e, "channel")}
              />
        </InputContainer>
          <Label>CC Control (1-128)</Label>
          <InputContainer>
            <Input
              type="number"
              value={effect?.controller}
              onChange={(e) => onChangeMidiConfig(e, "controller")}
              />
          </InputContainer>
          <Label>Axis</Label>
          <InputContainer>
            <ButtonGroup>
              <ToggleButton
                id={`radio-x`}
                type="radio"
                name="X"
                value="x"
                checked={effect?.direction === "x"}
                onChange={() => onAxisChange("x")}
                >X</ToggleButton>
              <ToggleButton
                id={`radio-y`}
                type="radio"
                name="Y"
                value="y"
                checked={effect?.direction === "y"}
                onChange={() => onAxisChange("y")}
                >Y</ToggleButton>
            </ButtonGroup>
          </InputContainer>
          <Label>Screen Range</Label>
          <InputContainer>
            <Input
              type="number"
              value={effect?.screenRange.a}
              onChange={(e) => onChangeScreen(e, "a")}
              />
            <Input
              type="number"
              value={effect?.screenRange.b}
              onChange={(e) => onChangeScreen(e, "b")}
              />
          </InputContainer>
          <Label>Output Range</Label>
          <InputContainer>
            <Input
              type="number"
              value={effect?.valueRange.x}
              onChange={(e) => onChangeRange(e, "x")}
              />
            <Input
              type="number"
              value={effect?.valueRange.y}
              onChange={(e) => onChangeRange(e, "y")}
              />
          </InputContainer>
          </UpperBody>
          <Footer>
            <Button variant="primary" onClick={saveConfig}>Save</Button>
          </Footer>
          </BodyContainer>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default BodyTrackingMidiPanel;
