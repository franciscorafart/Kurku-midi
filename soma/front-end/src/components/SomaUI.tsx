import React, { useEffect } from 'react';
import styled from 'styled-components';
import { initAudio, initMicAudio } from '../utils/audioCtx';
import { sessionConfig } from '../utils/configUtils';
import AudioFXPanel from './AudioFXPanel';
import BodyTrackingPanel from './BodyTrackingPanel';
import { initBodyTracking, setupCamera } from '../utils/bodytracking'

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

// const Video = styled.video``
// const Canvas = styled.canvas``

const canvas = document.createElement('canvas');
const video = document.createElement('video');

// const makeVideo = ({w, h}: {w: number, h: number}) => (<Video width={w} height={h}/>)
// const makeCanvas = ({w, h}: {w: number, h: number}) => (<Canvas width={w} height={h}/>)

function SomaUI() {
    // const video = makeVideo({w: window.innerWidth, h: window.innerHeight});
    // const video = document.createElement('video');
    // const canvas = makeCanvas({w: window.innerWidth, h: window.innerHeight});
    // const canvas = document.createElement('canvas');


    useEffect(() => {
        const initAll = async () => {
            const audioCtx = await initAudio(sessionConfig);
            await setupCamera(video);

            video.width = window.innerWidth;
            video.height = window.innerHeight;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // TODO: hide video

            video.play();
            
            initBodyTracking(
                sessionConfig, 
                audioCtx, 
                'slow',
                canvas,
                video,
            )
        }

        initAll();
    }, [])

    return (<Container>
        <BodyTrackingContainer>
            {video}
            {canvas}
            <BodyTrackingPanel />
        </BodyTrackingContainer>
        <AudioFXPanel />
    </Container>

    );  
}

export default SomaUI;