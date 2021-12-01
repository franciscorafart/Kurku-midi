import { initAudio, initMicAudio } from './audio-ctx.js';
import { initBodyTracking } from './bodytracking.js';

const btnStems = document.getElementById('btn');
const btnMic = document.getElementById('btn-mic');

btnStems.addEventListener('click', async () => {
    try {
        const [audioCtx, sounds, playAll] = await initAudio();
        await initBodyTracking(sounds, audioCtx);
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
        await initBodyTracking(sounds, audioCtx);
    } catch (e) {
        throw e;
    }

    btnStems.hidden = true;
    btnMic.hidden = true;
});


