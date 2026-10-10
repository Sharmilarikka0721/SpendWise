import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

// Scans a QR with the camera, or from an uploaded photo of a QR.
export default function QrScanner({ onScan }) {
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const scanner = useRef(null);
  const done = useRef(false);

  const stop = async () => {
    try { if (scanner.current?.isScanning) await scanner.current.stop(); } catch { /* already stopped */ }
    setRunning(false);
  };

  useEffect(() => () => { stop(); }, []);

  async function start() {
    setError(''); done.current = false;
    try {
      scanner.current = scanner.current || new Html5Qrcode('qr-region');
      setRunning(true);
      await scanner.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (text) => { if (!done.current) { done.current = true; stop().then(() => onScan(text)); } },
        () => {}
      );
    } catch {
      setRunning(false);
      setError('We could not open the camera. Allow camera access in your browser (it needs https or localhost), or upload a photo of the QR instead.');
    }
  }

  async function fromFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      scanner.current = scanner.current || new Html5Qrcode('qr-region');
      onScan(await scanner.current.scanFile(file, false));
    } catch { setError('No QR code found in that photo. Try a clearer, closer picture.'); }
    e.target.value = '';
  }

  return (
    <div className="scanner">
      <div id="qr-region" className={running ? 'live' : ''} />
      {!running && <div className="scanner-idle"><span>📷</span><p>Point your camera at a UPI QR code</p></div>}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="form-actions">
        {running
          ? <button className="btn btn-ghost" onClick={stop}>Stop camera</button>
          : <button className="btn btn-primary" onClick={start}>Open camera</button>}
        <label className="btn btn-ghost file-btn">Upload QR photo
          <input type="file" accept="image/*" onChange={fromFile} hidden />
        </label>
      </div>
    </div>
  );
}
