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
            const isDialogueActive = this.dialogueOverlay && this.dialogueOverlay.classList.contains('active');
            if (this.prompt) {
                if (isDialogueActive) {
                    if (this.lastPromptDisplay !== 'none') {
                        this.prompt.style.display = 'none';
                        this.lastPromptDisplay = 'none';
                    }
                } else {
                    const seatName = window.currentSeat ? window.currentSeat.name : 'KURSI';
                    const label = `BERDIRI DARI ${seatName.toUpperCase()} (TEKAN F / WASD)`;
                    if (this.lastPromptDisplay !== 'flex') {
                        this.prompt.style.display = 'flex';
                        this.lastPromptDisplay = 'flex';
                    }
                    if (this.lastPromptState !== label) {
                        this.promptLabel.textContent = label;
                        this.lastPromptState = label;
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

        // 2. DETEKSI JARAK KE PINTU, JENDELA & TV PEMBELAJARAN
        const distToDoor = Math.hypot(pos.x - 0, pos.z - 6.0);
        const distToWindow = Math.hypot(pos.x - 3.94, pos.z - 0);
        const distToTv = Math.hypot(pos.x - (-0.75), pos.z - 10.0);

        let targetAction = null;
        let targetSeat = null;
        let targetLabel = '';

        if (closestSeat) {
            targetAction = 'chair';
            targetSeat = closestSeat;
            targetLabel = closestSeat.promptLabel;
        } else if (distToTv < 2.5) {
            targetAction = 'tv';
            targetLabel = 'TONTON VIDEO PEMBELAJARAN';
        } else if (distToDoor < 2.3) {
            targetAction = 'door';
            targetLabel = window.isDoorOpen ? 'TUTUP PINTU' : 'BUKA PINTU (KETUK: TEKAN K)';
        } else if (distToWindow < 2.5) {
            targetAction = 'window';
            targetLabel = window.isWindowOpen ? 'TUTUP JENDELA' : 'BUKA JENDELA';
        }

        // Indikator tombol ketuk pintu (hanya aktif visual saat dekat pintu dan belum terbuka)
        const knockBtn = document.getElementById('mob-btn-knock');
        if (knockBtn) {
            const canKnock = distToDoor < 2.3 && !window.isDoorOpen && pos.z >= 5.8 && !window.isSitting;
            if (canKnock) {
                knockBtn.classList.add('can-knock');
            } else {
                knockBtn.classList.remove('can-knock');
            }
        }

        window.currentNearbyAction = targetAction;
        window.currentNearbySeat = targetSeat;

        if (this.prompt) {
            if (targetAction) {
                if (this.lastPromptDisplay !== 'flex') {
                    this.prompt.style.display = 'flex';
                    this.lastPromptDisplay = 'flex';
                }
                if (this.lastPromptState !== targetLabel) {
                    this.promptLabel.textContent = targetLabel;
                    this.lastPromptState = targetLabel;
                }
            } else {
                if (this.lastPromptDisplay !== 'none') {
                    this.prompt.style.display = 'none';
                    this.lastPromptDisplay = 'none';
                    this.lastPromptState = '';
                }
            }
        }

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
