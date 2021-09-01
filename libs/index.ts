const image = document.querySelector<HTMLImageElement>('#image-box img');
const video = document.querySelector<HTMLVideoElement>('#image-box video');
const controls = document.querySelector<HTMLElement>('#image-controls-box');
const resultBox = document.querySelector<HTMLElement>('#result-box');

const CORS_API_URL = 'https://cors-anywhere-clone.herokuapp.com/';

let stream: QrScanner;
// let streamTimer = -1;

function triggerImageInput(event: KeyboardEvent | MouseEvent & { code?: any }) {
  if (event.code && event.code !== 'Enter' && event.code !== 'Space') return;
  if (stream) { video.classList.toggle('mirror'); return }
  controls.querySelector('input').click();
}

function switchToDevice({code}: KeyboardEvent) {
  if (code !== 'Enter' && code !== 'Space') return;
  document.querySelector<HTMLInputElement>('#controls-device').checked = true;
  disableCamera(true, true);
}

function switchToCamera({code}: KeyboardEvent) {
  if (code !== 'Enter' && code !== 'Space') return;
  document.querySelector<HTMLInputElement>('#controls-camera').checked = true;
  enableCamera();
}

function copyResult() {
  const text = resultBox.textContent;
  if (!text) return;
  navigator.clipboard.writeText(text);
  const copyText = document.querySelector('#copy-text');
  const copyArea = document.querySelector('#copy-area');
  copyText.textContent = 'Copied!';
  copyArea.classList.add('copied');
  setTimeout(() => {
    copyText.textContent = 'Copy';
    copyArea.classList.remove('copied');
  }, 2000);
}

function handleImageInput({target}: InputEvent & { target: HTMLInputElement }) {
  handleDataTransfer(target);
}
function handleFileDrop(event: DragEvent) {
  document.body.classList.remove('dragover');
  handleDataTransfer(event.dataTransfer);
  event.preventDefault();
}
document.addEventListener('paste', event => {
  handleDataTransfer(event.clipboardData);
});

async function handleDataTransfer(data: HTMLInputElement | DataTransfer) {
  const file = data.files[0];
  if (file) {
    if (!await readImage(file)) return;
    readQRCode();
  } else if ('getData' in data) {
    const text = data.getData('text/plain');
    if (!/^https?:\/\//.test(text)) return;
    showInfo(text);
    if (!await readCORSRequest(text)) return;
    readQRCode();
  }
}

async function readImage(file) {
  if (!file.type.startsWith('image/')) {
    showError('File is not an Image');
    return false;
  }
  const reader = new FileReader();
  reader.readAsDataURL(file);
  await new Promise(resolve => reader.onloadend = resolve);
  image.src = reader.result as string;
  return true;
}

async function readCORSRequest(url: string) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', CORS_API_URL + url);
  xhr.responseType = 'blob';
  xhr.send();
  try {
    await new Promise((resolve, reject) => {
      xhr.onload = resolve;
      xhr.onerror = () => reject('Cannot fetch URL using CORS proxy');
    });
    return await readImage(xhr.response);
  } catch (err) { showError(err); return false }

  // const canvas = document.createElement('canvas');
  // canvas.width = image.width, canvas.height = image.height;
  // canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
  // image.src = canvas.toDataURL('image/png');
}

async function readQRCode() {
  resultBox.scrollIntoView();
  image.hidden = false;
  controls.hidden = true;
  try {
    // Scan QR code using nimiq library.
    showResult(await QrScanner.scanImage(image));
  } catch {
    // Scan QR code using cirocosta library.
    QCodeDecoder().decodeFromImage(image, (err, result) => {
      err ? showError('No QR Code found') : showResult(result);
    });
  }
}

function disableCamera(willDetachVideo?: boolean, willHideVideo?: boolean) {
  // clearInterval(streamTimer);
  // stream?.getVideoTracks()[0].stop();
  stream?.stop();
  stream = null;
  if (willDetachVideo) {
    // video.pause();
    type Video = { srcObject: MediaStream | null };
    (video as Video).srcObject?.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
  if (willHideVideo) {
    document.body.classList.remove('camera');
    video.hidden = true;
    controls.hidden = false;
  }
}

async function enableCamera() {
  disableCamera(true);
  document.body.classList.add('camera');
  image.hidden = controls.hidden = true;
  video.hidden = false;
  video.scrollIntoView(false);

  stream = new QrScanner(video, res => showResult(res), err => showError(err));

  stream.pause = async function(stopStreamImmediately) {
    this._paused = true;
    if (!this._active) return true;
    this.$video.pause();

    const stopStream = () => {
      this.$video.srcObject?.getTracks().forEach(track => {
        track.stop();
        // this.$video.srcObject.removeTrack(track);
      });
      // this.$video.srcObject = null;
    };

    if (stopStreamImmediately) { stopStream(); return true }

    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!this._paused) return false;
    stopStream();
    return true;
  };

  stream.start().catch(err => showError(err));
  
  // stream = await navigator.mediaDevices.getUserMedia({
  //   video: { facingMode: 'environment' }
  // });
  // const facingMode = stream.getVideoTracks()[0].getCapabilities().facingMode[0];
  // facingMode === 'user' && video.classList.add('mirror');
  // facingMode === 'environment' && video.classList.remove('mirror');
  // video.srcObject = stream;
  // video.play();
  // streamTimer = setInterval(searchQRCode, 500);
}

// function searchQRCode() {
//   const canvas = document.createElement('canvas');
//   canvas.width = video.videoWidth;
//   canvas.height = video.videoHeight;
//   const context = canvas.getContext('2d');
//   context.drawImage(video, 0, 0, canvas.width, canvas.height);
//   image.src = canvas.toDataURL('image/png');
//   readQRCode();
// }

function showInfo(url: string) {
  const link = `<a href="${url}" target="_blank">${url}</a>`;
  const info = `<span class="info">Fetching image from "${link}"...</span>`;
  resultBox.innerHTML = info;
}

function showResult(result: string) {
  if (/^https?:\/\//.test(result)) {
    const link = `<a href=${result} target="_blank">${result}</a>`;
    const fixedLink = `<div contenteditable="false">${link}</div>`;
    resultBox.innerHTML = fixedLink;
  } else resultBox.textContent = result;
  stream && (resultBox.scrollIntoView(), disableCamera());
}


function showError(err: string) {
  const redError = `<span class="error">${Error(err)}</span>`;
  const fixedError = `<div contenteditable=false>${redError}</div>`;
  resultBox.innerHTML = fixedError;
}

async function enableCameraByDefault() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const hasEnvironmenMode = devices.some(device => {
    if (device.kind !== 'videoinput') return;
    type VideoInputDeviceInfo = MediaDeviceInfo & {
      getCapabilities?: () => MediaTrackCapabilities
    };
    const videoDevice = device as VideoInputDeviceInfo;
    if (!('getCapabilities' in videoDevice)) return;
    const facingModes = videoDevice.getCapabilities().facingMode;
    return facingModes.includes('environment');
  });
  hasEnvironmenMode && enableCamera();
}