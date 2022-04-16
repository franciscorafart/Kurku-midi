import styled from 'styled-components';
import sessionConfig from "atoms/sessionConfig";
import { useRecoilValue, useRecoilState } from "recoil";
import selectedEffect from 'atoms/selectedEffect';

const Container = styled.div`
    display: flex;
    flex: wrap;
    padding: 20px;
    // justify-content: space-between;
    min-height: 300px;
    border: 1px solid black;
`;

const EffectConnect = styled.div`
    display: flex;
`
const EffecContainer = styled.div<{selected: boolean, selectable?: boolean}>`
    display: flex;
    height: 80px;
    width: 160px;
    align-items: center;
    justify-content: center;
    border: 1px solid ${({ selected }) => selected ? 'red' : 'blue'};
    border-radius: 5px;
    cursor: ${({ selectable }) => selectable ? 'pointer' : 'auto'};
`;
const Cable = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80px;
    width: 40px;
`

function AudioFXPanel() {
    const sessionCfg = useRecoilValue(sessionConfig);
    const [selected, setSelected] = useRecoilState(selectedEffect)

    console.log('sessionCfg', sessionCfg)
    return (
        <Container>
            {sessionCfg.effects.map(
                eff => 
                <EffectConnect>
                    <EffecContainer 
                        selected={eff.key === selected.key && eff.bodyPart === selected.bodyPart}
                        onClick={() => setSelected({ key: eff.key, bodyPart: eff.bodyPart})} 
                        key={`${eff.key}-${eff.bodyPart}`}
                        selectable
                        >{eff.key}-{eff.bodyPart}
                    </EffecContainer>
                    <Cable>{`==>`}</Cable>
                </EffectConnect>)
            }
            <EffecContainer selected={false}>Master</EffecContainer>
        </Container>
    );
};

export default AudioFXPanel;