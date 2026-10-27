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
        loadScenePart('scene-interview-room', 'scenes/interview-room.html?v=2.2'),
        loadScenePart('scene-waiting-room', 'scenes/waiting-room.html?v=2.4')
    ]);
    console.log('Semua scene ruangan 3D Mensetsu VR berhasil dimuat.');
    initRealtimeClocks();
    window.dispatchEvent(new CustomEvent('scenes-loaded'));
}

// =================================================================
// JAM DINDING ANALOG REAL-TIME (RUANG TUNGGU & RUANG WAWANCARA)
// Ringan (Zero GPU/FPS Impact): Hanya memperbarui rotasi 3 poros 1x per detik
// =================================================================
function initRealtimeClocks() {
    const clockPivots = [];

    // 1. Setup Jam Dinding Ruang Tunggu (#lobby-wall-clock)
    const lobbyClock = document.getElementById('lobby-wall-clock');
    if (lobbyClock) {
        const subEntities = lobbyClock.querySelectorAll(':scope > a-entity');
        if (subEntities.length >= 3) {
            clockPivots.push({
                hourEl: subEntities[0],
                minEl: subEntities[1],
                secEl: subEntities[2]
            });
        }
    }

    // 2. Setup Jam Dinding Ruang Wawancara (#wall-clock) agar berporos presisi di pusat (0,0,0)
    const interviewClock = document.getElementById('wall-clock');
    if (interviewClock) {
        const boxes = interviewClock.querySelectorAll(':scope > a-box');
        if (boxes.length >= 3) {
            const hourBox = boxes[0];
            const minBox = boxes[1];
            const secBox = boxes[2];

            const wrapPivot = (boxEl, offsetY, zPos) => {
                const pivot = document.createElement('a-entity');
                pivot.setAttribute('position', '0 0 0');
                boxEl.setAttribute('position', `0 ${offsetY} ${zPos}`);
                boxEl.setAttribute('rotation', '0 0 0');
                interviewClock.insertBefore(pivot, boxEl);
                pivot.appendChild(boxEl);
                return pivot;
            };

            const hourPivot = wrapPivot(hourBox, 0.05, 0.019);
            const minPivot = wrapPivot(minBox, 0.075, 0.020);
            const secPivot = wrapPivot(secBox, 0.065, 0.021);

            clockPivots.push({
                hourEl: hourPivot,
                minEl: minPivot,
                secEl: secPivot
            });
        }
    }

    const updateClocks = () => {
        const now = new Date();
        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        // Sudut searah jarum jam (dalam radian negatif pada sumbu Z Three.js)
        const secRad = -((seconds * 6) * Math.PI) / 180;
        const minRad = -(((minutes + seconds / 60) * 6) * Math.PI) / 180;
        const hourRad = -(((hours + minutes / 60) * 30) * Math.PI) / 180;

        for (let i = 0; i < clockPivots.length; i++) {
            const c = clockPivots[i];
            if (c.hourEl && c.hourEl.object3D) c.hourEl.object3D.rotation.z = hourRad;
            if (c.minEl && c.minEl.object3D) c.minEl.object3D.rotation.z = minRad;
            if (c.secEl && c.secEl.object3D) c.secEl.object3D.rotation.z = secRad;
        }
    };

    // Jalankan pembaruan awal dan perbarui tiap 1 detik (1000ms)
    setTimeout(updateClocks, 150);
    setInterval(updateClocks, 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScenes);
} else {
    initScenes();
}
