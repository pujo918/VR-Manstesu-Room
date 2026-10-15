// =================================================================
// KOMPONEN PEMBATAS KAMERA (PER-FRAME TICK) - OPTIMIZED FOR 60+ FPS
// =================================================================
AFRAME.registerComponent('player-collision-and-proximity', {
    init: function () {
        // Posisi spawn awal pemain di dalam Ruang Tunggu (menghadap ke pintu wawancara)
        this.lastValidPos = { x: 0, z: 14.2 };

        // Cache elemen DOM untuk mencegah pemanggilan getElementById berulang di loop render (Zero DOM overhead)
        this.prompt = document.getElementById('interact-prompt');
        this.promptLabel = document.getElementById('prompt-label');
        this.dialogueOverlay = document.getElementById('npc-dialogue-overlay');

        this.lastPromptState = '';
        this.lastPromptDisplay = 'none';
    },

    tick: function () {
        const pos = this.el.object3D.position;
        if (!pos) return;

        if (!this.prompt) {
            this.prompt = document.getElementById('interact-prompt');
            this.promptLabel = document.getElementById('prompt-label');
            this.dialogueOverlay = document.getElementById('npc-dialogue-overlay');
        }

        // Jika sedang dalam transisi duduk atau berdiri, tunda collision checking
        if (window.isTransitioningSeat) {
            return;
        }

        // Jika sedang duduk di kursi / sofa, biarkan posisi terkunci di tempat duduk
        if (window.isSitting) {
            window.currentNearbyAction = 'chair';
            
            // Perbarui tombol Y (Aksi) saat sedang duduk
            const btnY = document.getElementById('mob-btn-y');
            const subY = document.getElementById('mob-sublabel-y');
            if (btnY) {
                btnY.classList.add('can-interact');
                if (subY) {
                    if (window.currentSeat && window.currentSeat.id === 'waiting-sofa') {
                        subY.textContent = 'Video';
                    } else {
                        subY.textContent = 'Berdiri';
                    }
                }
            }
            return;
        }

        // 1. CARI TEMPAT DUDUK TERDEKAT DARI SELURUH KURSI & SOFA
        let closestSeat = null;
        let minSeatDist = Infinity;
        if (window.ALL_SEATS && window.ALL_SEATS.length > 0) {
            for (let i = 0; i < window.ALL_SEATS.length; i++) {
                const s = window.ALL_SEATS[i];
                const d = Math.hypot(pos.x - s.detectX, pos.z - s.detectZ);
                if (d < s.radius && d < minSeatDist) {
                    minSeatDist = d;
                    closestSeat = s;
                }
            }
        }

        // 2. DETEKSI JARAK KE PINTU & JENDELA (Video TV hanya aktif saat duduk di sofa)
        const distToDoor = Math.hypot(pos.x - 0, pos.z - 6.0);
        const distToWindow = Math.hypot(pos.x - 3.94, pos.z - 0);

        let targetAction = null;
        let targetSeat = null;

        if (closestSeat) {
            targetAction = 'chair';
            targetSeat = closestSeat;
        } else if (distToDoor < 2.3) {
            targetAction = 'door';
        } else if (distToWindow < 2.5) {
            targetAction = 'window';
        }

        // Indikator tombol ketuk pintu X (hanya aktif visual saat dekat pintu dan belum terbuka)
        const knockBtn = document.getElementById('mob-btn-x') || document.getElementById('mob-btn-knock');
        if (knockBtn) {
            const canKnock = distToDoor < 2.3 && !window.isDoorOpen && pos.z >= 5.8 && !window.isSitting;
            if (canKnock) {
                knockBtn.classList.add('can-knock');
            } else {
                knockBtn.classList.remove('can-knock');
            }
        }

        // Indikator dinamis tombol Y (Aksi / Interaksi Context-Aware)
        const btnY = document.getElementById('mob-btn-y');
        const subY = document.getElementById('mob-sublabel-y');
        if (btnY) {
            if (targetAction) {
                btnY.classList.add('can-interact');
                if (subY) {
                    if (targetAction === 'door') subY.textContent = window.isDoorOpen ? 'Tutup' : 'Buka';
                    else if (targetAction === 'chair') subY.textContent = 'Duduk';
                    else if (targetAction === 'window') subY.textContent = 'Jendela';
                    else subY.textContent = 'Aksi';
                }
            } else {
                btnY.classList.remove('can-interact');
                if (subY) subY.textContent = 'Aksi';
            }
        }

        window.currentNearbyAction = targetAction;
        window.currentNearbySeat = targetSeat;

        // 3. SISTEM COLLISION DENGAN PENYELARASAN GESER (SLIDE COLLISION)
        if (typeof isPositionValid === 'function') {
            if (isPositionValid(pos.x, pos.z)) {
                this.lastValidPos.x = pos.x;
                this.lastValidPos.z = pos.z;
            } else {
                if (isPositionValid(pos.x, this.lastValidPos.z)) {
                    this.lastValidPos.x = pos.x;
                    pos.z = this.lastValidPos.z;
                } else if (isPositionValid(this.lastValidPos.x, pos.z)) {
                    this.lastValidPos.z = pos.z;
                    pos.x = this.lastValidPos.x;
                } else {
                    pos.x = this.lastValidPos.x;
                    pos.z = this.lastValidPos.z;
                }

                const wasd = this.el.components['wasd-controls'];
                if (wasd && wasd.velocity) {
                    wasd.velocity.x = 0;
                    wasd.velocity.z = 0;
                }
            }
        }
    }
});
