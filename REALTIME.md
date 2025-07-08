# Realtime API (WebSockets Only)

Build low-latency, multi-modal experiences with the OpenAI Realtime API using **WebSockets**. This guide covers how to connect, send, and receive events using WebSockets for speech-to-speech conversations and transcription.

---

## Overview

WebSockets provide a broadly supported API for realtime data transfer and are ideal for server-to-server applications. You can connect your backend system directly to the OpenAI Realtime API using a WebSocket connection.

- Use a **standard API key** to authenticate on secure backend servers.
- For browser and mobile clients, WebRTC is recommended, but this guide focuses solely on WebSockets.

---

## Connection Details

### Speech-to-Speech

| Parameter       | Value                                         |
|-----------------|-----------------------------------------------|
| URL             | `wss://api.openai.com/v1/realtime`            |
| Query Parameters| `model` (e.g., `gpt-4o-realtime-preview-2024-12-17`) |
| Headers         | `Authorization: Bearer YOUR_API_KEY`<br>`OpenAI-Beta: realtime=v1` (required during beta) |

### Transcription

| Parameter       | Value                                         |
|-----------------|-----------------------------------------------|
| URL             | `wss://api.openai.com/v1/realtime`            |
| Query Parameters| `intent=transcription`                         |
| Headers         | `Authorization: Bearer YOUR_API_KEY`<br>`OpenAI-Beta: realtime=v1` (required during beta) |

---

## Connecting via WebSocket

### Node.js Example (ws module)

```javascript
import WebSocket from "ws";

const url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17";
const ws = new WebSocket(url, {
  headers: {
    "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
    "OpenAI-Beta": "realtime=v1",
  },
});

ws.on("open", () => {
  console.log("Connected to server.");
});

ws.on("message", (message) => {
  console.log(JSON.parse(message.toString()));
});
```

### Python Example (websocket-client)

```python
import os
import json
import websocket

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17"
headers = [
    "Authorization: Bearer " + OPENAI_API_KEY,
    "OpenAI-Beta: realtime=v1"
]

def on_open(ws):
    print("Connected to server.")

def on_message(ws, message):
    data = json.loads(message)
    print("Received event:", json.dumps(data, indent=2))

ws = websocket.WebSocketApp(
    url,
    header=headers,
    on_open=on_open,
    on_message=on_message,
)

ws.run_forever()
```

### Browser Example (Standard WebSocket)

```javascript
/*
Note: For browser clients, WebRTC is recommended. However, you can use WebSocket in environments like Deno or Cloudflare Workers.
*/

const ws = new WebSocket(
  "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
  [
    "realtime",
    "openai-insecure-api-key." + OPENAI_API_KEY,
    "openai-organization." + OPENAI_ORG_ID,
    "openai-project." + OPENAI_PROJECT_ID,
    "openai-beta.realtime-v1"
  ]
);

ws.onopen = () => {
  console.log("Connected to server.");
};

ws.onmessage = (event) => {
  console.log(event.data);
};
```

---

## Sending and Receiving Events

You communicate with the Realtime API by sending **client events** and listening for **server events** over the WebSocket connection.

---

## Realtime Speech-to-Speech Conversations (WebSockets)

---

### Session Lifecycle Events

- After connecting, the server sends a `session.created` event indicating the session is ready.
- You can update session parameters anytime (except `voice` after audio output) using the `session.update` client event.
- The maximum session duration is **30 minutes**.

#### Example: Update Session Instructions

```javascript
const event = {
  type: "session.update",
  session: {
    instructions: "Never use the word 'moist' in your responses!"
  },
};

ws.send(JSON.stringify(event));
```

```python
event = {
    "type": "session.update",
    "session": {
        "instructions": "Never use the word 'moist' in your responses!"
    }
}
ws.send(json.dumps(event))
```

---

### Text Inputs and Outputs

#### Create a User Message

```javascript
const event = {
  type: "conversation.item.create",
  item: {
    type: "message",
    role: "user",
    content: [
      {
        type: "input_text",
        text: "What Prince album sold the most copies?",
      }
    ]
  },
};

ws.send(JSON.stringify(event));
```

```python
event = {
    "type": "conversation.item.create",
    "item": {
        "type": "message",
        "role": "user",
        "content": [
            {
                "type": "input_text",
                "text": "What Prince album sold the most copies?",
            }
        ]
    }
}
ws.send(json.dumps(event))
```

#### Request a Model Response (Text Only)

```javascript
const event = {
  type: "response.create",
  response: {
    modalities: ["text"]
  },
};

ws.send(JSON.stringify(event));
```

```python
event = {
    "type": "response.create",
    "response": {
        "modalities": ["text"]
    }
}
ws.send(json.dumps(event))
```

#### Listen for Final Response

```javascript
ws.on("message", (message) => {
  const serverEvent = JSON.parse(message);
  if (serverEvent.type === "response.done") {
    console.log(serverEvent.response.output[0]);
  }
});
```

```python
def on_message(ws, message):
    server_event = json.loads(message)
    if server_event["type"] == "response.done":
        print(server_event["response"]["output"][0])
```

---

## Audio Inputs and Outputs (WebSockets)

### Streaming Audio Input

You can stream audio chunks to the server using the `input_audio_buffer.append` client event. Audio must be **Base64-encoded PCM16** bytes, with chunks no larger than 15 MB.

#### Example: Append Audio Chunks (JavaScript)

```javascript
ws.send(JSON.stringify({
  type: "input_audio_buffer.append",
  audio: "<base64-encoded-audio-chunk>"
}));
```

#### Example: Commit Audio Buffer and Request Response

```javascript
ws.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
ws.send(JSON.stringify({ type: "response.create" }));
```

