# [![Purinton Dev](https://purinton.us/logos/brand.png)](https://discord.gg/QSBxQnX7PF)

OBS Live Subtitles is a browser-based tool for real-time speech-to-text subtitles, designed for use with OBS (Open Broadcaster Software) or any streaming/recording setup that can capture a browser window. It uses OpenAI's real-time transcription API to convert microphone input into live captions.

---

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Configuration](#configuration)
- [Customization](#customization)
- [Support](#support)
- [License](#license)

## Features

- Real-time speech-to-text subtitles using OpenAI's API
- Designed for easy use as a browser source in OBS
- Fade-out captions with customizable styles
- Hotkey (Ctrl+K) to reset or update your API key
- No server required—runs entirely in your browser

## Getting Started

1. **Clone or download this repository:**

   ```bash
   git clone https://github.com/purinton/subtitles.git
   cd subtitles
   ```

2. **Open `index.html` in your browser.**

3. **Enter your OpenAI API key** when prompted. (You can reset it anytime with Ctrl+K.)

## Usage

1. Add `index.html` as a browser source in OBS (or open it in any browser window you wish to capture).
2. Speak into your microphone. Subtitles will appear at the bottom of the window in real time.
3. To change the API key, press **Ctrl+K**.

## Configuration

- Edit `src/config.mjs` to change the model, sample rate, or other settings.
- To customize the look, edit `style.css` or add your own CSS as a browser source in OBS.

## Customization

- The UI and fade-out behavior can be changed in `src/transcriptionUI.mjs` and `style.css`.
- To use a different language or model, update the relevant fields in `src/config.mjs`.

## Support

For questions or help, open an issue on GitHub or join the community Discord:

- [Discord](https://discord.gg/QSBxQnX7PF)

## License

MIT © 2025 Russell Purinton
# subtitles
