var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var image = document.querySelector('#image-box img');
var video = document.querySelector('#image-box video');
var controls = document.querySelector('#image-controls-box');
var resultBox = document.querySelector('#result-box');
var stream;
// let streamTimer = -1;
function triggerImageInput(event) {
    if (event.code && event.code !== 'Enter' && event.code !== 'Space')
        return;
    if (stream) {
        video.classList.toggle('mirror');
        return;
    }
    controls.querySelector('input').click();
}
function switchToDevice(_a) {
    var code = _a.code;
    if (code !== 'Enter' && code !== 'Space')
        return;
    document.querySelector('#controls-device').checked = true;
    disableCamera(true);
}
function switchToCamera(_a) {
    var code = _a.code;
    if (code !== 'Enter' && code !== 'Space')
        return;
    document.querySelector('#controls-camera').checked = true;
    enableCamera();
}
function copyResult() {
    var text = resultBox.textContent;
    if (!text)
        return;
    navigator.clipboard.writeText(text);
    var copyText = document.querySelector('#copy-text');
    var copyArea = document.querySelector('#copy-area');
    copyText.textContent = 'Copied!';
    copyArea.classList.add('copied');
    setTimeout(function () {
        copyText.textContent = 'Copy';
        copyArea.classList.remove('copied');
    }, 2000);
}
function handleImageInput(_a) {
    var target = _a.target;
    handleDataTransfer(target);
}
function handleFileDrop(event) {
    document.body.classList.remove('dragover');
    handleDataTransfer(event.dataTransfer);
    event.preventDefault();
}
document.addEventListener('paste', function (event) {
    handleDataTransfer(event.clipboardData);
});
function handleDataTransfer(data) {
    return __awaiter(this, void 0, void 0, function () {
        var file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    file = data.files[0];
                    if (!file)
                        return [2 /*return*/];
                    return [4 /*yield*/, readImage(file)];
                case 1:
                    if (!(_a.sent()))
                        return [2 /*return*/];
                    // readQRCode();
                    // Scan QR code using nimiq library.
                    QrScanner.scanImage(image)
                        .then(function (result) { return showResult(result); })
                        .catch(function () { return readQRCode(); });
                    return [2 /*return*/];
            }
        });
    });
}
function readImage(file) {
    return __awaiter(this, void 0, void 0, function () {
        var reader;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!file.type.startsWith('image/')) {
                        showError('File is not an Image');
                        return [2 /*return*/, false];
                    }
                    reader = new FileReader();
                    reader.readAsDataURL(file);
                    return [4 /*yield*/, new Promise(function (resolve) { return reader.onloadend = resolve; })];
                case 1:
                    _a.sent();
                    resultBox.scrollIntoView();
                    image.src = reader.result;
                    image.hidden = false;
                    controls.hidden = true;
                    return [2 /*return*/, true];
            }
        });
    });
}
new QCodeDecoder;
function readQRCode() {
    // Scan QR code using cirocosta library.
    QCodeDecoder().decodeFromImage(image, function (err, result) {
        err ? showError('No QR Code found') : showResult(result);
    });
}
function disableCamera(switchMode) {
    var _a;
    (_a = video.srcObject) === null || _a === void 0 ? void 0 : _a.getTracks().forEach(function (track) { return track.stop(); });
    video.srcObject = null;
    stream === null || stream === void 0 ? void 0 : stream.stop();
    stream = null;
    if (!switchMode)
        return;
    // video.pause();
    document.body.classList.remove('camera');
    video.hidden = true;
    controls.hidden = false;
}
function enableCamera() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            disableCamera();
            document.body.classList.add('camera');
            image.hidden = controls.hidden = true;
            video.hidden = false;
            video.scrollIntoView(false);
            stream = new QrScanner(video, function (res) { return showResult(res); }, function (err) { return showError(err); });
            stream.pause = function (stopStreamImmediately) {
                return __awaiter(this, void 0, void 0, function () {
                    var stopStream;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this._paused = true;
                                if (!this._active)
                                    return [2 /*return*/, true];
                                this.$video.pause();
                                stopStream = function () {
                                    var _a;
                                    (_a = _this.$video.srcObject) === null || _a === void 0 ? void 0 : _a.getTracks().forEach(function (track) {
                                        track.stop();
                                        // this.$video.srcObject.removeTrack(track);
                                    });
                                    // this.$video.srcObject = null;
                                };
                                if (stopStreamImmediately) {
                                    stopStream();
                                    return [2 /*return*/, true];
                                }
                                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 300); })];
                            case 1:
                                _a.sent();
                                if (!this._paused)
                                    return [2 /*return*/, false];
                                stopStream();
                                return [2 /*return*/, true];
                        }
                    });
                });
            };
            stream.start().catch(function (err) { return showError(err); });
            return [2 /*return*/];
        });
    });
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
function showResult(result) {
    if (/^https?:\/\//.test(result)) {
        var url = "<a href=" + result + " target=\"_blank\">" + result + "</a>";
        var fixedUrl = "<div contenteditable=\"false\">" + url + "</div>";
        resultBox.innerHTML = fixedUrl;
    }
    else
        resultBox.textContent = result;
    stream && (resultBox.scrollIntoView(), disableCamera());
}
function showError(err) {
    var redError = "<span class=\"error\">" + Error(err) + "</span>";
    var fixedError = "<div contenteditable=false>" + redError + "</div>";
    resultBox.innerHTML = fixedError;
}
