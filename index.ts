const image = document.querySelector<HTMLImageElement>('#image-box img');
const video = document.querySelector<HTMLVideoElement>('#image-box video');
const controls = document.querySelector<HTMLElement>('#image-controls-box');
const resultBox = document.querySelector<HTMLElement>('#result-box');

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
  disableCamera(true);
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
  if (!file) return;
  if (!await readImage(file)) return;
  // readQRCode();

  // Scan QR code using nimiq library.
  QrScanner.scanImage(image)
    .then(result => showResult(result))
    .catch(() => readQRCode());
}

async function readImage(file) {
  if (!file.type.startsWith('image/')) {
    showError('File is not an Image');
    return false;
  }
  const reader = new FileReader();
  reader.readAsDataURL(file);
  await new Promise(resolve => reader.onloadend = resolve);
  resultBox.scrollIntoView();
  image.src = reader.result as string;
  image.hidden = false;
  controls.hidden = true;
  return true;
}

new QCodeDecoder
function readQRCode() {
  // Scan QR code using cirocosta library.
  QCodeDecoder().decodeFromImage(image, (err, result) => {
    err ? showError('No QR Code found') : showResult(result);
  });
}

function disableCamera(switchMode?: boolean) {
  // clearInterval(streamTimer);
  // stream?.getVideoTracks()[0].stop();
  type Video = { srcObject: MediaStream | null };
  (video as Video).srcObject?.getTracks().forEach(track => track.stop());
  video.srcObject = null;
  stream?.stop();
  stream = null;
  if (!switchMode) return;
  // video.pause();
  document.body.classList.remove('camera');
  video.hidden = true;
  controls.hidden = false;
}

async function enableCamera() {
  disableCamera();
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

function showResult(result: string) {
  if (/^https?:\/\//.test(result)) {
    const url = `<a href=${result} target="_blank">${result}</a>`;
    const fixedUrl = `<div contenteditable="false">${url}</div>`;
    resultBox.innerHTML = fixedUrl;
  } else resultBox.textContent = result;
  stream && (resultBox.scrollIntoView(), disableCamera());
}


function showError(err: string) {
  const redError = `<span class="error">${Error(err)}</span>`;
  const fixedError = `<div contenteditable=false>${redError}</div>`;
  resultBox.innerHTML = fixedError;
}