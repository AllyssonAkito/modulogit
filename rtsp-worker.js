importScripts('https://cdn.jsdelivr.net/npm/jsmpeg@0.2.1/jsmpeg.min.js');

let player = null;

self.onmessage = function (e) {
  const { type, url, canvas } = e.data;
  if (type === 'start') {
    player = new JSMpeg.Player(url, { canvas: canvas, autoplay: true, audio: false });
  } else if (type === 'stop' && player) {
    player.destroy();
    player = null;
  }
};
