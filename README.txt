# Gerenciador de Câmeras

Aplicação web simples para visualizar câmeras IP e transmitir um layout 2x2 para uma URL RTMP.

## Funcionalidades
- Adição dinâmica de câmeras via URL RTSP.
- Renderização dos vídeos em `OffscreenCanvas` utilizando um *Web Worker* (`rtsp-worker.js`).
- Montagem de um layout 2x2 em um `canvas` principal.
- Transmissão do layout para uma URL RTMP através de outro *Web Worker* (`broadcast-worker.js`) que usa `ffmpeg.wasm`.

Esta é apenas uma prova de conceito. Para uso em produção é necessário um servidor intermediário que converta o stream RTSP para um formato compatível com o navegador (por exemplo, via WebSocket).