### Sending Full Audio Messages

You can also send full audio messages as conversation items:

```javascript
const event = {
  type: "conversation.item.create",
  item: {
    type: "message",
    role: "user",
    content: [
      {
        type: "input_audio",
        audio: "<base64-encoded-audio-bytes>",
      },
    ],
  },
};

ws.send(JSON.stringify(event));
```

---

## Receiving Audio Output

Listen for `response.audio.delta` events containing Base64-encoded audio chunks from the model:

```javascript
ws.on("message", (message) => {
  const serverEvent = JSON.parse(message);
  if (serverEvent.type === "response.audio.delta") {
    const audioChunk = serverEvent.delta;
    // Process or play audioChunk
  }
});
```

---

## Voice Activity Detection (VAD)

- VAD is **enabled by default** and automatically detects when the user starts and stops speaking.
- To **disable VAD**, send a `session.update` event with `turn_detection: null`.
- When VAD is disabled, you must manually send:
  - `input_audio_buffer.commit` to commit audio input.
  - `response.create` to trigger a model response.
  - `input_audio_buffer.clear` before new input.

---

## Function Calling

Realtime models support **function calling** to extend capabilities.

### Configure Functions

Set available functions in the session or response:

```json
{
  "type": "session.update",
  "session": {
    "tools": [
      {
        "type": "function",
        "name": "generate_horoscope",
        "description": "Give today's horoscope for an astrological sign.",
        "parameters": {
          "type": "object",
          "properties": {
            "sign": {
              "type": "string",
              "description": "The sign for the horoscope.",
              "enum": ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
            }
          },
          "required": ["sign"]
        }
      }
    ],
    "tool_choice": "auto"
  }
}
```

### Detect Function Call Requests

When the model wants to call a function, it sends a `response.done` event with:

- `response.output[0].type` = `"function_call"`
- `response.output[0].name` = function name
- `response.output[0].arguments` = JSON string of arguments
- `response.output[0].call_id` = unique call ID

### Provide Function Call Results

Send a conversation item with the function call output:

```json
{
  "type": "conversation.item.create",
  "item": {
    "type": "function_call_output",
    "call_id": "call_sHlR7iaFwQ2YQOqm",
    "output": "{\"horoscope\": \"You will soon meet a new friend.\"}"
  }
}
```

Then trigger a new response:

```json
{
  "type": "response.create"
}
```

---

## Error Handling

Errors are sent as `error` events. To correlate errors with client events, include an `event_id` in your client events.

Example:

```javascript
const event = {
  event_id: "my_awesome_event",
  type: "unsupported.event.type",
};

ws.send(JSON.stringify(event));
```

If invalid, the server will respond with:

```json
{
  "type": "invalid_request_error",
  "code": "invalid_value",
  "message": "Invalid value: 'unsupported.event.type' ...",
  "param": "type",
  "event_id": "my_awesome_event"
}
```

---

## Realtime Transcription (WebSockets)

---

## Transcription Session Object

```json
{
  "object": "realtime.transcription_session",
  "id": "string",
  "input_audio_format": "string",
  "input_audio_transcription": [{
    "model": "string",
    "prompt": "string",
    "language": "string"
  }],
  "turn_detection": {
    "type": "server_vad",
    "threshold": 0.5,
    "prefix_padding_ms": 300,
    "silence_duration_ms": 500
  } | null,
  "input_audio_noise_reduction": {
    "type": "near_field" | "far_field"
  },
  "include": ["string"] | null
}
```

- `input_audio_transcription.model`: e.g., `gpt-4o-transcribe`, `gpt-4o-mini-transcribe`, `whisper-1`
- `input_audio_transcription.language`: ISO-639-1 language code (e.g., `"en"`)
- `input_audio_noise_reduction`: `near_field` (default), `far_field`, or `null` to disable
- `include`: e.g., `["item.input_audio_transcription.logprobs"]` to include logprobs

---

## Handling Transcriptions

Listen for:

- `conversation.item.input_audio_transcription.delta` — incremental transcript updates
- `conversation.item.input_audio_transcription.completed` — final transcript for a turn

Example transcription delta event:

```json
{
  "event_id": "event_2122",
  "type": "conversation.item.input_audio_transcription.delta",
  "item_id": "item_003",
  "content_index": 0,
  "delta": "Hello,"
}
```

Example transcription completed event:

```json
{
  "event_id": "event_2122",
  "type": "conversation.item.input_audio_transcription.completed",
  "item_id": "item_003",
  "content_index": 0,
  "transcript": "Hello, how are you?"
}
```

---

## Sending Audio Data

Use the `input_audio_buffer.append` event to stream audio data (Base64-encoded PCM16) to the transcription session.

---

## Voice Activity Detection - VAD

- VAD is enabled by default and controls when audio input is committed.
- Disable VAD by setting `turn_detection` to `null` and manually commit audio input.

---

## Noise Reduction

Configure noise reduction with `input_audio_noise_reduction`:

- `near_field` (default)
- `far_field`
- `null` to disable

---

## Using Logprobs

Include logprobs in transcription events by setting:

```json
"include": ["item.input_audio_transcription.logprobs"]
```

This can be used to calculate confidence scores.

---

## Summary

- Use **WebSockets** to connect securely to the Realtime API for speech-to-speech or transcription.
- Authenticate with your **standard API key** on the server.
- Send and receive JSON events over the WebSocket connection.
- Stream audio input with `input_audio_buffer.append`.
- Receive audio output via `response.audio.delta` events.
- Use function calling to extend model capabilities.
- Handle errors with `error` events and correlate using `event_id`.
- For transcription, listen for transcription delta and completed events.
