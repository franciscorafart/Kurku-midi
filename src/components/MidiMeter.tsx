import styled from "styled-components";
import theme from "config/theme";
import { useRecoilValue } from "recoil";
import muteMidi from "atoms/muteMidi";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24px;
`;

const MeterContainer = styled.div<{ muted: boolean }>`
  height: 100%;
  display: flex;
  align-items: flex-end;
  heigth: 20px;
  width: 8px;
  border: 1px solid ${theme.border};
`;
type Variant = "input" | "output";
const MeterDiv = styled.div<{ pct: number; variant: Variant }>`
  background-color: ${({ variant }) =>
    variant === "input" ? "blue" : "green"};
  width: 100%;
  height: ${({ pct }) => Math.floor(100 * pct)}%;
`;

const Span = styled.span`
  font-size: 8px;
`;

type MidiMeterProps = {
  value: number;
  base?: number;
  variant?: Variant;
  cap?: boolean;
};

export default function Meter({
  value = 0,
  base = 1,
  variant = "output",
  cap,
}: MidiMeterProps) {
  const muted = useRecoilValue(muteMidi);
  const pct = value / base;
  return (
    <Container>
      {!muted && (
        <>
          <Span>{variant === "input" ? "IN" : "OUT"}</Span>
          <MeterContainer muted={muted}>
            <MeterDiv variant={variant} pct={pct} />
          </MeterContainer>
          <Span>{cap ? Math.floor(value) : value.toFixed(2)}</Span>
        </>
      )}
    </Container>
  );
}
