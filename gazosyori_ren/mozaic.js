const cameraWidth = 300;
const cameraHeight = 400;

// カメラの初期化
const cameraInit = () => {
    const video = document.getElementById("camera");

    const cameraSetting = {
        audio: false,
        video: {
            width: cameraWidth,
            height: cameraHeight,
            facingMode: "environment",
        }
    }

    navigator.mediaDevices.getUserMedia(cameraSetting)
        .then((mediaStream) => {
            video.srcObject = mediaStream;
        })
        .catch((err) => {
            console.log(err.toString());
        });
}

// モザイク処理の適用
const applyMosaic = async () => {
    // face-api.jsの初期化
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

    const video = document.getElementById("camera");

    // ビデオのフレームをキャプチャ
    const capture = () => {
        const canvas = document.createElement("canvas");
        canvas.width = cameraWidth;
        canvas.height = cameraHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, cameraWidth, cameraHeight);
        return canvas;
    };

    // // face-api.jsの初期化
    // await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    // await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    // await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

    // 顔の検出
    const detectFace = async () => {
        const canvas = capture();
        const detections = await faceapi.detectAllFaces(canvas).withFaceLandmarks().withFaceDescriptors();
        return { canvas, detections };
    };

    // モザイク処理
    const mosaic = (canvas, detections) => {
        const ctx = canvas.getContext("2d");
        detections.forEach((face) => {
            const { width, height, top, left } = face.detection.box;
            const imageData = ctx.getImageData(left, top, width, height);
            ctx.fillStyle = "rgba(255, 255, 255, 1)"; // モザイクの色
            ctx.fillRect(left, top, width, height);
            ctx.putImageData(imageData, left, top);
        });
    };

    // 顔の検出とモザイク処理を実行
    const { canvas, detections } = await detectFace();
    mosaic(canvas, detections);

    // モザイク処理されたキャンバスをビデオに表示
    video.srcObject = canvas.captureStream();
}

// 初期化
cameraInit();
