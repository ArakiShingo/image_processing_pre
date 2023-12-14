const cameraWidth = 300;
const cameraHeight = 400;

const cameraInitSmartphoneSupport = () => {
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
