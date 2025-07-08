// styleOverride.mjs
function checkForCustomStyle() {
    const custom = document.getElementById('custom-obs-style');
    const def = document.getElementById('default-style');
    if (custom && def) def.disabled = true;
}

export function setupStyleOverride() {
    new MutationObserver(checkForCustomStyle).observe(document.head, { childList: true, subtree: true });
    checkForCustomStyle();
}
