// apiKey.mjs
export async function getApiKey() {
    let key = localStorage.getItem("OPENAI_API_KEY");
    if (key) {
        const overlay = document.getElementById("api-key-entry");
        if (overlay) overlay.remove();
        return key;
    }
    return await showApiKeyDialog();
}

function showApiKeyDialog() {
    return new Promise((resolve) => {
        let overlay = document.getElementById("api-key-entry");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.id = "api-key-entry";
            overlay.style.position = "fixed";
            overlay.style.top = 0;
            overlay.style.left = 0;
            overlay.style.width = "100vw";
            overlay.style.height = "100vh";
            overlay.style.zIndex = 100;
            overlay.style.background = "rgba(0,0,0,0.8)";
            overlay.style.display = "flex";
            overlay.style.alignItems = "center";
            overlay.style.justifyContent = "center";
            overlay.innerHTML = `<form id="api-key-form" style="background:#222;padding:2em 3em;border-radius:1em;box-shadow:0 0 20px #000;display:flex;flex-direction:column;align-items:center;">
      <label for="api-key-input" style="color:#fff;font-size:1.2em;margin-bottom:0.5em;">Enter OpenAI API Key:</label>
      <input id="api-key-input" type="password" autocomplete="off" style="font-size:1.2em;padding:0.5em 1em;border-radius:0.5em;border:none;margin-bottom:1em;width:20em;max-width:80vw;" required />
      <button type="submit" style="font-size:1.1em;padding:0.5em 2em;border-radius:0.5em;border:none;background:#00c853;color:#fff;cursor:pointer;">Submit</button>
    </form>`;
            document.body.appendChild(overlay);
        }
        const form = overlay.querySelector("#api-key-form");
        const input = overlay.querySelector("#api-key-input");
        form.addEventListener("submit", function handler(e) {
            e.preventDefault();
            const key = input.value.trim();
            if (key) {
                localStorage.setItem("OPENAI_API_KEY", key);
                overlay.remove();
                resolve(key);
            }
        }, { once: true });
        input.focus();
    });
}

export function setupHotkeyForApiKey() {
    window.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            localStorage.removeItem("OPENAI_API_KEY");
            showApiKeyDialog().then(() => {
                window.location.reload();
            });
        }
    });
}
