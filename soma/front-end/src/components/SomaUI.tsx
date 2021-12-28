import React from 'react';
import styled from 'styled-components';

import AudioFXPanel from './AudioFXPanel';
import BodyTrackingPanel from './BodyTrackingPanel';

const Container = styled.div`
    width: 100%;
    height: 700px;
    display: flex;
`;

const BodyTrackingContainer = styled.div`
    width: 75%;
    display: flex;
    flex-direction: column;
`;

function SomaUI() {
    return (<Container>
        <BodyTrackingContainer>
            <div>Canvas here</div>
            <BodyTrackingPanel />
        </BodyTrackingContainer>
        <AudioFXPanel />
    </Container>

    );  
}

export default SomaUI;