window.AudioContext - window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia; // navigator.getUserMedia is deprecated

let analyser;
const effectDisplay = document.getElementById('effect');

let URL = 'http://127.0.0.1:8080/activities-model';
// let URL = 'file:///Users/franciscorafart/Desktop/code/recurse/audio-ai/activities-model'

async function setupModel(URL, predictionCB) {
    predictionCallback = predictionCB;
    const modelURL = `${URL}/model.json`;
    const metadataURL = `${URL}/metadata.json`;

    // Load model
    const model = window.speechCommands.create(
        'BROWSER_FFT',
        undefined,
        modelURL,
        metadataURL,
    )

    await model.ensureModelLoaded();

    const modelParameters = {
        invokeCalbackOnNoiseAndUnkown: true, // always run
        includeSpectrogram: true,
        overlapFactor: 0.5, // sample audio twice per second
    }

    model.listen(prediction => {
        console.log('prediction', prediction)
        predictionCallback(prediction.scores)
    }, modelParameters);
}

const labels = [
    'Background',
    'Delay',
    'Distortion',
    'Reverb',
]

document.body.onclick = () => {
    setupModel(URL, data => {
        const max = Math.max(...data)
        if (max > 0.7) {
            indexMax = data.indexOf(max);
            const currentPrediction = labels[indexMax];
            effectDisplay.innerHTML = currentPrediction;
        }
    })
}

