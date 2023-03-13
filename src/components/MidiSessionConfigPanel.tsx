import { useRecoilState } from "recoil";
import {
  ButtonGroup,
  Offcanvas,
  OverlayTrigger,
  ToggleButton,
  Tooltip,
} from "react-bootstrap";
import { QuestionCircle } from "react-bootstrap-icons";
import styled from "styled-components";
import sessionConfig from "atoms/sessionConfig";

const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-content: space-between;
`;

const Label = styled.span``;

const LabelContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
`;

function MidiSessionConfigPanel({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  const [sessionCfg, setSessionCfg] = useRecoilState(sessionConfig);

  return (
    <Offcanvas show={show} placement="start" onHide={onClose}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Computer Speed Configuration</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <BodyContainer>
          <LabelContainer>
            <Label>Computer speed</Label>
            <OverlayTrigger
              key={"right"}
              placement={"right"}
              overlay={
                <Tooltip id="tooltip-right">
                  You can use a less accurate but faster body-tracking model for
                  slower machines.
                </Tooltip>
              }
            >
              <QuestionCircle />
            </OverlayTrigger>
          </LabelContainer>
          <ButtonGroup>
            <ToggleButton
              id={`radio-slow`}
              type="radio"
              name="Slow"
              value="slow"
              checked={sessionCfg.machineType === "slow"}
              onChange={() =>
                setSessionCfg({ ...sessionCfg, machineType: "slow" })
              }
            >
              Slow
            </ToggleButton>
            <ToggleButton
              id={`radio-decent`}
              type="radio"
              name="Decent"
              value="decent"
              checked={sessionCfg.machineType === "decent"}
              onChange={() =>
                setSessionCfg({ ...sessionCfg, machineType: "decent" })
              }
            >
              Decent
            </ToggleButton>
            <ToggleButton
              id={`radio-fast`}
              type="radio"
              name="Fast"
              value="fast"
              checked={sessionCfg.machineType === "fast"}
              onChange={() =>
                setSessionCfg({ ...sessionCfg, machineType: "fast" })
              }
            >
              Fast
            </ToggleButton>
            <ToggleButton
              id={`radio-beast`}
              type="radio"
              name="Beast"
              value="beast"
              checked={sessionCfg.machineType === "beast"}
              onChange={() =>
                setSessionCfg({ ...sessionCfg, machineType: "beast" })
              }
            >
              Beast
            </ToggleButton>
          </ButtonGroup>
        </BodyContainer>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default MidiSessionConfigPanel;
