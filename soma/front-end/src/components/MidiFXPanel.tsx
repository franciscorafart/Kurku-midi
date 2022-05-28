import { Container, EffectConnect, EffectContainer, CloseX, EffectBox } from './shared'
import midiSession from "atoms/midiSession";
import { useRecoilValue, useRecoilState } from "recoil";
import selectedMidiEffect from 'atoms/selectedMidiEffect';

const firstUpperCase = (t: string) => t[0].toLocaleUpperCase().concat(t.slice(1))
function MidiFXPanel() {
  const midiSessionConfig = useRecoilValue(midiSession);
  const [selected, setSelected] = useRecoilState(selectedMidiEffect);

    const midiFX = midiSessionConfig.midi
    const handleDisconnect = () => {
        // Remove midi effect from recoil state
    }

    return (
        <Container>
            {midiFX.map((mEff) => (
                <EffectConnect key={`midi-effect-${mEff.controller}`}>
                    <EffectContainer selectable selected={
              mEff.controller === selected.controller && mEff.bodyPart === selected.bodyPart
            }>
                        <CloseX onClick={handleDisconnect}>X</CloseX>
                        <EffectBox
              onClick={() =>
                setSelected({ controller: mEff.controller, bodyPart: mEff.bodyPart })
              }
              key={`${mEff.controller}-${mEff.bodyPart}`}
              selectable
            >
              {firstUpperCase(mEff.bodyPart)} | CC: {mEff.controller} | {mEff.direction.toUpperCase()} Axis
            </EffectBox>
                    </EffectContainer>
                </EffectConnect>
            ))}
        </Container>
    )
}

export default MidiFXPanel;