importScripts('https://unpkg.com/@ffmpeg/ffmpeg@0.11.8/dist/ffmpeg.min.js');

const { createFFmpeg } = FFmpeg;
let ffmpeg = null;
let rtmpUrl = '';

self.onmessage = async ({ data }) => {
  if (data.type === 'start') {
    rtmpUrl = data.url;
    ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
  } else if (data.type === 'data') {
    const name = `chunk_${Date.now()}.webm`;
    await ffmpeg.FS('writeFile', name, new Uint8Array(data.chunk));
    try {
      await ffmpeg.run('-re', '-i', name, '-c', 'copy', '-f', 'flv', rtmpUrl);
    } catch (err) {
      // errors are logged but ignored to keep streaming
      console.error(err);
    }
    ffmpeg.FS('unlink', name);
  } else if (data.type === 'stop') {
    self.close();
  }
};
