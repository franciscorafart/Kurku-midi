import styled from "styled-components";

const MeterContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: flex-end;
  heigth: 20px;
  width: 8px;
  border: 1px solid yellow;
`;
type Variant = "input" | "output";
const MeterDiv = styled.div<{ pct: number; variant: Variant }>`
  background-color: ${({ variant }) =>
    variant === "input" ? "blue" : "green"};
  width: 100%;
  height: ${({ pct }) => Math.floor(100 * pct)}%;
`;

type MidiMeterProps = {
  pct: number;
  variant?: Variant;
};

export default function Meter({ pct = 0, variant = "output" }: MidiMeterProps) {
  console.log("pct", pct);
  return (
    <MeterContainer>
      <MeterDiv variant={variant} pct={pct} />
    </MeterContainer>
  );
}
