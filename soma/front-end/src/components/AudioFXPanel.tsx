import styled from 'styled-components';
import sessionConfig from "atoms/sessionConfig";
import { useRecoilValue, useRecoilState } from "recoil";
import selectedEffect from 'atoms/selectedEffect';

const Container = styled.div`
    display: flex;
    flex: wrap;
    justify-content: space-between;
    gap: 20px;
    min-height: 300px;
    border: 1px solid black;
`;

const EffecContainer = styled.div<{selected: boolean}>`
    height: 80px;
    width: 160px;
    border: 1px solid ${({ selected }) => selected ? 'red' : 'blue'};
    border-radius: 5px;
    cursor: pointer;
`;

function AudioFXPanel() {
    const sessionCfg = useRecoilValue(sessionConfig);
    const [selected, setSelected] = useRecoilState(selectedEffect)

    console.log('sessionCfg', sessionCfg)
    return (
        <Container>
            {sessionCfg.effects.map(
                eff => <EffecContainer 
                    selected={eff.key === selected.key && eff.bodyPart === selected.bodyPart}
                    onClick={() => setSelected({ key: eff.key, bodyPart: eff.bodyPart})} 
                    key={`${eff.key}-${eff.bodyPart}`}
                >{eff.key}-{eff.bodyPart}
                </EffecContainer>)}
        </Container>
    );
};

export default AudioFXPanel;