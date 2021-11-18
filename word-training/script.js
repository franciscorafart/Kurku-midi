let transferRecognizer;
let URL = 'http://127.0.0.1:8080/../activities-model';

const init = async () => {
    const baseRecognizer = speechCommands.create('BROWSER_FFT');
    // const modelURL = `${URL}/model.json`;
    // const metadataURL = `${URL}/metadata.json`;

    // const model = window.speechCommands.create(
    //     'BROWSER_FFT',
    //     undefined,
    //     modelURL,
    //     metadataURL,
    // )

    await baseRecognizer.ensureModelLoaded();
    transferRecognizer = baseRecognizer.createTransfer('colors');
    console.log('Done loading', transferRecognizer)
}

init();

const redButton = document.getElementById('red');
const blueButton = document.getElementById('blue');
const greenButton = document.getElementById('green');
const backgroundButton = document.getElementById('background');
const trainButton = document.getElementById('train');
const predictButton = document.getElementById('predict');

redButton.onclick = async () => {
    await transferRecognizer.collectExample('red')
    console.log('collected red')
};
blueButton.onclick = async () => {
    await transferRecognizer.collectExample('blue');

}
greenButton.onclick = async () => {
    await transferRecognizer.collectExample('green');
    console.log('collected green')
}

backgroundButton.onclick = async () => {
    await transferRecognizer.collectExample('_background_noise_');
    console.log('collected background')
}

trainButton.onclick = async () => {
    await transferRecognizer.train({
        epochs: 25,
        callback: {
            onEpochEnd: async (epoch, logs) => {
                console.log(`Epoch ${epoch}: loss=${logs.loss}, accuracy=${logs.acc}`);
            }
        }
    })
}

predictButton.onclick = async () => {
    await transferRecognizer.listen(
        result => {
            const words = transferRecognizer.wordLabels();
            for (let i = 0; i < words.length; ++i) {
                console.log(`score for word '${words[i]}' = ${result.scores[i]}`);
            }
        },
        {
            probabilityThreshold: 0.75,
        }
    );
};