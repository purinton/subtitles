// transcriptionUI.mjs
import { transcriptionContainer } from './dom.mjs';

export let transcriptionMessages = [];
export let currentTranscription = null;

export function scrollTranscriptionsToBottom() {
    transcriptionContainer.scrollTop = transcriptionContainer.scrollHeight;
}

export function addTranscriptionDiv() {
    const div = document.createElement("div");
    div.className = "closed-caption";
    div.textContent = "";
    transcriptionContainer.appendChild(div);
    transcriptionMessages.push(div);
    scrollTranscriptionsToBottom();
    div.style.opacity = 1;
    setTimeout(() => {
        div.style.opacity = 0;
        setTimeout(() => {
            if (div.parentNode) div.parentNode.removeChild(div);
            const idx = transcriptionMessages.indexOf(div);
            if (idx !== -1) transcriptionMessages.splice(idx, 1);
        }, 1000);
    }, 10000);
    return div;
}

export function updateTranscriptionOpacities() {
    // No-op: handled by per-message fadeout
}
