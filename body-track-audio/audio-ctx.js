// class Audio {
//     static context = new (window.AudioContext || window.webkitAudioContext)();
//     // TODO: Add Limiter to master gain node
//     static initializeMasterGain(){
//         this.masterGainNode = this.context.createGain();
//         this.masterGainNode.connect(this.context.destination);
//         this.masterGainNode.gain.setValueAtTime(1, this.context.currentTime);
//     }
// }

const _getFile = async (audioCtx, filepath) => {
    const response = await fetch(filepath);
    const arrayBuffer = await response.arrayBuffer();
    let audioBuffer;
    try {
        audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    } catch (e){
        console.error(e)
    }

    return audioBuffer;
}

const addAudioBuffer = async (audioCtx, filepath) => {
    const buffer = await _getFile(audioCtx, filepath);
    return buffer;
}

const playBuffer = (audioCtx, masterGainNode, buffer, time) => {
    const stemAudioSource = audioCtx.createBufferSource();
    stemAudioSource.buffer = buffer;

    stemAudioSource.loop = true;

    const panNode = audioCtx.createStereoPanner();
    panNode.pan.setValueAtTime(0, audioCtx.currentTime);

    const stemGainNode = audioCtx.createGain();
    stemGainNode.gain.setValueAtTime(1, audioCtx.currentTime);

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    // analyser.fftSize = 126;

    const bufferLength = analyser.frequencyBinCount;

    // NOTE: Maybe I don't need this here?
    var dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    // Singal chain
    stemAudioSource.connect(analyser);
    analyser.connect(panNode);
    panNode.connect(stemGainNode);
    stemGainNode.connect(masterGainNode);

    stemAudioSource.start(time);

    // Return gain and panning controls so that the UI can manipulate them
    return [panNode, stemGainNode, analyser];
}

////
export const initAudio = async () => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const masterGainNode = context.createGain();
    masterGainNode.connect(context.destination);
    masterGainNode.gain.setValueAtTime(1, context.currentTime);

    const files = [
        'assets/sound1.wav',
    ]

    const allSounds = [];

    for (const file of files) {
        await addAudioBuffer(context, file).then(buffer => {
            allSounds.push({
                panNode: undefined,
                gainNode: undefined,
                analyser: undefined,
                audioBuffer: buffer,
                start: 0,
            })
        })
    }

    for (const [idx, sound] of allSounds.entries()) {
        const [panNode, gainNode, analyser] = playBuffer(context, masterGainNode, sound.audioBuffer, sound.start);

        allSounds[idx].panNode = panNode;
        allSounds[idx].gainNode = gainNode;
        allSounds[idx].analyser = analyser;
    }

    return [context, allSounds];
}