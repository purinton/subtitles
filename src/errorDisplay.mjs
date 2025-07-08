// errorDisplay.mjs
import { addTranscriptionDiv } from './transcriptionUI.mjs';

export function showErrorAsTranscription(msg) {
    const div = addTranscriptionDiv();
    div.textContent = msg;
    div.style.color = '#ff6666';
    div.style.backgroundColor = 'rgba(0,0,0,0.95)';
    div.style.fontWeight = 'bold';
}
