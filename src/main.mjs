// main.mjs
import { WS_URL, TRANSCRIBE_MODEL } from './config.mjs';
import { getApiKey } from './apiKey.mjs';
import { showErrorAsTranscription } from './errorDisplay.mjs';
import { startMicStream, arrayBufferToBase64 } from './audio.mjs';
import { addTranscriptionDiv, currentTranscription as currentTranscriptionRef } from './transcriptionUI.mjs';


let ws;
let currentTranscription = null;
let reconnectAttempts = 0;
let reconnectTimeout = null;
const MAX_RECONNECT_DELAY = 30000; // 30 seconds
const INITIAL_RECONNECT_DELAY = 1000; // 1 second


export async function main() {
    const apiKey = await getApiKey();
    if (!apiKey) {
        showErrorAsTranscription("No API key provided");
        return;
    }
    connectWebSocket(apiKey);
}

function connectWebSocket(apiKey) {
    const subprotocols = [
        "realtime",
        "openai-insecure-api-key." + apiKey,
        "openai-beta.realtime-v1"
    ];
    ws = new WebSocket(WS_URL, subprotocols);

    ws.onopen = () => {
        reconnectAttempts = 0;
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
        const sessionUpdate = {
            type: 'session.update',
            session: {
                instructions: '',
                modalities: ['text', 'audio'],
                input_audio_transcription: {
                    model: TRANSCRIBE_MODEL,
                    language: 'en'
                },
                input_audio_format: 'pcm16',
                output_audio_format: 'pcm16',
                turn_detection: {
                    type: 'server_vad',
                    create_response: false
                }
            }
        };
        ws.send(JSON.stringify(sessionUpdate));
        startMicStream((pcm) => {
            const b64 = arrayBufferToBase64(pcm);
            ws.send(JSON.stringify({
                type: "input_audio_buffer.append",
                audio: b64
            }));
        }).catch((err) => {
            showErrorAsTranscription("Microphone access denied or unavailable.");
        });
    };

    ws.onmessage = (event) => {
        let data;
        try { data = JSON.parse(event.data); } catch (e) { data = event.data; }
        if (data && data.type === "conversation.item.input_audio_transcription.delta") {
            if (!currentTranscription) {
                currentTranscription = addTranscriptionDiv();
            }
            currentTranscription.textContent += data.delta;
        } else if (data && data.type === "conversation.item.input_audio_transcription.completed") {
            if (currentTranscription) {
                currentTranscription.textContent = data.transcript;
                currentTranscription = null;
            }
        } else if (data && data.error) {
            showErrorAsTranscription("Error: " + (data.error.message || JSON.stringify(data.error)));
        }
    };

    ws.onerror = (e) => {
        showErrorAsTranscription("WebSocket error. Check your connection/API key.");
    };

    ws.onclose = () => {
        showErrorAsTranscription("WebSocket closed. Attempting to reconnect...");
        scheduleReconnect(apiKey);
    };
}

function scheduleReconnect(apiKey) {
    reconnectAttempts++;
    let delay = Math.min(INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1), MAX_RECONNECT_DELAY);
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
    }
    reconnectTimeout = setTimeout(() => {
        connectWebSocket(apiKey);
    }, delay);
}
