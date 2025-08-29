const cameras = [];
const cameraGrid = document.getElementById('camera-grid');
const addBtn = document.getElementById('add-camera-btn');
const rtspInput = document.getElementById('rtsp-url');
const startBroadcastBtn = document.getElementById('start-broadcast');
const stopBroadcastBtn = document.getElementById('stop-broadcast');
const rtmpInput = document.getElementById('rtmp-url');

addBtn.addEventListener('click', () => {
  const url = rtspInput.value.trim();
  if (!url) return;
  addCamera(url);
  rtspInput.value = '';
});

function addCamera(url) {
  const canvas = document.createElement('canvas');
  const container = document.createElement('div');
  container.className = 'camera';
  container.appendChild(canvas);
  cameraGrid.appendChild(container);

  const worker = new Worker('rtsp-worker.js');
  const offscreen = canvas.transferControlToOffscreen();
  worker.postMessage({ type: 'start', url, canvas: offscreen }, [offscreen]);

  cameras.push({ url, worker, canvas });
}

// Broadcast logic
let broadcastWorker = null;
let recorder = null;
let mixCanvas = null;
let mixCtx = null;
let mixInterval = null;

startBroadcastBtn.addEventListener('click', () => {
  if (broadcastWorker) return;
  const rtmpUrl = rtmpInput.value.trim();
  if (!rtmpUrl) return;

  mixCanvas = document.createElement('canvas');
  mixCanvas.width = 1280;
  mixCanvas.height = 720;
  mixCtx = mixCanvas.getContext('2d');

  broadcastWorker = new Worker('broadcast-worker.js');
  broadcastWorker.postMessage({ type: 'start', url: rtmpUrl });

  recorder = new MediaRecorder(mixCanvas.captureStream(25), {
    mimeType: 'video/webm;codecs=vp8'
  });
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      e.data.arrayBuffer().then((buf) => {
        broadcastWorker.postMessage({ type: 'data', chunk: buf }, [buf]);
      });
    }
  };
  recorder.start(1000);
  startBroadcastBtn.disabled = true;
  stopBroadcastBtn.disabled = false;

  mixInterval = setInterval(() => {
    mixCtx.clearRect(0, 0, mixCanvas.width, mixCanvas.height);
    cameras.forEach((cam, idx) => {
      const x = (idx % 2) * mixCanvas.width / 2;
      const y = Math.floor(idx / 2) * mixCanvas.height / 2;
      mixCtx.drawImage(cam.canvas, x, y, mixCanvas.width / 2, mixCanvas.height / 2);
    });
  }, 40);
});

stopBroadcastBtn.addEventListener('click', () => {
  if (recorder) {
    recorder.stop();
    recorder = null;
  }
  if (broadcastWorker) {
    broadcastWorker.postMessage({ type: 'stop' });
    broadcastWorker.terminate();
    broadcastWorker = null;
  }
  clearInterval(mixInterval);
  startBroadcastBtn.disabled = false;
  stopBroadcastBtn.disabled = true;
});
