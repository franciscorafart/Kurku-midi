import { initAudio, initMicAudio } from './audio-ctx.js';
import { initBodyTracking } from './bodytracking.js';

const btnStems = document.getElementById('btn');
const btnMic = document.getElementById('btn-mic');
let machineType = 'slow'; // fast / decent / slow

// TODO: Add radio buttons to chose machine speed

btnStems.addEventListener('click', async () => {
    try {
        const [audioCtx, sounds, playAll] = await initAudio(128);
        await initBodyTracking(sounds, audioCtx, machineType);
        playAll();
    } catch (e) {
        throw e;
    }

    btnStems.hidden = true;
    btnMic.hidden = true;
});

btnMic.addEventListener('click', async () => {
    try {
        const [audioCtx, sounds] = await initMicAudio();
        await initBodyTracking(sounds, audioCtx, machineType);
    } catch (e) {
        throw e;
    }

    btnStems.hidden = true;
    btnMic.hidden = true;
});


