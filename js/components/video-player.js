// =========================================================================
// SISTEM MONITOR VIDEO PEMBELAJARAN ETIKA MENSETSU (WAITING ROOM VIDEO)
// Mensetsu VR Room - Interactive 65" TV Display & Learning Video Modal
// Integrasi Skenario Akane-teki Nihongo & Quartet II
// =========================================================================

(function () {
    // URL Default Video Pembelajaran Etika Mensetsu Jepang (Akane-teki Nihongo Kyoushitsu / Standar Formal)
    const DEFAULT_VIDEO_URL = "https://www.youtube-nocookie.com/embed/v9Zq4p2h6hQ?enablejsapi=1&rel=0";

    AFRAME.registerComponent('learning-video-screen', {
        init: function () {
            this.canvas = document.createElement('canvas');
            this.canvas.width = 1024;
            this.canvas.height = 576;
            this.ctx = this.canvas.getContext('2d');

            this.texture = new THREE.CanvasTexture(this.canvas);
            this.texture.encoding = THREE.sRGBEncoding;

            const mesh = this.el.getObject3D('mesh');
            if (mesh && mesh.material) {
                mesh.material.map = this.texture;
                mesh.material.needsUpdate = true;
            }

            this.updateCanvasState(false);

            // Listener Klik pada Layar 3D
            this.el.addEventListener('click', () => {
                window.openLearningVideo();
            });

            // Pantau perubahan status tonton
            window.addEventListener('mensetsu-video-watched', () => {
                this.updateCanvasState(true);
            });
        },

        updateCanvasState: function (isWatched) {
            const ctx = this.ctx;
            const w = this.canvas.width;
            const h = this.canvas.height;

            // Background Deep Charcoal Slate
            ctx.fillStyle = '#181e26';
            ctx.fillRect(0, 0, w, h);

            // Header Banner
            ctx.fillStyle = '#212933';
            ctx.fillRect(40, 36, w - 80, 54);
            ctx.strokeStyle = '#3b4552';
            ctx.lineWidth = 1;
            ctx.strokeRect(40, 36, w - 80, 54);

            ctx.fillStyle = '#cbd5e1';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('MODUL PERSIAPAN WAWANCARA PASCASARJANA JEPANG (面接マナー学習)', w / 2, 70);

            // Title Utama Video
            ctx.fillStyle = '#f5f4ef';
            ctx.font = 'bold 34px sans-serif';
            ctx.fillText('Tata Krama & Etika Formal Mensetsu Akademis', w / 2, 160);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '19px sans-serif';
            ctx.fillText('Standar Akane-teki Nihongo & Quartet II (Masuk, Duduk, dan Etika Menjawab)', w / 2, 200);

            // Tombol Play / Status di Tengah
            const cx = w / 2;
            const cy = 320;
            const r = 58;

            // Lingkaran Tombol Play
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fillStyle = isWatched ? '#15803d' : '#1e3a8a';
            ctx.fill();
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Ikon Segitiga Play atau Centang Checkmark
            if (isWatched) {
                // Centang Selesai
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(cx - 20, cy);
                ctx.lineTo(cx - 6, cy + 16);
                ctx.lineTo(cx + 22, cy - 14);
                ctx.stroke();
            } else {
                // Play triangle
                ctx.beginPath();
                ctx.moveTo(cx - 14, cy - 22);
                ctx.lineTo(cx + 22, cy);
                ctx.lineTo(cx - 14, cy + 22);
                ctx.closePath();
                ctx.fillStyle = '#ffffff';
                ctx.fill();
            }

            // Keterangan di Bawah Tombol
            ctx.fillStyle = isWatched ? '#4ade80' : '#e2e8f0';
            ctx.font = 'bold 22px sans-serif';
            ctx.fillText(isWatched ? 'PANDUAN ETIKA TELAH DIPELAJARI' : 'TEKAN LAYAR ATAU TOMBOL UNTUK MEMUTAR VIDEO', w / 2, 435);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '16px sans-serif';
            ctx.fillText('Pelajari video panduan etika sebelum menuju pintu ruang wawancara.', w / 2, 475);

            // Status Bar di Bagian Bawah
            ctx.fillStyle = isWatched ? '#14532d' : '#27272a';
            ctx.fillRect(0, h - 50, w, 50);
            ctx.fillStyle = isWatched ? '#86efac' : '#d4d4d8';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText(isWatched ? 'STATUS SISTEM: SUDAH DIPELAJARI (TERCATAT KE SPREADSHEET)' : 'STATUS SISTEM: BELUM DIPELAJARI', w / 2, h - 18);

            if (this.texture) {
                this.texture.needsUpdate = true;
            }
        }
    });

    // =========================================================================
    // MODAL POPUP VIDEO PEMBELAJARAN
    // =========================================================================
    window.openLearningVideo = function (customUrl) {
        if (document.getElementById('video-learning-modal')) return;

        const videoUrl = customUrl || DEFAULT_VIDEO_URL;

        const modal = document.createElement('div');
        modal.id = 'video-learning-modal';
        modal.innerHTML = `
            <div class="video-modal-card">
                <div class="video-modal-header">
                    <div class="vm-badge">Modul Persiapan Pra-Wawancara</div>
                    <button type="button" class="btn-close-vm" id="btn-close-vm" title="Tutup">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>
                <h2 class="video-modal-title">Tata Krama & Etika Wawancara Pascasarjana Jepang</h2>
                <p class="video-modal-desc">Pelajari langkah-langkah formal: ketuk pintu 3 kali, salam masuk ("Shitsurei shimasu"), ojigi 30 derajat, dan etika duduk sebelum memasuki ruang wawancara.</p>

                <div class="video-player-container">
                    <iframe id="learning-iframe" 
                            src="${videoUrl}" 
                            title="Video Pembelajaran Etika Wawancara" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            allowfullscreen>
                    </iframe>
                </div>

                <div class="video-modal-footer">
                    <div class="video-status-indicator">
                        <span class="status-dot ${window.MensetsuState && window.MensetsuState.hasWatchedVideo ? 'green' : 'amber'}"></span>
                        <span id="vm-status-text">${window.MensetsuState && window.MensetsuState.hasWatchedVideo ? 'Status: Selesai dipelajari' : 'Status: Sedang dipelajari'}</span>
                    </div>
                    <button type="button" class="btn-mark-watched" id="btn-mark-watched">
                        <span>Konfirmasi selesai belajar</span>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const closeBtn = document.getElementById('btn-close-vm');
        const markWatchedBtn = document.getElementById('btn-mark-watched');

        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        markWatchedBtn.addEventListener('click', () => {
            if (!window.MensetsuState) window.MensetsuState = {};
            window.MensetsuState.hasWatchedVideo = true;

            const statusTxt = document.getElementById('vm-status-text');
            if (statusTxt) statusTxt.textContent = 'Status: Selesai dipelajari';

            window.dispatchEvent(new CustomEvent('mensetsu-video-watched'));

            if (typeof window.showActionToast === 'function') {
                window.showActionToast('Video pembelajaran selesai dipelajari.');
            }

            setTimeout(() => {
                modal.remove();
            }, 500);
        });
    };
})();
