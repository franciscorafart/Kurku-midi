window.AudioContext - window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia; // navigator.getUserMedia is deprecated

let analyser;
const canvas = document.getElementById('canvas');
const effectDisplay = document.getElementById('effect');

const ctx = canvas.getContext('2d');
let imageData;

// NOTE: Get audio and show in spectrogram

document.body.onclick = async () => {
    const audioctx = new window.AudioContext();
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
    });

    const source = audioctx.createMediaStreamSource(stream);

    analyser = audioctx.createAnalyser(); // Fast fouried transform
    analyser.smoothingTimeConstant = 0;

    source.connect(analyser);
    analyser.fftSize = 1024;
    getAudioData();
}

// Function to get audio data an return frequency
function getAudioData() {
    const freqdata = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqdata);

    // Spectrogram
    // 1. Get the current image and skip the first pixel column, draw it to 0,0
    // This is like moving the image 1px to the left
    console.log('freqdata', freqdata)
    plotSpectrogram(freqdata);
    requestAnimationFrame(getAudioData); // To continously call the function and update the data
}

function plotSpectrogram(freqData) {
    // Spectrogram
    // 1. Get the current image and skip the first pixel column, draw it to 0,0
    // This is like moving the image 1px to the left
    imageData = ctx.getImageData(1, 0, canvas.width - 1, canvas.height);
    ctx.putImageData(imageData, 0, 0);

    for (let i = 0; i < freqData.length; i++) {
        let value = (2 * freqData[i]) / 255; // color intensity value for frequency intensity at that position / bin?

        ctx.beginPath();
        ctx.strokeStyle = `rgba(${Math.max(0, 255 * value)}, ${Math.max(0, 255 * (value -1))}, 54, 255)`; // Define stroke color changing red and green
        ctx.moveTo(canvas.width -1, canvas.height - i * (canvas.height / freqData.length)); // Stgart position for stroke => Top of last pixel column for i = 0
        ctx.lineTo(canvas.width -1, canvas.height - (i * (canvas.height / freqData.length) + canvas.height / freqData.length)); // End position stroke => starting position + vertical length of one frequency
        ctx.stroke(); // Draw
    }
}

