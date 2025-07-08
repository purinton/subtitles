// index.mjs
import { setupStyleOverride } from './styleOverride.mjs';
import { setupHotkeyForApiKey } from './apiKey.mjs';
import { main } from './main.mjs';

setupStyleOverride();
setupHotkeyForApiKey();
main();
