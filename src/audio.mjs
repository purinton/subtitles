// audio.mjs
import { CHANNELS, SAMPLE_RATE, PCM_BITS } from './config.mjs';

export async function startMicStream(onChunk) {
    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: CHANNELS,
                sampleRate: SAMPLE_RATE,
                sampleSize: PCM_BITS,
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        });
    } catch (err) {
        throw err;
    }
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE });
    const source = audioCtx.createMediaStreamSource(stream);
    const processor = audioCtx.createScriptProcessor(4096, CHANNELS, CHANNELS);
    source.connect(processor);
    processor.connect(audioCtx.destination);
    processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        const pcm = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
            let s = Math.max(-1, Math.min(1, input[i]));
            pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        onChunk(pcm);
    };
    return () => {
        processor.disconnect();
        source.disconnect();
        stream.getTracks().forEach(t => t.stop());
        audioCtx.close();
    };
}

export function arrayBufferToBase64(buf) {
    let bin = '';
    const bytes = new Uint8Array(buf.buffer);
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
}
