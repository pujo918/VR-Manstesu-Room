// =================================================================
// STATE & LOGIKA INTERAKSI PENGGUNA
// =================================================================
window.isDoorOpen = false;
window.isWindowOpen = false;
window.isSitting = false;
window.isTransitioningSeat = false;
window.currentSeat = null;
window.currentNearbySeat = null;
window.currentNearbyAction = null; // 'door' | 'window' | 'chair' | null

// =================================================================
// DAFTAR SELURUH TEMPAT DUDUK (UNIVERSAL SEATING SYSTEM)
// Mendukung seluruh kursi dan sofa di Ruang Tunggu & Ruang Wawancara
// =================================================================
window.ALL_SEATS = [
    // --- A. RUANG WAWANCARA (面接室) ---
    // 1. Kursi Kandidat Formal (Candidate Chair)
    // Duduk menghadap ke arah meja pewawancara (-Z)
    {
        id: 'candidate-chair',
        name: 'Kursi Kandidat',
        promptLabel: 'DUDUK DI KURSI KANDIDAT',
        statusName: 'Duduk Tegak di Kursi Kandidat (着席)',
        detectX: 0,
        detectZ: -1.6,
        radius: 1.8,
        sitPos: { x: 0, y: 1.15, z: -1.6 },
        standPos: { x: -0.7, y: 1.6, z: -1.6 },
        lookRotation: { x: 0, y: 0, z: 0 } // Menghadap lurus ke Pewawancara (-Z)
    },
    // 2. Kursi Ketua Pewawancara (Interviewer Center)
    // Duduk menghadap ke arah meja & kandidat (+Z)
    {
        id: 'interviewer-center',
        name: 'Kursi Ketua Pewawancara',
        promptLabel: 'DUDUK DI KURSI KETUA PEWAWANCARA',
        statusName: 'Duduk di Kursi Ketua Pewawancara (面接官席)',
        detectX: 0,
        detectZ: -4.0,
        radius: 1.8,
        sitPos: { x: 0, y: 1.20, z: -4.15 },
        standPos: { x: 0, y: 1.6, z: -4.65 },
        lookRotation: { x: 0, y: 180, z: 0 } // Menghadap lurus ke Kandidat (+Z)
    },
    // 3. Kursi Pewawancara Kiri (Interviewer Left)
    // Duduk menghadap ke arah meja & kandidat (+Z)
    {
        id: 'interviewer-left',
        name: 'Kursi Pewawancara Kiri',
        promptLabel: 'DUDUK DI KURSI PEWAWANCARA KIRI',
        statusName: 'Duduk di Kursi Pewawancara Kiri',
        detectX: -1.3,
        detectZ: -4.0,
        radius: 1.8,
        sitPos: { x: -1.3, y: 1.18, z: -4.15 },
        standPos: { x: -1.3, y: 1.6, z: -4.65 },
        lookRotation: { x: 0, y: 180, z: 0 } // Menghadap lurus ke Kandidat (+Z)
    },
    // 4. Kursi Pewawancara Kanan (Interviewer Right)
    // Duduk menghadap ke arah meja & kandidat (+Z)
    {
        id: 'interviewer-right',
        name: 'Kursi Pewawancara Kanan',
        promptLabel: 'DUDUK DI KURSI PEWAWANCARA KANAN',
        statusName: 'Duduk di Kursi Pewawancara Kanan',
        detectX: 1.3,
        detectZ: -4.0,
        radius: 1.8,
        sitPos: { x: 1.3, y: 1.18, z: -4.15 },
        standPos: { x: 1.3, y: 1.6, z: -4.65 },
        lookRotation: { x: 0, y: 180, z: 0 } // Menghadap lurus ke Kandidat (+Z)
    },

    // --- B. RUANG TUNGGU & RESEPSIONIS (待合室・受付) ---
    // 5. Sofa Ruang Tunggu (Selalu duduk tepat di tengah agar sejajar sempurna dengan TV)
    // Duduk bersandar di sofa menghadap lurus ke TV pembelajaran etika (+X)
    {
        id: 'waiting-sofa',
        name: 'Sofa Ruang Tunggu',
        promptLabel: 'DUDUK DI SOFA RUANG TUNGGU',
        statusName: 'Duduk di Sofa Ruang Tunggu (待合ソファ)',
        detectX: -2.8,
        detectZ: 10.0,
        radius: 2.2, // Mencakup seluruh bentang sofa (ujung kiri s/d kanan)
        sitPos: { x: -3.25, y: 1.05, z: 10.0 }, // Selalu tepat di tengah sofa
        standPos: { x: -2.60, y: 1.6, z: 10.0 }, // Berdiri nyaman di lorong depan sofa (clearance lega)
        lookRotation: { x: 0, y: -90, z: 0 } // Menghadap lurus sejajar TV (+X)
    }
];

