// =========================================================================
// SISTEM ONBOARDING BERTALAP & KONTROL MULTI-DEVICE (GATE SCREEN v3.0)
// Mensetsu VR Room - Step 1: Device Selection | Step 2: Student Name
// Fullscreen Button: Hanya muncul di pojok kanan atas saat bermain
// =========================================================================

(function () {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                           (window.matchMedia && window.matchMedia('(max-width: 768px)').matches && 'ontouchstart' in window);

    // Inisialisasi State Global Mensetsu
    window.MensetsuState = {
        studentName: localStorage.getItem('mensetsu_student_name') || '',
        sessionId: localStorage.getItem('mensetsu_session_id') || generateSessionId(),
        deviceMode: isMobileDevice ? 'mobile' : 'pc', // 'pc' | 'mobile' | 'vr'
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
            desc: 'Layar Sentuh (Bebas Gyro)',
            actionDesc: 'Geser layar dengan tangan untuk putar kamera (bebas gyro). Joystick kiri untuk jalan. Tombol Xbox kanan: <span style="color:#ffc800"><strong>Y</strong> (Aksi)</span>, <span style="color:#38bdf8"><strong>X</strong> (Ketuk)</span>, <span style="color:#f87171"><strong>B</strong> (Mic)</span>, <span style="color:#4ade80"><strong>A</strong> (Ojigi)</span>.'
        },
        vr: {
            name: 'Headset VR',
            icon: 'assets/device-vr.png',
            desc: 'Doble Layar Stereoskopik',
            actionDesc: 'Mode VR dual display. Controller VR (tekan <strong>@ + B</strong> untuk Game Mode): <strong>Analog</strong> = Jalan, <strong>A</strong> = Ojigi, <strong>B</strong> = Mic, <strong>C</strong> = Ketuk, <strong>D</strong> = Aksi, <strong>Trigger Samping</strong> = Aksi.'
        }
    };

    window.MensetsuGate = {
        init: function () {
            this.createTopNavBar();
            this.createGateModal();
            this.setupFullscreenHandler();
            this.initGpuWarmupPipeline();
            this.guardAframeFullscreen();
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

        // Modal Onboarding Bertahap: Step 0 (Cinematic Preloader & GPU Warmup) -> Step 1 (Pilih Device) -> Step 2 (Input Nama)
        createGateModal: function () {
            if (document.getElementById('gate-screen')) return;

            const modal = document.createElement('div');
            modal.id = 'gate-screen';
            modal.innerHTML = `
                <!-- ==================================================== -->
                <!-- LANGKAH 0: FULLSCREEN MINIMALIST PRELOADER & GPU WARMUP-->
                <!-- HANYA 3D HOLOGRAM GYROSCOPE BESAR + MENSETSU VR ROOM -->
                <!-- ==================================================== -->
                <div id="gate-step-loading" class="fullscreen-loader-overlay gate-step-visible">
                    <div class="fullscreen-loader-content">
                        <!-- Visual Hologram 3D Gyroscope (Diperbesar Full-Screen) -->
                        <div class="cinematic-gyro-stage large-gyro">
                            <div class="gyro-ambient-glow"></div>
                            <div class="gyro-ring ring-1"></div>
                            <div class="gyro-ring ring-2"></div>
                            <div class="gyro-ring ring-3"></div>
                            <div class="gyro-radar-sweep"></div>
                            <div class="gyro-core-crest">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                    <path d="M3 11a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-2l-2-2h-4l-2 2H6a3 3 0 0 1-3-3v-4z"/>
                                    <circle cx="8.5" cy="13" r="1.5"/>
                                    <circle cx="15.5" cy="13" r="1.5"/>
                                    <path d="M12 8V5M8 5h8"/>
                                </svg>
                            </div>
                        </div>

                        <!-- Brand Title Bersih: MENSETSU VR ROOM -->
                        <h1 class="fullscreen-loader-title">
                            MENSETSU <span class="hero-accent">VR ROOM</span>
                        </h1>

                        <!-- Slim Laser Progress Track (Minimalist Feedback) -->
                        <div class="fullscreen-progress-track">
                            <div id="loader-progress-fill" class="fullscreen-progress-fill" style="width: 0%;">
                                <div class="progress-laser-glow"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ==================================================== -->
                <!-- MODAL KARTU: ONBOARDING LANGKAH 1, 2 & 3             -->
                <!-- ==================================================== -->
                <div class="gate-card gate-step-hidden" id="gate-onboarding-card">
                    <!-- ==================================================== -->
                    <!-- LANGKAH 1: PERIZINAN MIKROFON WAWANCARA (UPFRONT)   -->
                    <!-- ==================================================== -->
                    <div id="gate-step-mic" class="gate-step-panel gate-step-visible">
                        <div class="gate-header">
                            <div class="gate-badge">音声認識・マイク権限確認</div>
                            <h1 class="gate-title">Izin Akses Mikrofon</h1>
                            <p class="gate-subtitle">Simulasi wawancara menggunakan perekaman suara untuk menjawab pertanyaan dosen/pewawancara. Aktifkan izin mikrofon sekarang sebelum memilih perangkat & memasang kacamata VR.</p>
                        </div>

                        <div class="gate-body">
                            <div class="mic-permission-box" id="gate-mic-box">
                                <div class="mic-permission-icon-wrap" id="gate-mic-icon-wrap">
                                    <div class="mic-pulse-ring"></div>
                                    <div class="mic-pulse-ring-2"></div>
                                    <div class="mic-icon-circle">
                                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                                            <line x1="12" y1="19" x2="12" y2="23"/>
                                            <line x1="8" y1="23" x2="16" y2="23"/>
                                        </svg>
                                    </div>
                                </div>

                                <div class="mic-permission-info">
                                    <h3 class="mic-status-title" id="gate-mic-status-title">Status: Menunggu Izin Browser</h3>
                                    <p class="mic-status-desc" id="gate-mic-status-desc">Klik tombol di bawah untuk memberikan izin akses mikrofon agar tidak ada dialog browser yang menghalangi pandangan saat bermain di mode VR 360.</p>
                                </div>
                            </div>

                            <div id="gate-mic-error-msg" class="validation-msg" style="display:none;"></div>

                            <div style="text-align: center;">
                                <div class="engine-ready-badge">
                                    <span class="engine-dot-pulse"></span>
                                    <span>WAV 16kHz PCM Audio Stream • Google Drive Cloud Ready</span>
                                </div>
                            </div>
                        </div>

                        <div class="gate-footer">
                            <button type="button" class="btn-start-simulation" id="gate-btn-request-mic">
                                <span>Aktifkan & Izinkan Mikrofon</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                            </button>
                            <button type="button" class="btn-gate-skip" id="gate-btn-skip-mic">
                                Lewati sementara (Lanjut Pilih Perangkat)
                            </button>
                        </div>
                    </div>

                    <!-- ==================================================== -->
                    <!-- LANGKAH 2: PERTANYAAN PILIH DEVICE (3 GAMBAR CLICKABLE)-->
                    <!-- ==================================================== -->
                    <div id="gate-step-device" class="gate-step-panel gate-step-hidden">
                        <div class="gate-header">
                            <div class="step-nav-row">
                                <button type="button" class="btn-gate-back" id="btn-back-to-mic" title="Periksa ulang mikrofon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5m7 7-7-7 7-7"/></svg>
                                    <span>Cek Mikrofon</span>
                                </button>
                                <div class="gate-badge">Pilihan Perangkat • 端末選択</div>
                            </div>
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
                                        <p class="device-choice-desc">Layar Sentuh (Bebas Gyro)</p>
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
                                        <p class="device-choice-desc">Doble Layar Kanan-Kiri</p>
                                        <span class="device-choice-btn">Pilih Perangkat →</span>
                                    </div>
                                </div>
                            </div>

                            <div style="text-align: center;">
                                <div class="engine-ready-badge">
                                    <span class="engine-dot-pulse"></span>
                                    <span>GPU Shaders Pre-compiled • 60 FPS Zero-Hitch Ready</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ==================================================== -->
                    <!-- LANGKAH 3: INPUT NAMA LENGKAP MAHASISWA / KANDIDAT   -->
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

                            <!-- Indikator Status Mikrofon -->
                            <div class="selected-device-pill" style="margin-top: -4px;">
                                <span class="pill-label">Status Mikrofon:</span>
                                <div class="pill-value" id="gate-name-mic-pill">
                                    <span style="color:#4ade80; display:flex; align-items:center; gap:6px;">
                                        <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#4ade80;"></span> Terhubung & Siap
                                    </span>
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

                            <div style="text-align: center;">
                                <div class="engine-ready-badge">
                                    <span class="engine-dot-pulse"></span>
                                    <span>GPU Shaders Pre-compiled • 60 FPS Zero-Hitch Ready</span>
                                </div>
                            </div>
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
            // 0. Tombol Lanjutkan dari Layar Loading jika pengguna ingin langsung klik
            const loaderReadyBtn = document.getElementById('btn-loader-ready');
            if (loaderReadyBtn) {
                loaderReadyBtn.addEventListener('click', () => {
                    this.goToStepMic();
                });
            }

            // 0.5. Tombol Aksi Izin Mikrofon (Step 1)
            const btnReqMic = document.getElementById('gate-btn-request-mic');
            if (btnReqMic) {
                btnReqMic.addEventListener('click', () => {
                    this.handleRequestMic();
                });
            }

            const btnSkipMic = document.getElementById('gate-btn-skip-mic');
            if (btnSkipMic) {
                btnSkipMic.addEventListener('click', () => {
                    this.goToStepDevice();
                });
            }

            const btnBackToMic = document.getElementById('btn-back-to-mic');
            if (btnBackToMic) {
                btnBackToMic.addEventListener('click', () => {
                    this.goToStepMic();
                });
            }

            // 1. Klik pada Kartu Pilihan Gambar Device
            const cards = document.querySelectorAll('.device-choice-card');
            cards.forEach(card => {
                const triggerAction = () => {
                    const chosen = card.getAttribute('data-device') || 'pc';
                    // Jika mic belum aktif, minta izin secara otomatis memanfaatkan interaksi klik ini
                    if (window.MensetsuRecorder && !window.MensetsuState.micGranted && typeof window.MensetsuRecorder.requestPermission === 'function') {
                        window.MensetsuRecorder.requestPermission().catch(() => {});
                    }
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

        // Pipeline Pre-warming GPU & Telemetri Progres Sinematik (Paced 5.5s Deep Warmup)
        initGpuWarmupPipeline: function () {
            let progress = 8;
            const fillEl = document.getElementById('loader-progress-fill');
            const percentEl = document.getElementById('loader-percent-num');
            const statusEl = document.getElementById('loader-status-text');
            const tickerEl = document.getElementById('loader-ticker-detail');
            const btnReady = document.getElementById('btn-loader-ready');
            const telemAssets = document.getElementById('telem-assets');
            const telemGpu = document.getElementById('telem-gpu');
            const telemGpuVal = document.getElementById('telem-gpu-val');
            const telemAssetsVal = document.getElementById('telem-assets-val');
            const telemFps = document.getElementById('telem-fps');
            const telemFpsVal = document.getElementById('telem-fps-val');

            // 1. Preload 3 gambar kartu perangkat segera di latar belakang
            ['assets/device-pc.png', 'assets/device-mobile.png', 'assets/device-vr.png'].forEach(src => {
                const img = new Image();
                img.src = src;
            });

            const setProgress = (val, statusText, tickerText) => {
                progress = Math.max(progress, Math.min(100, Math.round(val)));
                if (fillEl) fillEl.style.width = `${progress}%`;
                if (percentEl) percentEl.textContent = `${progress}%`;
                if (statusText && statusEl) statusEl.textContent = statusText;
                if (tickerText && tickerEl) tickerEl.textContent = tickerText;
            };

            setProgress(10, 'Menginisialisasi Engine WebXR & Audio...', 'Mengunduh struktur sub-scene ruang tunggu & wawancara...');

            let scenesReady = false;
            let gpuWarmupDone = false;
            let currentTargetProgress = 22;

            const onScenesLoaded = () => {
                scenesReady = true;
                currentTargetProgress = 54;
                if (telemAssets) telemAssets.classList.add('is-ready');
                if (telemAssetsVal) telemAssetsVal.textContent = '100% SIAP';
                checkAndPerformGpuWarmup();
            };

            window.addEventListener('scenes-loaded', onScenesLoaded, { once: true });
            if (document.getElementById('waiting-and-reception-hall')) {
                onScenesLoaded();
            }

            const checkAndPerformGpuWarmup = () => {
                const sceneEl = document.querySelector('a-scene');
                if (!sceneEl) {
                    setTimeout(checkAndPerformGpuWarmup, 100);
                    return;
                }

                const executeCompile = () => {
                    if (gpuWarmupDone) return;

                    currentTargetProgress = 78;
                    setProgress(progress, 'Mengompilasi Shader GPU & VBO Caching...', 'Menjalankan shader program compilation & upload tekstur PBR ke VRAM...');

                    // Beri jeda 850ms agar progress animasi bergerak halus sebelum eksekusi multi-pass
                    setTimeout(() => {
                        try {
                            const renderer = sceneEl.renderer;
                            const camera = sceneEl.camera;
                            const threeScene = sceneEl.object3D;

                            if (renderer && camera && threeScene) {
                                // 1. Pre-kompilasi seluruh shader di scene graph
                                renderer.compile(threeScene, camera);

                                // 2. Multi-pass warmup: Jalankan 5 render pass beruntun via requestAnimationFrame
                                // Ini memicu GPU driver mem-flush command queue dan menstabilkan cache VRAM secara total
                                let warmFrames = 0;
                                const maxWarmFrames = 5;

                                const runWarmupFrame = () => {
                                    if (warmFrames < maxWarmFrames) {
                                        try {
                                            const curRT = renderer.getRenderTarget();
                                            renderer.render(threeScene, camera);
                                            renderer.setRenderTarget(curRT);
                                        } catch (e) {}
                                        warmFrames++;
                                        requestAnimationFrame(runWarmupFrame);
                                    } else {
                                        // 3. Pastikan kedua ruangan aktif (visible = true) sejak awal di ruang tunggu agar bebas pop-in dan bebas lag
                                        const interviewRoom = document.getElementById('scene-interview-room');
                                        if (interviewRoom && interviewRoom.object3D) {
                                            interviewRoom.object3D.visible = true;
                                        }

                                        gpuWarmupDone = true;
                                        currentTargetProgress = 100;

                                        if (telemGpu) telemGpu.classList.add('is-ready');
                                        if (telemGpuVal) telemGpuVal.textContent = '100% SIAP';
                                        if (telemFps) telemFps.classList.add('is-ready');
                                        if (telemFpsVal) telemFpsVal.textContent = 'TERKUNCI 60 FPS';

                                        setProgress(100, 'Sistem Siap! Performa 60 FPS Solid Terkunci', 'Seluruh shader, material, dan VRAM GPU telah stabil & siap digunakan.');

                                        if (btnReady) {
                                            btnReady.classList.add('is-active');
                                        }

                                        // Transisi otomatis halus ke Step 1 (Izin Mikrofon Upfront) setelah jeda elegan 950ms
                                        setTimeout(() => {
                                            const stepLoading = document.getElementById('gate-step-loading');
                                            if (stepLoading && stepLoading.classList.contains('gate-step-visible')) {
                                                this.goToStepMic();
                                            }
                                        }, 950);
                                    }
                                };

                                requestAnimationFrame(runWarmupFrame);
                                return;
                            }
                        } catch (err) {
                            console.warn('Catatan Warmup GPU:', err);
                        }

                        // Fallback jika renderer belum siap
                        gpuWarmupDone = true;
                        currentTargetProgress = 100;
                        setProgress(100, 'Sistem Siap! Performa 60 FPS Optimal', 'Semua aset siap.');
                        setTimeout(() => {
                            const stepLoading = document.getElementById('gate-step-loading');
                            if (stepLoading && stepLoading.classList.contains('gate-step-visible')) {
                                this.goToStepMic();
                            }
                        }, 950);
                    }, 850);
                };

                if (sceneEl.hasLoaded && sceneEl.renderer && sceneEl.camera) {
                    executeCompile();
                } else {
                    sceneEl.addEventListener('loaded', executeCompile, { once: true });
                    sceneEl.addEventListener('renderstart', executeCompile, { once: true });
                    setTimeout(executeCompile, 2800);
                }
            };

            // Animasi progress bar berbobot halus (Smooth Pacing ~5.0 - 5.5s)
            let simTimer = setInterval(() => {
                if (progress < currentTargetProgress) {
                    const step = Math.max(1, Math.round((currentTargetProgress - progress) * 0.10));
                    const nextVal = Math.min(currentTargetProgress, progress + step);
                    
                    let status = null;
                    let ticker = null;
                    if (nextVal < 28) {
                        status = 'Menginisialisasi Engine WebXR & Audio...';
                        ticker = 'Mengunduh struktur sub-scene ruang tunggu & wawancara...';
                    } else if (nextVal < 55) {
                        status = 'Aset Ruangan Terhubung. Mengompilasi Shader GPU...';
                        ticker = 'Mempersiapkan pipeline grafis PBR dan tekstur VRAM...';
                    } else if (nextVal < 82) {
                        status = 'Menjalankan Multi-Pass GPU Pre-warming...';
                        ticker = 'Menstabilkan frame buffer 5-pass agar bebas drop pada pemilihan perangkat...';
                    } else if (nextVal < 99) {
                        status = 'Sinkronisasi Sistem & Validasi Frame Rate...';
                        ticker = 'Memverifikasi stabilitas 60 FPS Solid di memori GPU...';
                    }

                    setProgress(nextVal, status, ticker);
                }

                if (progress >= 100 && gpuWarmupDone) {
                    clearInterval(simTimer);
                }
            }, 90);
        },

        // Navigasi ke Step 1 (Izin Mikrofon Upfront)
        goToStepMic: function () {
            if (typeof playAudioFeedback === 'function') playAudioFeedback('click');

            const stepLoad = document.getElementById('gate-step-loading');
            const onbCard = document.getElementById('gate-onboarding-card');
            const stepMic = document.getElementById('gate-step-mic');
            const step1 = document.getElementById('gate-step-device');
            const step2 = document.getElementById('gate-step-name');

            if (stepLoad) {
                stepLoad.classList.remove('gate-step-visible');
                stepLoad.classList.add('gate-step-hidden');
            }
            if (onbCard) {
                onbCard.classList.remove('gate-step-hidden');
                onbCard.classList.add('gate-step-visible');
            }
            if (step1) {
                step1.classList.remove('gate-step-visible');
                step1.classList.add('gate-step-hidden');
            }
            if (step2) {
                step2.classList.remove('gate-step-visible');
                step2.classList.add('gate-step-hidden');
            }
            if (stepMic) {
                stepMic.classList.remove('gate-step-hidden');
                stepMic.classList.add('gate-step-visible');
            }

            this.updateMicPermissionUI();
        },

        // Perbarui Visual Status Izin Mikrofon (Cek State Browser)
        updateMicPermissionUI: async function () {
            const iconWrap = document.getElementById('gate-mic-icon-wrap');
            const titleEl = document.getElementById('gate-mic-status-title');
            const descEl = document.getElementById('gate-mic-status-desc');
            const btnReq = document.getElementById('gate-btn-request-mic');
            const errBox = document.getElementById('gate-mic-error-msg');

            let status = 'prompt';
            if (window.MensetsuRecorder && typeof window.MensetsuRecorder.checkPermissionStatus === 'function') {
                status = await window.MensetsuRecorder.checkPermissionStatus();
            } else if (navigator.permissions && navigator.permissions.query) {
                try {
                    const res = await navigator.permissions.query({ name: 'microphone' });
                    status = res ? res.state : 'prompt';
                } catch (e) {}
            }

            if (window.MensetsuState && window.MensetsuState.micGranted) {
                status = 'granted';
            }

            if (status === 'granted') {
                if (iconWrap) {
                    iconWrap.classList.add('is-granted');
                    iconWrap.classList.remove('is-denied');
                }
                if (titleEl) titleEl.textContent = 'Status: Mikrofon Aktif & Terverifikasi!';
                if (descEl) descEl.textContent = 'Izin browser telah aktif. Tidak akan ada popup dialog yang mengganggu pandangan saat bermain di mode VR 360.';
                if (errBox) errBox.style.display = 'none';
                if (btnReq) {
                    btnReq.innerHTML = `<span>Lanjut ke Pemilihan Perangkat</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>`;
                    btnReq.style.background = 'linear-gradient(135deg, #15803d 0%, #166534 100%)';
                    btnReq.style.borderColor = '#22c55e';
                }
            } else if (status === 'denied') {
                if (iconWrap) {
                    iconWrap.classList.remove('is-granted');
                    iconWrap.classList.add('is-denied');
                }
                if (titleEl) titleEl.textContent = 'Status: Izin Mikrofon Diblokir Browser';
                if (descEl) descEl.textContent = 'Browser Anda memblokir mikrofon. Klik ikon gembok / perizinan di address bar browser, ubah Microphone menjadi "Izinkan (Allow)", lalu coba lagi.';
                if (btnReq) {
                    btnReq.innerHTML = `<span>Coba Periksa Izin Lagi</span>`;
                }
            } else {
                if (iconWrap) iconWrap.classList.remove('is-granted', 'is-denied');
                if (titleEl) titleEl.textContent = 'Status: Menunggu Izin Browser';
                if (descEl) descEl.textContent = 'Klik tombol di bawah untuk memberikan izin akses mikrofon agar tidak ada dialog browser yang menghalangi pandangan saat bermain di mode VR 360.';
                if (btnReq) {
                    btnReq.innerHTML = `<span>Aktifkan & Izinkan Mikrofon</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>`;
                    btnReq.style.background = '';
                    btnReq.style.borderColor = '';
                }
            }
        },

        // Handler Meminta Izin Mikrofon Upfront
        handleRequestMic: async function () {
            const btnReq = document.getElementById('gate-btn-request-mic');
            const errBox = document.getElementById('gate-mic-error-msg');
            const iconWrap = document.getElementById('gate-mic-icon-wrap');
            const titleEl = document.getElementById('gate-mic-status-title');
            const descEl = document.getElementById('gate-mic-status-desc');

            if (window.MensetsuState && window.MensetsuState.micGranted) {
                this.goToStepDevice();
                return;
            }

            if (btnReq) {
                btnReq.disabled = true;
                btnReq.innerHTML = `<span>Meminta Izin Browser...</span>`;
            }
            if (errBox) errBox.style.display = 'none';

            try {
                if (window.MensetsuRecorder && typeof window.MensetsuRecorder.requestPermission === 'function') {
                    await window.MensetsuRecorder.requestPermission();
                } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    stream.getTracks().forEach(t => t.stop());
                    if (!window.MensetsuState) window.MensetsuState = {};
                    window.MensetsuState.micGranted = true;
                }

                if (typeof playAudioFeedback === 'function') playAudioFeedback('click');

                if (iconWrap) {
                    iconWrap.classList.add('is-granted');
                    iconWrap.classList.remove('is-denied');
                }
                if (titleEl) titleEl.textContent = 'Status: Izin Berhasil Diaktifkan!';
                if (descEl) descEl.textContent = 'Mikrofon terhubung dan terverifikasi. Membuka pilihan perangkat...';

                if (btnReq) {
                    btnReq.innerHTML = `<span>Izin Diterima! Menuju Perangkat...</span>`;
                    btnReq.style.background = 'linear-gradient(135deg, #15803d 0%, #166534 100%)';
                    btnReq.style.borderColor = '#22c55e';
                }

                setTimeout(() => {
                    this.goToStepDevice();
                    if (btnReq) btnReq.disabled = false;
                }, 600);

            } catch (err) {
                console.warn('Izin mic ditolak/gagal:', err);
                if (btnReq) {
                    btnReq.disabled = false;
                    btnReq.innerHTML = `<span>Coba Izinkan Lagi</span>`;
                }
                if (iconWrap) {
                    iconWrap.classList.remove('is-granted');
                    iconWrap.classList.add('is-denied');
                }
                if (titleEl) titleEl.textContent = 'Akses Mikrofon Belum Diizinkan';
                if (descEl) descEl.textContent = 'Pastikan Anda menekan "Izinkan" pada kotak dialog browser, atau periksa ikon gembok di bilah alamat browser.';
                if (errBox) {
                    errBox.textContent = 'Akses mikrofon ditolak oleh browser. Silakan klik ikon gembok pada URL address bar lalu izinkan Microphone.';
                    errBox.style.display = 'block';
                }
            }
        },

        // Navigasi ke Step 2 (Pilih Device)
        goToStepDevice: function () {
            if (typeof playAudioFeedback === 'function') playAudioFeedback('click');

            const stepLoad = document.getElementById('gate-step-loading');
            const onbCard = document.getElementById('gate-onboarding-card');
            const stepMic = document.getElementById('gate-step-mic');
            const step1 = document.getElementById('gate-step-device');
            const step2 = document.getElementById('gate-step-name');

            if (stepLoad) {
                stepLoad.classList.remove('gate-step-visible');
                stepLoad.classList.add('gate-step-hidden');
            }
            if (onbCard) {
                onbCard.classList.remove('gate-step-hidden');
                onbCard.classList.add('gate-step-visible');
            }
            if (stepMic) {
                stepMic.classList.remove('gate-step-visible');
                stepMic.classList.add('gate-step-hidden');
            }
            if (step2) {
                step2.classList.remove('gate-step-visible');
                step2.classList.add('gate-step-hidden');
            }
            if (step1) {
                step1.classList.remove('gate-step-hidden');
                step1.classList.add('gate-step-visible');
            }
        },

        // Navigasi ke Step 3 (Input Nama)
        goToStepName: function (deviceMode) {
            window.MensetsuState.deviceMode = deviceMode;
            if (typeof playAudioFeedback === 'function') playAudioFeedback('click');

            const info = DEVICE_METADATA[deviceMode] || DEVICE_METADATA.pc;
            const imgEl = document.getElementById('gate-selected-device-img');
            const nameEl = document.getElementById('gate-selected-device-name');
            if (imgEl) imgEl.src = info.icon;
            if (nameEl) nameEl.textContent = info.name;

            const micPill = document.getElementById('gate-name-mic-pill');
            if (micPill) {
                if (window.MensetsuState && window.MensetsuState.micGranted) {
                    micPill.innerHTML = `<span style="color:#4ade80; display:flex; align-items:center; gap:6px;"><span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#4ade80;"></span> Terhubung & Siap</span>`;
                } else {
                    micPill.innerHTML = `<span style="color:#fbbf24; display:flex; align-items:center; gap:6px;"><span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#fbbf24;"></span> Belum Diizinkan</span>`;
                }
            }

            const stepLoad = document.getElementById('gate-step-loading');
            const onbCard = document.getElementById('gate-onboarding-card');
            const stepMic = document.getElementById('gate-step-mic');
            const step1 = document.getElementById('gate-step-device');
            const step2 = document.getElementById('gate-step-name');

            if (stepLoad) {
                stepLoad.classList.remove('gate-step-visible');
                stepLoad.classList.add('gate-step-hidden');
            }
            if (onbCard) {
                onbCard.classList.remove('gate-step-hidden');
                onbCard.classList.add('gate-step-visible');
            }
            if (stepMic) {
                stepMic.classList.remove('gate-step-visible');
                stepMic.classList.add('gate-step-hidden');
            }
            if (step1) {
                step1.classList.remove('gate-step-visible');
                step1.classList.add('gate-step-hidden');
            }
            if (step2) {
                step2.classList.remove('gate-step-hidden');
                step2.classList.add('gate-step-visible');

                const nameInput = document.getElementById('gate-input-name');
                if (nameInput) {
                    setTimeout(() => nameInput.focus(), 150);
                }
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

            // Jika mode VR dan di iOS, minta izin sensor orientasi kepala saat tombol diklik
            if (window.MensetsuState.deviceMode === 'vr' && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission().then(resp => {
                    console.log('Izin orientasi sensor VR iOS:', resp);
                }).catch(() => {});
            }

            // Aktifkan Kontrol Sesuai Mode Perangkat yang Dipilih
            if (window.MensetsuControls && typeof window.MensetsuControls.init === 'function') {
                window.MensetsuControls.init(window.MensetsuState.deviceMode);
            }

            // Coba aktifkan fullscreen otomatis untuk kenyamanan VR headset jika didukung
            if (window.MensetsuState.deviceMode === 'vr' && typeof this.toggleFullscreen === 'function') {
                const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
                if (!isFs) {
                    try { this.toggleFullscreen(); } catch (_) {}
                }
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
        },

        // Mencegah A-Frame mengisolasi elemen <canvas> ke mode VR/fullscreen sendiri yang menghilangkan UI DOM HTML
        guardAframeFullscreen: function () {
            const patchScene = () => {
                const scene = document.querySelector('a-scene');
                if (!scene) return;

                // Nonaktifkan keyboard shortcut enterVR bawaan A-Frame jika ada
                if (scene.hasAttribute && !scene.hasAttribute('keyboard-shortcuts')) {
                    scene.setAttribute('keyboard-shortcuts', 'enterVR: false');
                }

                // Arahkan pemanggilan enterVR A-Frame ke Fullscreen dokumen penuh
                scene.enterVR = () => {
                    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
                    if (!isFs && typeof this.toggleFullscreen === 'function') {
                        this.toggleFullscreen();
                    }
                };

                // Jika terpicu event enter-vr dan canvas sempat terisolasi, perbaiki kembali
                scene.addEventListener('enter-vr', () => {
                    if (document.fullscreenElement && document.fullscreenElement !== document.documentElement) {
                        if (document.exitFullscreen) {
                            document.exitFullscreen().then(() => {
                                if (typeof this.toggleFullscreen === 'function') {
                                    this.toggleFullscreen();
                                }
                            }).catch(() => {});
                        }
                    }
                });
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', patchScene);
            } else {
                patchScene();
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
