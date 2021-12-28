import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    min-height: 300px;
    background-color: green;
`;

function BodyTrackingPanel() {
    return (
        <Container>
            Hello
        </Container>
    );
}

export default BodyTrackingPanel;