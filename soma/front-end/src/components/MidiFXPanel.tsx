import { useCallback } from 'react';
import { Container, EffectConnect, EffectContainer, EffectBox } from './shared'
import midiSession from "atoms/midiSession";
import { useRecoilState} from "recoil";
import selectedMidiEffect from 'atoms/selectedMidiEffect';
import CloseButton from 'react-bootstrap/CloseButton'


const firstUpperCase = (t: string) => t[0].toLocaleUpperCase().concat(t.slice(1))
function MidiFXPanel() {
  const [selected, setSelected] = useRecoilState(selectedMidiEffect);
  const [midiSessionConfig, setMidiSessionConfig] = useRecoilState(midiSession)
    const handleDisconnect = useCallback((controller: number) => {
        const idxOfRemove = midiSessionConfig.midi.findIndex(msc => msc.controller === controller)
        const newMidiFx = [...midiSessionConfig.midi]

        if (idxOfRemove !== undefined) {
            newMidiFx.splice(idxOfRemove, 1)
            setMidiSessionConfig({...midiSessionConfig, midi: newMidiFx})
        }
    }, [midiSessionConfig, setMidiSessionConfig])

    return (
        <Container>
            {midiSessionConfig.midi.map((mEff) => (
                <EffectConnect key={`midi-effect-${mEff.controller}`}>
                    <EffectContainer selectable selected={
              mEff.controller === selected.controller && mEff.bodyPart === selected.bodyPart
            }>
                <CloseButton onClick={() => handleDisconnect(mEff.controller)} />
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