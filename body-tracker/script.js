let video;
let model;

// TODO: default values more speed, less accuracy
// const net = await posenet.load({
//     architecture: 'MobileNetV1',
//     outputStride: 16,
//     inputResolution: { width: 640, height:480 },
//     multiplier: 0.75,
// });

// Single Pose
// 'image' can be a html image, video, or canvas
// const pose = await net.estimateSinglePose(image, {
//     flipHorizontal: false,  // True for webcam, because it's flipped
// });

// Multiple poses
// const pose = await net.estimateMultiplePoses(image, {
//     flipHorizontal: false,
//     maxDetections: 5, // default 5
//     scoreThreshold: 0.5, // 0.5 default
//     rmsRadius: 20, // amount of pixels multiple poses detected
// });

console.log('running the script')
const init = async () => {
    video = await loadVideo();
    model = await posenet.load();
    main();
}

const loadVideo = async () => {
    const video = await setupCamera();
    console.log('3')
    video.play();
    return video;
}

const setupCamera = async () => {
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
            'Browser API navigator.mediaDevices.getUserMedia not available'
        )
    }

    video = document.getElementById('video');
    video.width = window.innerWidth;
    video.height = window.innerHeight;

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: 'user',
            width: window.innerWidth,
            height: window.innerHeight,
        },
    });

    video.srcObject = stream;

    return new Promise(
        resolve => (video.onloadedmetadata = () =>
        resolve(video))
    );
}

init();

const main = () => {
    console.log('main executed')
    model.estimateMultiplePoses(video, {
        flipHorizontal: true,
    }).then(pose => {
        console.log(pose);
    });

    requestAnimationFrame(main);
};










