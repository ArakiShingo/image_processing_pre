const cameraWidth = 300;
const cameraHeight = 400;
const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let mediaStream;
let detections = [];
let btn = 0; // ボタンの状態。初期状態: 0, モザイク: 1, 目黒棒: 2, コラ画像: 3

const loadModels = async () => {
  console.log('Loading models...');
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector_model-weights_manifest.json');
  console.log('TinyFaceDetector model loaded');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68_model-weights_manifest.json');
  console.log('FaceLandmark68Net model loaded');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition_model-weights_manifest.json');
  console.log('FaceRecognitionNet model loaded');
};

const setMode = (mode) => {
  btn = mode;
  updateButtonStyles();
};

const updateButtonStyles = () => {
  const buttons = document.querySelectorAll('input[type="button"]');
  buttons.forEach((button, index) => {
    if (index === btn) {
      button.classList.remove('inactive');
      button.classList.add('active');
    } else {
      button.classList.remove('active');
      button.classList.add('inactive');
    }
  });
};

const cameraInit = async () => {
  const video = document.getElementById("camera");

  // スマホからの閲覧か
  const isMobile = navigator.userAgent.match(/iPhone|Android/);

  const cameraSetting = {
    audio: false,
    video: {
      // スマホの場合は縦横を逆に設定する
      width: isMobile ? cameraHeight : cameraWidth,
      height: isMobile ? cameraWidth : cameraHeight,
      facingMode: "environment",
    },
  };

  navigator.mediaDevices.getUserMedia(cameraSetting)
    .then((mediaStream) => {
      video.srcObject = mediaStream;
    })
    .catch((err) => {
      console.log(err.toString());
    });

  try {
    const stream = await navigator.mediaDevices.getUserMedia(cameraSetting);
    mediaStream = stream;
    video.srcObject = stream;

    video.addEventListener('play', () => {
      const displaySize = { width: cameraWidth, height: cameraHeight };
      faceapi.matchDimensions(canvas, displaySize);
      setInterval(async () => {
        detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        ctx.clearRect(0, 0, cameraWidth, cameraHeight);
        ctx.drawImage(video, 0, 0, cameraWidth, cameraHeight);

        if (detections.length > 0) {
          processImage();
        }
      }, 100);
    });
  } catch (err) {
    console.log(err.toString());
  }
};

const processImage = () => {
  switch (btn) {
    case 1: // モザイク
      applyMosaic();
      break;
    case 2: // 目黒棒
      applyBlackBars();
      break;
    case 3: // コラ画像
      applyCollage();
      break;
    // 他の処理を追加
  }
};
//モザイク
const applyMosaic = () => {
    const mosaicSize = 20; // モザイクのサイズ
  
    detections.forEach((detection) => {
      const { x, y, width, height } = detection.detection.box;
      const imageData = ctx.getImageData(x, y, width, height);
  
      for (let i = 0; i < imageData.data.length; i += 4) {
        const average = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
  
        for (let j = 0; j < 3; j++) {
          imageData.data[i + j] = average;
        }
      }
  
      ctx.putImageData(imageData, x, y);
    });
  };
  
//目黒棒
const applyBlackBars = () => {
    detections.forEach((detection) => {
      const { x, y, width, height } = detection.detection.box;
      ctx.fillRect(x, y, width, height);
    });
};
  
//コラ画像
const applyCollage = () => {
    const collageImage = new Image();
    collageImage.src = 'img/nico.png'; // コラ画像のパス
  
    detections.forEach((detection) => {
      const { x, y, width, height } = detection.detection.box;
      ctx.drawImage(collageImage, x, y, width, height);
    });
  };
  

//撮影
const shoot = () => {
    // video要素
    const video = document.getElementById("camera");
    // canvas要素
    const canvas = document.getElementById("canvas");
    // canvas要素の大きさを変更
    canvas.width = cameraWidth;
    canvas.height = cameraHeight;
    // 描画用オブジェクトを取得
    const ctx = canvas.getContext("2d");

    // 描画する
    ctx.drawImage(
        video,          // データソース 
        0,              // 描画開始x座標  
        0,              // 描画開始y座標
        cameraWidth,    // 描画横サイズ
        cameraHeight    // 描画縦サイズ
    );
}
//リセット
const resetCamera = () => {
  if (mediaStream) {
    const tracks = mediaStream.getTracks();
    tracks.forEach((track) => track.stop());
    video.srcObject = null;
    mediaStream = null;
  }
};


loadModels();
cameraInit();
