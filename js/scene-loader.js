// =================================================================
// MODULAR SCENE LOADER UNTUK A-FRAME
// Memuat template HTML sub-scene secara asinkron ke dalam <a-scene>
// =================================================================
async function loadScenePart(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            console.error(`Gagal memuat ${filePath}: HTTP ${response.status}`);
            return;
        }
        const html = await response.text();
        const el = document.getElementById(elementId);
        if (el) {
            el.innerHTML = html;
        }
    } catch (err) {
        console.error(`Error loading scene part from ${filePath}:`, err);
    }
}

async function initScenes() {
    await Promise.all([
        loadScenePart('scene-interview-room', 'scenes/interview-room.html'),
        loadScenePart('scene-waiting-room', 'scenes/waiting-room.html')
    ]);
    console.log('Semua scene ruangan 3D Mensetsu VR berhasil dimuat.');
    window.dispatchEvent(new CustomEvent('scenes-loaded'));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScenes);
} else {
    initScenes();
}
