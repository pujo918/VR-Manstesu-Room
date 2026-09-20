// =================================================================
// STATE & LOGIKA INTERAKSI PENGGUNA
// =================================================================
window.isDoorOpen = false;
window.isWindowOpen = false;
window.isSitting = false;
window.currentNearbyAction = null; // 'door' | 'window' | 'chair' | null

// Buka / Tutup Pintu Mensetsu
function toggleDoor() {
    window.isDoorOpen = !window.isDoorOpen;
    const doorPivot = document.getElementById('door-pivot');
    if (doorPivot) {
        const targetY = window.isDoorOpen ? 95 : 0;
        doorPivot.setAttribute('animation', {
            property: 'rotation',
            to: `0 ${targetY} 0`,
            dur: 650,
            easing: 'easeInOutCubic'
        });
    }
    if (typeof playAudioFeedback === 'function') {
        playAudioFeedback('door');
    }
    updateUIStatus();
}

// Buka / Tutup Jendela Geser
function toggleWindow() {
    window.isWindowOpen = !window.isWindowOpen;
    const winEl = document.getElementById('sliding-window');
    if (winEl) {
        const targetZ = window.isWindowOpen ? -1.5 : 0;
        winEl.setAttribute('animation', {
            property: 'position',
            to: `3.94 1.85 ${targetZ}`,
            dur: 550,
            easing: 'easeInOutQuad'
        });
    }
    if (typeof playAudioFeedback === 'function') {
        playAudioFeedback('window');
    }
    updateUIStatus();
}

// Duduk / Berdiri di Kursi Kandidat
function toggleSit() {
    window.isSitting = !window.isSitting;
    const camera = document.getElementById('player-camera');
    if (camera) {
        if (window.isSitting) {
            // Duduk: Pindahkan kamera ke kursi kandidat (X: 0, Y: 1.15m tinggi duduk, Z: -1.0m)
            camera.setAttribute('animation', {
                property: 'position',
                to: '0 1.15 -1.0',
                dur: 450,
                easing: 'easeInOutCubic'
            });
            // Matikan sementara kontrol jalan WASD agar tetap rapi duduk
            camera.setAttribute('wasd-controls', 'enabled: false');
        } else {
            // Berdiri: Kembalikan ke posisi berdiri normal (X: -0.7m di samping kiri kursi sesuai etika Jepang, Y: 1.6m, Z: -1.0m)
            camera.setAttribute('animation', {
                property: 'position',
                to: '-0.7 1.6 -1.0',
                dur: 450,
                easing: 'easeInOutCubic'
            });
            camera.setAttribute('wasd-controls', 'enabled: true; acceleration: 26');
        }
    }
    if (typeof playAudioFeedback === 'function') {
        playAudioFeedback('sit');
    }
    updateUIStatus();
}

function updateUIStatus() {
    const doorText = document.getElementById('status-door');
    const winText = document.getElementById('status-window');
    const sitText = document.getElementById('status-posture');
    if (doorText) doorText.innerHTML = window.isDoorOpen ? '<b style="color:#4ade80">Terbuka</b>' : '<b style="color:#f87171">Tertutup</b>';
    if (winText) winText.innerHTML = window.isWindowOpen ? '<b style="color:#4ade80">Terbuka</b>' : '<b style="color:#f87171">Tertutup</b>';
    if (sitText) sitText.innerHTML = window.isSitting ? '<b style="color:#38bdf8">Duduk Tegak (着席)</b>' : '<b style="color:#e2e8f0">Berdiri (立位)</b>';
}

// Event Listener Tombol 'F'
window.addEventListener('keydown', function (e) {
    if (e.key === 'f' || e.key === 'F') {
        if (window.currentNearbyAction === 'door') {
            toggleDoor();
        } else if (window.currentNearbyAction === 'window') {
            toggleWindow();
        } else if (window.currentNearbyAction === 'chair') {
            toggleSit();
        }
    }
});
