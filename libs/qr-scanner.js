import QrScanner from 'qr-scanner/qr-scanner.min.js';
import QrScannerWorkerPath from '!!file-loader?name=[name].[ext]!../node_modules/qr-scanner/qr-scanner-worker.min.js';
QrScanner.WORKER_PATH = QrScannerWorkerPath;
export { QrScanner };