// Buka / Tutup Pintu Mensetsu
function toggleDoor() {
    // Validasi Alur sebelum pintu dapat dibuka dari ruang tunggu:
    // User cukup menonton panduan di televisi sofa hingga dipanggil (lampu atas pintu hijau).
    // Resepsionis bersifat opsional untuk bertanya panduan.
    if (!window.isDoorOpen) {
        if (!window.MensetsuState || !window.MensetsuState.hasWatchedVideo || !window.MensetsuState.isCalledForInterview) {
            if (typeof window.showActionToast === 'function') {
                window.showActionToast('Belum dipanggil masuk (Lampu atas pintu masih merah). Silakan duduk di sofa dan tonton panduan di TV terlebih dahulu.');
            }
            return;
        }
    }

    window.isDoorOpen = !window.isDoorOpen;
    if (window.isDoorOpen) {
        const interviewRoom = document.getElementById('scene-interview-room');
        if (interviewRoom && interviewRoom.object3D) {
            interviewRoom.object3D.visible = true;
        }
    }
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
    if (typeof window.showActionToast === 'function') {
        window.showActionToast(window.isDoorOpen ? 'Pintu wawancara dibuka.' : 'Pintu wawancara ditutup.');
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
    if (typeof window.showActionToast === 'function') {
        window.showActionToast(window.isWindowOpen ? 'Jendela dibuka.' : 'Jendela ditutup.');
    }
    updateUIStatus();
}

// Duduk di Kursi/Sofa Tertentu
function sitOnSeat(seat) {
    if (!seat || window.isTransitioningSeat) return;

    // Cegah duduk di kursi dalam ruang wawancara jika pemain masih berada di ruang tunggu
    if (seat.id !== 'waiting-sofa') {
        const cam = document.getElementById('player-camera');
        const camPos = cam && cam.object3D ? cam.object3D.position : null;
        if (camPos && camPos.z > 5.8) {
            return;
        }
    }

    window.isSitting = true;
    window.isTransitioningSeat = true;
    window.currentSeat = seat;

    const camera = document.getElementById('player-camera');
    if (camera) {
        // Kunci gerakan jalan selama proses duduk
        camera.setAttribute('wasd-controls', 'enabled: false');

        // Pindahkan kamera halus ke posisi dudukan
        camera.removeAttribute('animation');
        camera.setAttribute('animation', {
            property: 'position',
            to: `${seat.sitPos.x} ${seat.sitPos.y} ${seat.sitPos.z}`,
            dur: 400,
            easing: 'easeInOutCubic'
        });

        // Hadapkan pandangan kamera ke arah alami tempat duduk tersebut
        if (seat.lookRotation) {
            const targetRad = THREE.MathUtils.degToRad(seat.lookRotation.y);
            const lookControls = camera.components['look-controls'];
            if (lookControls) {
                if (lookControls.yawObject) {
                    lookControls.yawObject.rotation.y = targetRad;
                }
                if (lookControls.pitchObject) {
                    lookControls.pitchObject.rotation.x = 0;
                }
            }
            camera.object3D.rotation.set(0, targetRad, 0);
        }

        setTimeout(() => {
            if (camera.object3D) {
                camera.object3D.position.set(seat.sitPos.x, seat.sitPos.y, seat.sitPos.z);
            }
            camera.setAttribute('position', `${seat.sitPos.x} ${seat.sitPos.y} ${seat.sitPos.z}`);
            camera.removeAttribute('animation');
            window.isTransitioningSeat = false;
        }, 420);

        // Sinkronisasi posisi valid pemain
        const playerComp = camera.components['player-collision-and-proximity'];
        if (playerComp) {
            playerComp.lastValidPos.x = seat.sitPos.x;
            playerComp.lastValidPos.z = seat.sitPos.z;
        }
    } else {
        window.isTransitioningSeat = false;
    }

    if (typeof playAudioFeedback === 'function') {
        playAudioFeedback('sit');
    }
    if (typeof window.showActionToast === 'function') {
        window.showActionToast(seat.statusName || 'Duduk di kursi.');
    }
    updateUIStatus();
}

// Berdiri dari Tempat Duduk
function standUp() {
    if (!window.isSitting || window.isTransitioningSeat) return;
    const seat = window.currentSeat || window.ALL_SEATS[0];
    window.isSitting = false;
    window.isTransitioningSeat = true;

    const camera = document.getElementById('player-camera');
    if (camera) {
        // Matikan wasd-controls sementara selama animasi transisi berdiri
        camera.setAttribute('wasd-controls', 'enabled: false');

        // Sinkronisasi posisi valid ke standPos
        const playerComp = camera.components['player-collision-and-proximity'];
        if (playerComp) {
            playerComp.lastValidPos.x = seat.standPos.x;
            playerComp.lastValidPos.z = seat.standPos.z;
        }

        // Kembalikan ke posisi berdiri normal di samping/depan kursi secara halus
        camera.removeAttribute('animation');
        camera.setAttribute('animation', {
            property: 'position',
            to: `${seat.standPos.x} ${seat.standPos.y} ${seat.standPos.z}`,
            dur: 350,
            easing: 'easeOutQuad'
        });

        // Selesai animasi transisi: kunci posisi berdiri, re-enable WASD kontrol
        setTimeout(() => {
            if (camera.object3D) {
                camera.object3D.position.set(seat.standPos.x, seat.standPos.y, seat.standPos.z);
            }
            camera.setAttribute('position', `${seat.standPos.x} ${seat.standPos.y} ${seat.standPos.z}`);
            camera.removeAttribute('animation');

            if (playerComp) {
                playerComp.lastValidPos.x = seat.standPos.x;
                playerComp.lastValidPos.z = seat.standPos.z;
            }

            camera.setAttribute('wasd-controls', 'enabled: true; acceleration: 26');
            window.isTransitioningSeat = false;
        }, 360);
    } else {
        window.isTransitioningSeat = false;
    }

    window.currentSeat = null;

    if (typeof playAudioFeedback === 'function') {
        playAudioFeedback('sit');
    }
    if (typeof window.showActionToast === 'function') {
        window.showActionToast('Berdiri tegak.');
    }
    updateUIStatus();
}

// Toggle Duduk / Berdiri Umum
function toggleSit() {
    if (window.isSitting) {
        standUp();
    } else if (window.currentNearbySeat) {
        sitOnSeat(window.currentNearbySeat);
    } else {
        sitOnSeat(window.ALL_SEATS[0]);
    }
}
window.toggleSit = toggleSit;
window.sitOnSeat = sitOnSeat;
window.standUp = standUp;
window.toggleDoor = toggleDoor;
window.toggleWindow = toggleWindow;

// =================================================================
// TOAST NOTIFIKASI AKSI KANDIDAT
// =================================================================
window.showActionToast = function (message) {
    let toast = document.getElementById('action-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'action-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<span class="toast-text">${message}</span>`;
    toast.classList.remove('show');
    void toast.offsetWidth; // Force reflow
    toast.classList.add('show');

    if (window._toastTimeout) clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2400);
};

// =================================================================
// AKSI INTERAKTIF SPESIFIK WAWANCARA (KETUK, OJIGI 30°, AKSI)
// =================================================================

// 1. Ketuk Pintu (Hanya bisa dilakukan saat berdiri di dekat pintu ruang wawancara)
window.triggerKnock = function () {
    const camera = document.getElementById('player-camera');
    const pos = camera && camera.object3D ? camera.object3D.position : (camera ? camera.getAttribute('position') : null);

    // Validasi Posisi Pemain: Hanya boleh mengetuk saat berada di dekat pintu
    if (pos) {
        // Jika pemain sedang duduk (di sofa atau kursi), wajib berdiri dulu
        if (window.isSitting) {
            window.showActionToast('Anda harus berdiri dan mendekati pintu untuk mengetuk.');
            return;
        }

        // Jika pemain sudah berada di dalam ruang wawancara (Z < 5.8)
        if (pos.z < 5.8) {
            window.showActionToast('Anda sudah berada di dalam ruang wawancara.');
            return;
        }

        // Cek jarak horizontal ke daun pintu utama (X: 0, Z: 6.0)
        const distToDoor = Math.hypot(pos.x - 0, pos.z - 6.0);
        if (distToDoor > 2.3) {
            window.showActionToast('Dekati pintu ruang wawancara terlebih dahulu untuk mengetuk.');
            return;
        }

        // Validasi Alur sebelum mengetuk pintu ruang wawancara (cukup menonton panduan TV hingga dipanggil)
        if (!window.MensetsuState || !window.MensetsuState.hasWatchedVideo || !window.MensetsuState.isCalledForInterview) {
            window.showActionToast('Belum dipanggil masuk (Lampu atas pintu masih merah). Silakan duduk di sofa dan tonton panduan di TV terlebih dahulu.');
            return;
        }

        // Jika pintu sudah dalam keadaan terbuka lebar
        if (window.isDoorOpen) {
            window.showActionToast('Pintu sudah terbuka. Silakan langsung masuk ke ruang wawancara.');
            return;
        }
    }

    if (!window.MensetsuState) {
        window.MensetsuState = { knockCount: 0, ojigiCount: 0 };
    }
    window.MensetsuState.knockCount = (window.MensetsuState.knockCount || 0) + 1;
    const count = window.MensetsuState.knockCount;

    if (typeof playAudioFeedback === 'function') {
        playAudioFeedback('knock');
    }

    let msg = `Ketukan pintu: ${count} kali`;
    if (count === 3) {
        msg = 'Ketukan pintu: 3 kali (sesuai etika wawancara Jepang)';
    } else if (count > 3) {
        msg = `Ketukan pintu: ${count} kali (melebihi etika 3 ketukan)`;
    }
    window.showActionToast(msg);

    window.dispatchEvent(new CustomEvent('mensetsu-knock', {
        detail: { count: count, timestamp: Date.now() }
    }));
};

// 2. Membungkuk Hormat 30 Derajat (Ojigi 30° / Keirei)
window.isOjigiActive = false;
window.triggerOjigi = function () {
    if (window.isOjigiActive) return;
    window.isOjigiActive = true;

    if (!window.MensetsuState) {
        window.MensetsuState = { knockCount: 0, ojigiCount: 0 };
    }
    window.MensetsuState.ojigiCount = (window.MensetsuState.ojigiCount || 0) + 1;
    const count = window.MensetsuState.ojigiCount;

    if (typeof playAudioFeedback === 'function') {
        playAudioFeedback('ojigi');
    }

    window.showActionToast('Membungkuk hormat (Ojigi 30 derajat)');

    window.dispatchEvent(new CustomEvent('mensetsu-ojigi', {
        detail: { count: count, timestamp: Date.now() }
    }));

    const camera = document.getElementById('player-camera');
    const lookControls = camera ? camera.components['look-controls'] : null;

    if (lookControls && lookControls.pitchObject) {
        const startPitch = lookControls.pitchObject.rotation.x;
        // Target membungkuk 30 derajat ke bawah (~0.5236 radian)
        const bowRad = 30 * (Math.PI / 180);
        const targetPitch = Math.max(-Math.PI / 2.1, startPitch - bowRad);

        const durDown = 350; // ms turun
        const durHold = 650; // ms tahan di posisi bungkuk
        const durUp = 400;   // ms kembali tegak

        const startTime = performance.now();

        function step(now) {
            const elapsed = now - startTime;
            if (elapsed < durDown) {
                // Menunduk ke bawah (ease-in-out)
                const p = elapsed / durDown;
                const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
                lookControls.pitchObject.rotation.x = startPitch + (targetPitch - startPitch) * ease;
                requestAnimationFrame(step);
            } else if (elapsed < durDown + durHold) {
                // Tahan di posisi bungkuk
                lookControls.pitchObject.rotation.x = targetPitch;
                requestAnimationFrame(step);
            } else if (elapsed < durDown + durHold + durUp) {
                // Kembali tegak ke posisi awal
                const p = (elapsed - (durDown + durHold)) / durUp;
                const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
                lookControls.pitchObject.rotation.x = targetPitch + (startPitch - targetPitch) * ease;
                requestAnimationFrame(step);
            } else {
                // Selesai
                lookControls.pitchObject.rotation.x = startPitch;
                window.isOjigiActive = false;
            }
        }
        requestAnimationFrame(step);
    } else {
        setTimeout(() => {
            window.isOjigiActive = false;
        }, 1400);
    }
};

// 3. Pemicu Aksi Interaktif Umum (Aksi Tombol Y / F)
window.triggerAction = function () {
    if (window.MensetsuReceptionist && window.MensetsuReceptionist.isMenuOpen) {
        window.MensetsuReceptionist.confirmSelectedMenu();
        return;
    }

    if (window.isSitting) {
        // Jika sedang duduk di sofa ruang tunggu, tombol Y memutar video YouTube
        if (window.currentSeat && window.currentSeat.id === 'waiting-sofa') {
            if (typeof window.openLearningVideo === 'function') {
                window.openLearningVideo();
                return;
            }
        }
        standUp();
    } else if (window.currentNearbyAction === 'receptionist') {
        if (window.MensetsuReceptionist && typeof window.MensetsuReceptionist.interact === 'function') {
            window.MensetsuReceptionist.interact();
        }
    } else if (window.currentNearbyAction === 'chair') {
        if (window.currentNearbySeat) {
            sitOnSeat(window.currentNearbySeat);
        } else {
            toggleSit();
        }
    } else if (window.currentNearbyAction === 'door') {
        toggleDoor();
    } else if (window.currentNearbyAction === 'window') {
        toggleWindow();
    } else {
        // Cek kedekatan dengan kursi kandidat
        const camera = document.getElementById('player-camera');
        if (camera) {
            const camPos = camera.getAttribute('position');
            const candidateChair = window.ALL_SEATS[0];
            const dist = Math.hypot(camPos.x - candidateChair.detectX, camPos.z - candidateChair.detectZ);
            if (dist < 2.5) {
                sitOnSeat(candidateChair);
                return;
            }
        }
    }
};

function updateUIStatus() {
    const doorText = document.getElementById('status-door');
    const winText = document.getElementById('status-window');
    const sitText = document.getElementById('status-posture');
    if (doorText) doorText.innerHTML = window.isDoorOpen ? '<b style="color:#16a34a">Terbuka</b>' : '<b style="color:#dc2626">Tertutup</b>';
    if (winText) winText.innerHTML = window.isWindowOpen ? '<b style="color:#16a34a">Terbuka</b>' : '<b style="color:#dc2626">Tertutup</b>';
    
    if (sitText) {
        if (window.isSitting && window.currentSeat) {
            sitText.innerHTML = `<b style="color:#93c5fd">${window.currentSeat.statusName}</b>`;
        } else {
            sitText.innerHTML = '<b style="color:#cbd5e1">Berdiri (立位)</b>';
        }
    }
}

// Event Listener Tombol Keyboard PC
window.addEventListener('keydown', function (e) {
    // Jangan proses jika sedang mengetik input
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return;
    }

    const key = e.key.toLowerCase();
    
    // Tombol F, E, atau Y untuk interaksi utama (Aksi)
    // Catatan: Tombol D KHUSUS untuk WASD (gerak nyamping kanan), JANGAN dijadikan tombol interaksi
    if (key === 'f' || key === 'e' || key === 'y') {
        e.preventDefault();
        window.triggerAction();
    }
    // Tombol K atau X untuk mengetuk pintu
    else if (key === 'k' || key === 'x') {
        e.preventDefault();
        window.triggerKnock();
    }
    // Tombol B untuk Open Mic / Rekam Suara
    else if (key === 'b') {
        e.preventDefault();
        if (typeof window.handleMobileMicButton === 'function') {
            window.handleMobileMicButton();
        }
    }
    // Tombol O untuk Ojigi (membungkuk 30°)
    else if (key === 'o') {
        e.preventDefault();
        window.triggerOjigi();
    }
    // Tombol C untuk Duduk / Berdiri
    else if (key === 'c') {
        e.preventDefault();
        window.toggleSit();
    }
    // Jika sedang duduk dan menekan tombol WASD / Spasi, langsung berdiri secara intuitif
    else if (window.isSitting && (key === 'w' || key === 'a' || key === 's' || key === 'd' || key === ' ')) {
        standUp();
    }
});

// Listener klik langsung pada kursi / sofa di ruang 3D
function initSeatClickListeners() {
    if (!window.ALL_SEATS) return;
    window.ALL_SEATS.forEach(seat => {
        const el = document.getElementById(seat.id);
        if (el && !el._hasClickSit) {
            el._hasClickSit = true;
            el.classList.add('clickable');
            el.addEventListener('click', () => {
                sitOnSeat(seat);
            });
        }
    });
}

window.addEventListener('scenes-loaded', initSeatClickListeners);
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(initSeatClickListeners, 1000);
    setTimeout(initSeatClickListeners, 2500);
});

