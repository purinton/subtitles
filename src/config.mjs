// config.mjs
export const MODEL = "gpt-4o-mini-realtime-preview";
export const TRANSCRIBE_MODEL = "gpt-4o-mini-transcribe";
export const WS_URL = `wss://api.openai.com/v1/realtime?model=${MODEL}`;
export const SAMPLE_RATE = 24000;
export const PCM_BITS = 16;
export const CHANNELS = 1;
