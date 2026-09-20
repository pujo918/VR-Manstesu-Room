// =================================================================
// KOMPONEN PEMBATAS KAMERA (PER-FRAME TICK)
// =================================================================
AFRAME.registerComponent('player-collision-and-proximity', {
    init: function () {
        // Posisi spawn awal pemain di dalam Ruang Tunggu (menghadap ke pintu wawancara)
        this.lastValidPos = { x: 0, z: 14.2 };
    },
    tick: function () {
        const pos = this.el.object3D.position;
        if (!pos) return;

        // Jika sedang duduk di kursi, biarkan posisi terkunci di kursi
        if (window.isSitting) {
            window.currentNearbyAction = 'chair';
            const prompt = document.getElementById('interact-prompt');
            const promptLabel = document.getElementById('prompt-label');
            if (prompt) {
                prompt.style.display = 'flex';
                promptLabel.textContent = 'BERDIRI DARI KURSI';
            }
            return;
        }

        // 1. DETEKSI JARAK KE OBJEK INTERAKTIF (PINTU, JENDELA, KURSI KANDIDAT)
        const distToDoor = Math.hypot(pos.x - 0, pos.z - 6.0);
        const distToWindow = Math.hypot(pos.x - 3.94, pos.z - 0);
        const distToChair = Math.hypot(pos.x - 0, pos.z - (-1.0));

        const prompt = document.getElementById('interact-prompt');
        const promptLabel = document.getElementById('prompt-label');

        if (distToDoor < 2.3) {
            window.currentNearbyAction = 'door';
            if (prompt) {
                prompt.style.display = 'flex';
                promptLabel.textContent = window.isDoorOpen ? 'TUTUP PINTU' : 'BUKA PINTU';
            }
        } else if (distToChair < 1.7) {
            window.currentNearbyAction = 'chair';
            if (prompt) {
                prompt.style.display = 'flex';
                promptLabel.textContent = 'DUDUK DI KURSI KANDIDAT';
            }
        } else if (distToWindow < 2.5) {
            window.currentNearbyAction = 'window';
            if (prompt) {
                prompt.style.display = 'flex';
                promptLabel.textContent = window.isWindowOpen ? 'TUTUP JENDELA' : 'BUKA JENDELA';
            }
        } else {
            window.currentNearbyAction = null;
            if (prompt) {
                prompt.style.display = 'none';
            }
        }

        // 2. SISTEM COLLISION DENGAN PENYELARASAN GESER (SLIDE COLLISION)
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
