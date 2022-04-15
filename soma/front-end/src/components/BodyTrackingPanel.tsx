import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import selectedEffect from 'atoms/selectedEffect';
import sessionConfig from "atoms/sessionConfig";
import { useMemo } from 'react';

const Container = styled.div`
    width: 25%;
    // background-color: gray;
`;

const InputContainer = styled.div`
    display: flex;
`

const Input = styled.input`

`

const Title = styled.h2``

const Label = styled.label``

function BodyTrackingPanel() {
    const selected = useRecoilValue(selectedEffect);
    const sessionCfg = useRecoilValue(sessionConfig);

    const effect = useMemo(() => {
        if (sessionCfg.effects) {
            return sessionCfg.effects.find(eff => selected.key === eff.key && selected.bodyPart === eff.bodyPart)
        }
    }, [selected])
    // TODO: State setter out of selected element onInputChange

    return (
        <Container>
           <Title>{selected.key}-{selected.bodyPart}</Title>
           <Label>Screen Range</Label>
           <InputContainer>
            <Input type='number' value={effect?.screenRange.a}/>
            <Input type='number'value={effect?.screenRange.b}/>
           </InputContainer>
           <Label>Output Range</Label>
           <InputContainer>
                <Input type='number' value={effect?.screenRange.a}/>
                <Input type='number' value={effect?.screenRange.a}/>
           </InputContainer>
        </Container>
    );
}

export default BodyTrackingPanel;