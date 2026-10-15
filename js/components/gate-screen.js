// =========================================================================
// SISTEM ONBOARDING BERTALAP & KONTROL MULTI-DEVICE (GATE SCREEN v3.0)
// Mensetsu VR Room - Step 1: Device Selection | Step 2: Student Name
// Fullscreen Button: Hanya muncul di pojok kanan atas saat bermain
// =========================================================================

(function () {
    // Inisialisasi State Global Mensetsu
    window.MensetsuState = {
        studentName: localStorage.getItem('mensetsu_student_name') || '',
        sessionId: localStorage.getItem('mensetsu_session_id') || generateSessionId(),
        deviceMode: 'pc', // 'pc' | 'mobile' | 'vr'
        isStarted: false,
        startTime: null,
        knockCount: 0,
        ojigiCount: 0
    };

    function generateSessionId() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let res = 'MENSET-';
        for (let i = 0; i < 6; i++) {
            res += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        localStorage.setItem('mensetsu_session_id', res);
        return res;
    }

    const DEVICE_METADATA = {
        pc: {
            name: 'Komputer / Laptop',
            icon: 'assets/device-pc.png',
            desc: 'Keyboard WASD & Mouse',
            actionDesc: '<strong>W, A, S, D</strong> = Jalan, <strong>F</strong> = Interaksi, <strong>K</strong> = Ketuk, <strong>O</strong> = Ojigi, <strong>C</strong> = Duduk.'
        },
        mobile: {
            name: 'Smartphone / HP',
            icon: 'assets/device-mobile.png',
            desc: 'Layar Sentuh & Gamepad Xbox',
            actionDesc: 'Joystick kiri untuk jalan. Tombol Xbox kanan: <span style="color:#ffc800"><strong>Y</strong> (Aksi)</span>, <span style="color:#38bdf8"><strong>X</strong> (Ketuk)</span>, <span style="color:#f87171"><strong>B</strong> (Mic)</span>, <span style="color:#4ade80"><strong>A</strong> (Ojigi)</span>.'
        },
        vr: {
            name: 'Headset VR',
            icon: 'assets/device-vr.png',
            desc: 'WebXR Imersif 6DoF',
            actionDesc: 'WebXR imersif dengan penjejakan arah pandang mata (Gaze) dan kontroler 6DoF.'
        }
    };

    window.MensetsuGate = {
        init: function () {
            this.createTopNavBar();
            this.createGateModal();
            this.setupFullscreenHandler();
        },

        // Navigasi Atas (Termasuk tombol Layar Penuh di pojok kanan atas saat bermain)
        createTopNavBar: function () {
            if (document.getElementById('top-nav-controls')) return;

            const nav = document.createElement('div');
            nav.id = 'top-nav-controls';
            // Tombol ini disembunyikan saat onboarding awal, hanya muncul ketika pemain sedang bermain
            nav.style.display = 'none';
            nav.innerHTML = `
                <div class="user-chip" id="top-user-chip">
                    <span class="user-avatar-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </span>
                    <span id="top-user-name">Kandidat</span>
                    <span class="session-badge" id="top-session-badge"></span>
                </div>
                <button class="nav-btn btn-fullscreen" id="btn-toggle-fullscreen" title="Layar penuh (Full Screen)">
                    <span class="fs-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                    </span>
                    <span class="fs-text">Layar Penuh</span>
                </button>
            `;
            document.body.appendChild(nav);

            document.getElementById('btn-toggle-fullscreen').addEventListener('click', () => {
                this.toggleFullscreen();
            });
        },

        // Modal Onboarding Bertahap: Step 1 (Pilih Device) -> Step 2 (Input Nama)
        createGateModal: function () {
            if (document.getElementById('gate-screen')) return;

            const modal = document.createElement('div');
            modal.id = 'gate-screen';
            modal.innerHTML = `
                <div class="gate-card">
                    <!-- ==================================================== -->
                    <!-- LANGKAH 1: PERTANYAAN PILIH DEVICE (3 GAMBAR CLICKABLE)-->
                    <!-- ==================================================== -->
                    <div id="gate-step-device" class="gate-step-panel gate-step-visible">
                        <div class="gate-header">
                            <div class="gate-badge">日本大学院・奨学金面接シミュレーション</div>
                            <h1 class="gate-title">Menggunakan device apa?</h1>
                            <p class="gate-subtitle">Silakan pilih perangkat yang Anda gunakan untuk memulai simulasi wawancara.</p>
                        </div>

                        <div class="gate-body">
                            <div class="device-choice-grid">
                                <!-- 1. Komputer / Laptop (PC) -->
                                <div class="device-choice-card" data-device="pc" tabindex="0" role="button" aria-label="Komputer atau Laptop">
                                    <div class="device-choice-img-box">
                                        <img src="assets/device-pc.png" alt="Komputer / Laptop" class="device-choice-img">
                                    </div>
                                    <div class="device-choice-info">
                                        <h3 class="device-choice-title">Komputer / Laptop</h3>
                                        <p class="device-choice-desc">Keyboard WASD & Mouse</p>
                                        <span class="device-choice-btn">Pilih Perangkat →</span>
                                    </div>
                                </div>

                                <!-- 2. Smartphone / Ponsel (Mobile) -->
                                <div class="device-choice-card" data-device="mobile" tabindex="0" role="button" aria-label="Smartphone atau Ponsel">
                                    <div class="device-choice-img-box">
                                        <img src="assets/device-mobile.png" alt="Smartphone / Ponsel" class="device-choice-img">
                                    </div>
                                    <div class="device-choice-info">
                                        <h3 class="device-choice-title">Smartphone / HP</h3>
                                        <p class="device-choice-desc">Layar Sentuh & Joystick</p>
                                        <span class="device-choice-btn">Pilih Perangkat →</span>
                                    </div>
                                </div>

                                <!-- 3. Headset VR -->
                                <div class="device-choice-card" data-device="vr" tabindex="0" role="button" aria-label="Headset VR">
                                    <div class="device-choice-img-box">
                                        <img src="assets/device-vr.png" alt="Headset VR" class="device-choice-img">
                                    </div>
                                    <div class="device-choice-info">
                                        <h3 class="device-choice-title">Headset VR</h3>
                                        <p class="device-choice-desc">WebXR Imersif 6DoF</p>
                                        <span class="device-choice-btn">Pilih Perangkat →</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ==================================================== -->
                    <!-- LANGKAH 2: INPUT NAMA LENGKAP MAHASISWA / KANDIDAT   -->
                    <!-- ==================================================== -->
                    <div id="gate-step-name" class="gate-step-panel gate-step-hidden">
                        <div class="gate-header">
                            <div class="step-nav-row">
                                <button type="button" class="btn-gate-back" id="btn-back-to-device" title="Kembali ganti perangkat">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5m7 7-7-7 7-7"/></svg>
                                    <span>Ganti Perangkat</span>
                                </button>
                                <div class="gate-badge">Identitas Peserta • 氏名入力</div>
                            </div>
                            <h1 class="gate-title">Masukkan Nama Anda</h1>
                            <p class="gate-subtitle">Data nama akan dicatat dalam lembar penilaian etika resmi (Manner Sheet) dan verifikasi sesi.</p>
                        </div>

                        <div class="gate-body">
                            <!-- Indikator Perangkat Terpilih -->
                            <div class="selected-device-pill">
                                <span class="pill-label">Perangkat yang Digunakan:</span>
                                <div class="pill-value">
                                    <img id="gate-selected-device-img" src="assets/device-pc.png" class="pill-thumb" alt="device">
                                    <strong id="gate-selected-device-name">Komputer / Laptop</strong>
                                </div>
                            </div>

                            <!-- Input Form Nama Lengkap -->
                            <div class="gate-form-group">
                                <label for="gate-input-name" class="gate-label">
                                    <span>Nama lengkap mahasiswa / 氏名</span>
                                    <span class="required-tag">Wajib diisi</span>
                                </label>
                                <div class="input-wrapper">
                                    <span class="input-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                    </span>
                                    <input type="text" id="gate-input-name" class="gate-input" 
                                           placeholder="Ketik nama lengkap Anda..." 
                                           value="${window.MensetsuState.studentName}" autocomplete="name">
                                </div>
                                <div class="session-info">
                                    <span>ID sesi unik: </span>
                                    <code id="gate-session-id">${window.MensetsuState.sessionId}</code>
                                </div>
                            </div>

                            <div id="gate-validation-error" class="validation-msg" style="display:none;"></div>
                        </div>

                        <div class="gate-footer">
                            <button type="button" class="btn-start-simulation" id="gate-btn-start">
                                <span>Mulai Masuk ke Simulasi VR (面接室へ)</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Modal Panduan iOS / iPhone jika Fullscreen dibatasi Safari -->
                <div id="ios-fs-modal" class="ios-fs-modal" style="display:none;">
                    <div class="ios-fs-card">
                        <h3>Panduan Layar Penuh di iPhone (Safari)</h3>
                        <p>Apple Safari membatasi layar penuh otomatis pada aplikasi web 3D. Untuk pengalaman layar penuh:</p>
                        <ol>
                            <li>Tekan tombol <strong>Bagikan (Share)</strong> pada bilah bawah Safari.</li>
                            <li>Pilih menu <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.</li>
                            <li>Buka simulasi dari ikon di layar ponsel Anda untuk tampilan penuh.</li>
                        </ol>
                        <button type="button" class="btn-close-ios" id="btn-close-ios">Lanjutkan di peramban</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            this.setupGateEvents();
        },

        setupGateEvents: function () {
            // 1. Klik pada Kartu Pilihan Gambar Device
            const cards = document.querySelectorAll('.device-choice-card');
            cards.forEach(card => {
                const triggerAction = () => {
                    const chosen = card.getAttribute('data-device') || 'pc';
                    this.goToStepName(chosen);
                };

                card.addEventListener('click', triggerAction);
                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        triggerAction();
                    }
                });
            });

            // 2. Tombol Kembali ke Pemilihan Device
            const backBtn = document.getElementById('btn-back-to-device');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    this.goToStepDevice();
                });
            }

            // 3. Tombol Start / Masuk ke Simulasi VR
            const startBtn = document.getElementById('gate-btn-start');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    this.handleStart();
                });
            }

            // 4. Enter pada Input Nama
            const nameInput = document.getElementById('gate-input-name');
            if (nameInput) {
                nameInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        this.handleStart();
                    }
                });
            }

            // 5. Tutup Modal Petunjuk Safari iOS
            const closeIosBtn = document.getElementById('btn-close-ios');
            if (closeIosBtn) {
                closeIosBtn.addEventListener('click', () => {
                    document.getElementById('ios-fs-modal').style.display = 'none';
                });
            }
        },

        // Navigasi ke Step 2 (Input Nama)
        goToStepName: function (deviceMode) {
            window.MensetsuState.deviceMode = deviceMode;
            if (typeof playAudioFeedback === 'function') playAudioFeedback('click');

            const info = DEVICE_METADATA[deviceMode] || DEVICE_METADATA.pc;
            const imgEl = document.getElementById('gate-selected-device-img');
            const nameEl = document.getElementById('gate-selected-device-name');
            if (imgEl) imgEl.src = info.icon;
            if (nameEl) nameEl.textContent = info.name;

            const step1 = document.getElementById('gate-step-device');
            const step2 = document.getElementById('gate-step-name');

            if (step1 && step2) {
                step1.classList.remove('gate-step-visible');
                step1.classList.add('gate-step-hidden');

                step2.classList.remove('gate-step-hidden');
                step2.classList.add('gate-step-visible');

                const nameInput = document.getElementById('gate-input-name');
                if (nameInput) {
                    setTimeout(() => nameInput.focus(), 150);
                }
            }
        },

        // Navigasi kembali ke Step 1 (Pilih Device)
        goToStepDevice: function () {
            if (typeof playAudioFeedback === 'function') playAudioFeedback('click');

            const step1 = document.getElementById('gate-step-device');
            const step2 = document.getElementById('gate-step-name');

            if (step1 && step2) {
                step2.classList.remove('gate-step-visible');
                step2.classList.add('gate-step-hidden');

                step1.classList.remove('gate-step-hidden');
                step1.classList.add('gate-step-visible');
            }
        },

        // Menjalankan VR Chat / Ruangan Simulasi dengan Sempurna setelah Nama Diinput
        handleStart: function () {
            const nameInput = document.getElementById('gate-input-name');
            const errBox = document.getElementById('gate-validation-error');
            const name = (nameInput ? nameInput.value : '').trim();

            if (!name) {
                if (errBox) {
                    errBox.textContent = 'Mohon masukkan nama lengkap Anda terlebih dahulu sebelum memulai.';
                    errBox.style.display = 'block';
                }
                if (nameInput) nameInput.focus();
                return;
            }

            if (errBox) errBox.style.display = 'none';

            // Simpan identitas mahasiswa
            window.MensetsuState.studentName = name;
            window.MensetsuState.isStarted = true;
            window.MensetsuState.startTime = new Date();
            localStorage.setItem('mensetsu_student_name', name);

            if (typeof playAudioFeedback === 'function') playAudioFeedback('click');

            // Tampilkan tombol Layar Penuh dan Chip Nama di pojok kanan atas saat bermain
            const nav = document.getElementById('top-nav-controls');
            const chipName = document.getElementById('top-user-name');
            const chipSession = document.getElementById('top-session-badge');
            if (chipName) chipName.textContent = name;
            if (chipSession) chipSession.textContent = window.MensetsuState.sessionId;
            if (nav) {
                nav.style.display = 'flex';
            }



            // Hilangkan Gate Screen dengan animasi halus
            const gate = document.getElementById('gate-screen');
            if (gate) {
                gate.classList.add('gate-fade-out');
                setTimeout(() => {
                    gate.remove();
                }, 350);
            }

            // Aktifkan Kontrol Sesuai Mode Perangkat yang Dipilih
            if (window.MensetsuControls && typeof window.MensetsuControls.init === 'function') {
                window.MensetsuControls.init(window.MensetsuState.deviceMode);
            }

            console.log(`Mahasiswa "${name}" (${window.MensetsuState.sessionId}) memulai simulasi dalam mode: ${window.MensetsuState.deviceMode}`);
        },

        // --- SISTEM LAYAR PENUH (FULLSCREEN SYSTEM DI POJOK KANAN ATAS SAAT BERMAIN) ---
        setupFullscreenHandler: function () {
            document.addEventListener('fullscreenchange', () => this.updateFullscreenUI());
            document.addEventListener('webkitfullscreenchange', () => this.updateFullscreenUI());
        },

        updateFullscreenUI: function () {
            const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
            const btn = document.getElementById('btn-toggle-fullscreen');
            if (btn) {
                const icon = btn.querySelector('.fs-icon');
                const txt = btn.querySelector('.fs-text');
                if (isFs) {
                    if (icon) icon.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6m10-10h-6V4m0 6 7-7M4 20l7-7"></path></svg>';
                    if (txt) txt.textContent = 'Keluar Layar Penuh';
                    btn.classList.add('active');
                } else {
                    if (icon) icon.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>';
                    if (txt) txt.textContent = 'Layar Penuh';
                    btn.classList.remove('active');
                }
            }
        },

        toggleFullscreen: function () {
            const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

            if (isIos && !document.fullscreenEnabled && !document.documentElement.webkitRequestFullscreen) {
                // Tampilkan panduan iOS Add to Home Screen jika peramban Safari iOS membatasi API
                const iosModal = document.getElementById('ios-fs-modal');
                if (iosModal) iosModal.style.display = 'flex';
                return;
            }

            const docEl = document.documentElement;
            const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);

            if (!isFs) {
                if (docEl.requestFullscreen) {
                    docEl.requestFullscreen().catch(() => {});
                } else if (docEl.webkitRequestFullscreen) {
                    docEl.webkitRequestFullscreen();
                }

                // Kunci orientasi ke landscape jika didukung perangkat mobile
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock('landscape').catch(() => {});
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen().catch(() => {});
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }
        }
    };

    // Auto-init saat DOM siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.MensetsuGate.init());
    } else {
        window.MensetsuGate.init();
    }
})();
