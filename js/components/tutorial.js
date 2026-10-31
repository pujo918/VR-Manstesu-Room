// =========================================================================
// SISTEM PANDUAN KONTROL INTERAKTIF MULTI-DEVICE
// Mensetsu VR Room:
// - Mode PC & Mobile : Interactive Viewfinder Spotlight (5 Langkah)
// - Mode Headset VR  : Stereoscopic Warm-Up Checklist (4 Latihan Langsung)
// - Penyimpanan      : Otomatis 1 kali per mode device di setiap browser
//                      (mensetsu_tutorial_done_pc / _mobile / _vr)
// =========================================================================

(function () {
    const STORAGE_KEY_PREFIX = 'mensetsu_tutorial_done_';

    // Simbol SVG Vektor Presisi (Tanpa Emote / Emoji)
    const SVG_ICONS = {
        moveAxis: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/><path d="m9 5 3-3 3 3M15 19l-3 3-3-3M5 9l-3 3 3 3M19 9l3 3-3 3"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/></svg>`,
        cameraOrbit: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="10" ry="4.5"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/></svg>`,
        mouseLook: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="6"/><line x1="12" y1="7" x2="12" y2="11"/><path d="m2 10-1.5 2L2 14M22 10l1.5 2L22 14"/></svg>`,
        reticleTarget: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><line x1="12" y1="1" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="1" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="23" y2="12"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>`,
        actionInteract: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
        etiquetteBow: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="15" cy="6" r="2.5"/><path d="M6 21v-7l6-4 4 2.5"/><path d="M19 11a7 7 0 0 1-2 6"/><line x1="3" y1="21" x2="13" y2="21"/></svg>`,
        gamepadVR: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="4"/><path d="M6 12h4M8 10v4"/><circle cx="15" cy="11" r="1" fill="currentColor"/><circle cx="17" cy="13" r="1" fill="currentColor"/></svg>`,
        swipeGesture: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"/><path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/></svg>`,
        closeX: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
        chevronLeft: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
        chevronRight: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
        checkMark: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
        boxEmpty: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>`,
        boxChecked: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" fill="rgba(21, 128, 61, 0.25)"/><polyline points="16.5 8.5 10.5 15 7.5 12"/></svg>`
    };

    const MOBILE_STEPS = [
        {
            id: 'mob-move',
            stepNum: '01 / 05',
            category: 'PERGERAKAN • 移動',
            icon: SVG_ICONS.moveAxis,
            title: 'Navigasi Langkah (Analog Kiri)',
            desc: 'Geser dan tahan tuas analog di <strong>pojok kiri bawah</strong> ke arah depan, belakang, kiri, atau kanan untuk berjalan mengelilingi ruangan.',
            targetSelector: '#virtual-joystick-zone',
            padding: 10,
            borderRadius: '10px',
            preferredSide: 'right'
        },
        {
            id: 'mob-look',
            stepNum: '02 / 05',
            category: 'ORIENTASI KAMERA • 視点',
            icon: SVG_ICONS.cameraOrbit,
            title: 'Rotasi Pandangan 360 Derajat',
            desc: 'Usap (geser) <strong>area tengah atau kanan layar</strong> dengan jari untuk menengok ke sekeliling ruangan <em>(Bebas Gyro / tanpa memiringkan perangkat)</em>.',
            targetSelector: '#tutorial-swipe-zone-indicator',
            padding: 8,
            borderRadius: '8px',
            preferredSide: 'bottom'
        },
        {
            id: 'mob-reticle',
            stepNum: '03 / 05',
            category: 'TITIK FOKUS • 照準',
            icon: SVG_ICONS.reticleTarget,
            title: 'Titik Fokus Tengah (Reticle)',
            desc: 'Arahkan <strong>titik bidik di tengah layar</strong> tepat ke objek sasaran (Meja Resepsionis, Sofa, TV, Pintu, atau Kursi) sebelum menekan tombol interaksi.',
            targetSelector: '.reticle-dot',
            padding: 20,
            borderRadius: '6px',
            preferredSide: 'bottom'
        },
        {
            id: 'mob-yx',
            stepNum: '04 / 05',
            category: 'INTERAKSI OBJEK • 操作',
            icon: SVG_ICONS.actionInteract,
            title: 'Tombol Aksi Utama (Y) & Ketuk Pintu (X)',
            desc: '<div class="tut-btn-list">' +
                  '<div class="tut-btn-item">' +
                      '<span class="tut-key-pill pill-y">Y</span>' +
                      '<div class="tut-btn-copy"><strong>Aksi Utama</strong><span>Duduk di sofa/kursi, nyalakan TV panduan, bicara ke resepsionis, & buka pintu.</span></div>' +
                  '</div>' +
                  '<div class="tut-btn-item">' +
                      '<span class="tut-key-pill pill-x">X</span>' +
                      '<div class="tut-btn-copy"><strong>Ketuk Pintu</strong><span>Mengetuk pintu ruang wawancara (standar etika Jepang: 3 ketukan).</span></div>' +
                  '</div>' +
                  '</div>',
            targetSelector: '#mobile-action-buttons',
            highlightButtons: ['mob-btn-y', 'mob-btn-x'],
            padding: 8,
            borderRadius: '10px',
            preferredSide: 'left'
        },
        {
            id: 'mob-ab',
            stepNum: '05 / 05',
            category: 'ETIKA & SUARA • 礼儀・音声',
            icon: SVG_ICONS.etiquetteBow,
            title: 'Salam Ojigi (A) & Perekam Suara (B)',
            desc: '<div class="tut-btn-list">' +
                  '<div class="tut-btn-item">' +
                      '<span class="tut-key-pill pill-a">A</span>' +
                      '<div class="tut-btn-copy"><strong>Ojigi 30 Derajat</strong><span>Membungkukkan badan untuk memberi salam hormat (Keirei).</span></div>' +
                  '</div>' +
                  '<div class="tut-btn-item">' +
                      '<span class="tut-key-pill pill-b">B</span>' +
                      '<div class="tut-btn-copy"><strong>Rekam Jawaban (Mic)</strong><span>Tekan sekali untuk mulai bicara saat wawancara, tekan <strong>B</strong> lagi untuk selesai.</span></div>' +
                  '</div>' +
                  '</div>',
            targetSelector: '#mobile-action-buttons',
            highlightButtons: ['mob-btn-a', 'mob-btn-b'],
            padding: 8,
            borderRadius: '10px',
            preferredSide: 'left'
        }
    ];

    const PC_STEPS = [
        {
            id: 'pc-move',
            stepNum: '01 / 05',
            category: 'PERGERAKAN • 移動',
            icon: SVG_ICONS.moveAxis,
            title: 'Navigasi Langkah (Keyboard WASD)',
            desc: 'Gunakan tombol <strong>W</strong> (Maju), <strong>S</strong> (Mundur), <strong>A</strong> (Kiri), dan <strong>D</strong> (Kanan) atau tombol <strong>Panah</strong> untuk berjalan mengelilingi ruangan.',
            targetSelector: '#pc-tut-dock-wasd',
            padding: 8,
            borderRadius: '8px',
            preferredSide: 'top'
        },
        {
            id: 'pc-look',
            stepNum: '02 / 05',
            category: 'ORIENTASI KAMERA • 視点',
            icon: SVG_ICONS.mouseLook,
            title: 'Rotasi Pandangan (Mouse)',
            desc: '<strong>Klik kiri dan tahan</strong> pada layar lalu geser mouse ke kiri, kanan, atas, atau bawah untuk mengarahkan pandangan kamera.',
            targetSelector: '#pc-tut-dock-mouse',
            padding: 8,
            borderRadius: '8px',
            preferredSide: 'top'
        },
        {
            id: 'pc-reticle',
            stepNum: '03 / 05',
            category: 'TITIK FOKUS • 照準',
            icon: SVG_ICONS.reticleTarget,
            title: 'Titik Fokus Tengah (Reticle)',
            desc: 'Arahkan <strong>titik bidik di tengah layar</strong> tepat ke objek sasaran (Meja Resepsionis, Sofa, TV, Pintu, atau Kursi) sebelum menekan tombol interaksi.',
            targetSelector: '.reticle-dot',
            padding: 20,
            borderRadius: '6px',
            preferredSide: 'bottom'
        },
        {
            id: 'pc-actions-1',
            stepNum: '04 / 05',
            category: 'INTERAKSI OBJEK • 操作',
            icon: SVG_ICONS.actionInteract,
            title: 'Tombol Interaksi (F) & Ketuk Pintu (K)',
            desc: '<div class="tut-btn-list">' +
                  '<div class="tut-btn-item">' +
                      '<span class="tut-key-pill pill-y">F</span>' +
                      '<div class="tut-btn-copy"><strong>Aksi Utama</strong><span>Duduk/berdiri di sofa & kursi, nyalakan TV panduan, bicara ke resepsionis, & buka pintu.</span></div>' +
                  '</div>' +
                  '<div class="tut-btn-item">' +
                      '<span class="tut-key-pill pill-x">K</span>' +
                      '<div class="tut-btn-copy"><strong>Ketuk Pintu</strong><span>Mengetuk pintu ruang wawancara (standar etika Jepang: 3 ketukan).</span></div>' +
                  '</div>' +
                  '</div>',
            targetSelector: '#pc-tut-dock-act1',
            padding: 8,
            borderRadius: '8px',
            preferredSide: 'top'
        },
        {
            id: 'pc-actions-2',
            stepNum: '05 / 05',
            category: 'ETIKA & SUARA • 礼儀・音声',
            icon: SVG_ICONS.etiquetteBow,
            title: 'Salam Ojigi (O) & Perekam Suara (B)',
            desc: '<div class="tut-btn-list">' +
                  '<div class="tut-btn-item">' +
                      '<span class="tut-key-pill pill-a">O</span>' +
                      '<div class="tut-btn-copy"><strong>Ojigi 30 Derajat</strong><span>Membungkukkan badan untuk memberi salam hormat (Keirei).</span></div>' +
                  '</div>' +
                  '<div class="tut-btn-item">' +
                      '<span class="tut-key-pill pill-b">B</span>' +
                      '<div class="tut-btn-copy"><strong>Rekam Jawaban (Mic)</strong><span>Tekan <strong>B</strong> untuk mulai merekam jawaban wawancara, dan tekan <strong>B</strong> lagi setelah selesai.</span></div>' +
                  '</div>' +
                  '</div>',
            targetSelector: '#pc-tut-dock-act2',
            padding: 8,
            borderRadius: '8px',
            preferredSide: 'top'
        }
    ];

    window.MensetsuTutorial = {
        isActive: false,
        currentMode: 'pc',
        currentStepIndex: 0,
        steps: [],
        vrChecklist: {
            move: false,
            ojigi: false,
            knock: false,
            action: false
        },
        _resizeHandler: null,
        _keyHandler: null,
        _vrCheckInterval: null,
        _initialCamPos: null,

        // Dapatkan key localStorage spesifik per mode perangkat ('pc', 'mobile', 'vr')
        getStorageKey: function (deviceMode) {
            const mode = deviceMode || this.currentMode || (window.MensetsuState && window.MensetsuState.deviceMode) || 'pc';
            return STORAGE_KEY_PREFIX + mode;
        },

        // Cek apakah mode perangkat ini sudah pernah menjalankan tutorial di browser ini
        hasCompletedBefore: function (deviceMode) {
            try {
                return localStorage.getItem(this.getStorageKey(deviceMode)) === 'true';
            } catch (_) {
                return false;
            }
        },

        markAsCompleted: function (deviceMode) {
            try {
                localStorage.setItem(this.getStorageKey(deviceMode), 'true');
            } catch (_) {}
        },

        // Dipanggil otomatis setelah Gate Screen ditutup (hanya jalan 1x untuk masing-masing mode device di browser ini)
        maybeStartAuto: function (deviceMode) {
            const mode = deviceMode || (window.MensetsuState && window.MensetsuState.deviceMode) || 'pc';
            if (this.hasCompletedBefore(mode)) {
                return;
            }
            this.markAsCompleted(mode);
            this.start(mode, false);
        },

        // Mulai tutorial (bisa otomatis saat pertama kali di mode device tsb, atau manual lewat tombol "Panduan")
        start: function (deviceMode, isManualReplay) {
            this.stop(true);

            this.currentMode = deviceMode || (window.MensetsuState && window.MensetsuState.deviceMode) || 'pc';
            this.isActive = true;
            this.markAsCompleted(this.currentMode);

            // Sembunyikan banner swipe guide sementara agar tidak bertumpuk
            const swipeGuide = document.getElementById('mobile-swipe-guide');
            if (swipeGuide) swipeGuide.classList.add('fade-out');

            if (this.currentMode === 'vr') {
                this.startVRTutorial(isManualReplay);
            } else {
                this.startSpotlightTutorial(this.currentMode);
            }
        },

        // =====================================================================
        // OPSI 2: INTERACTIVE VIEWFINDER SPOTLIGHT (UNTUK MODE HP & PC)
        // =====================================================================
        startSpotlightTutorial: function (mode) {
            this.steps = mode === 'mobile' ? MOBILE_STEPS : PC_STEPS;
            this.currentStepIndex = 0;

            const overlay = document.createElement('div');
            overlay.id = 'mensetsu-tutorial-overlay';
            overlay.innerHTML = `
                <!-- Indikator Area Geser Kamera (Muncul di Langkah 2 Mobile) -->
                <div id="tutorial-swipe-zone-indicator" class="tutorial-helper-target" style="display:none;">
                    <div class="swipe-hand-anim">
                        <span class="swipe-svg-wrap">${SVG_ICONS.swipeGesture}</span>
                        <span class="swipe-zone-label">ZONA GESER KAMERA 360°</span>
                    </div>
                </div>

                <!-- Dock Referensi Keyboard & Mouse Khusus Tutorial PC -->
                <div id="pc-tutorial-hud-dock" style="display: ${mode === 'pc' ? 'flex' : 'none'};">
                    <div id="pc-tut-dock-wasd" class="pc-dock-group">
                        <div class="pc-keys-pyramid">
                            <span class="pc-key-cap">W</span>
                            <div class="pc-keys-row">
                                <span class="pc-key-cap">A</span>
                                <span class="pc-key-cap">S</span>
                                <span class="pc-key-cap">D</span>
                            </div>
                        </div>
                        <span class="pc-dock-label">NAVIGASI JALAN</span>
                    </div>

                    <div id="pc-tut-dock-mouse" class="pc-dock-group pc-dock-center">
                        <div class="pc-mouse-icon">
                            ${SVG_ICONS.mouseLook}
                            <span>KLIK & GESER MOUSE</span>
                        </div>
                    </div>

                    <div class="pc-dock-right-wrap">
                        <div id="pc-tut-dock-act1" class="pc-dock-group">
                            <div class="pc-keys-row">
                                <div class="pc-key-unit"><span class="pc-key-cap key-y">F</span><small>AKSI</small></div>
                                <div class="pc-key-unit"><span class="pc-key-cap key-x">K</span><small>KETUK</small></div>
                            </div>
                        </div>
                        <div id="pc-tut-dock-act2" class="pc-dock-group">
                            <div class="pc-keys-row">
                                <div class="pc-key-unit"><span class="pc-key-cap key-a">O</span><small>OJIGI</small></div>
                                <div class="pc-key-unit"><span class="pc-key-cap key-b">B</span><small>MIC</small></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bingkai Viewfinder Spotlight dengan Siku Sudut Presisi -->
                <div id="tutorial-spotlight-ring">
                    <span class="spot-corner corner-tl"></span>
                    <span class="spot-corner corner-tr"></span>
                    <span class="spot-corner corner-bl"></span>
                    <span class="spot-corner corner-br"></span>
                </div>

                <!-- Panel Penjelasan Coach Mark Bergaya Korporat Jepang -->
                <div id="tutorial-coach-card" role="dialog" aria-labelledby="tut-card-title">
                    <div class="tut-card-top-bar"></div>
                    <div class="tut-card-header">
                        <div class="tut-meta-wrap">
                            <span class="tut-step-num" id="tut-step-num">01 / 05</span>
                            <span class="tut-step-category" id="tut-step-category">PERGERAKAN</span>
                        </div>
                        <button type="button" class="tut-btn-skip" id="tut-btn-skip" title="Lewati Panduan">
                            <span>LEWATI</span>
                            ${SVG_ICONS.closeX}
                        </button>
                    </div>

                    <div class="tut-title-row">
                        <span class="tut-title-icon" id="tut-title-icon">${SVG_ICONS.moveAxis}</span>
                        <h3 class="tut-card-title" id="tut-card-title">Judul Panduan</h3>
                    </div>

                    <div class="tut-card-desc" id="tut-card-desc">Deskripsi langkah...</div>

                    <div class="tut-card-footer">
                        <div class="tut-dots" id="tut-step-dots"></div>
                        <div class="tut-nav-btns">
                            <button type="button" class="tut-btn-prev" id="tut-btn-prev">
                                ${SVG_ICONS.chevronLeft}
                                <span>KEMBALI</span>
                            </button>
                            <button type="button" class="tut-btn-next" id="tut-btn-next">
                                <span id="tut-btn-next-label">LANJUT</span>
                                <span id="tut-btn-next-icon">${SVG_ICONS.chevronRight}</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            document.getElementById('tut-btn-skip').addEventListener('click', () => {
                if (typeof playAudioFeedback === 'function') playAudioFeedback('click');
                this.stop();
            });

            document.getElementById('tut-btn-prev').addEventListener('click', () => {
                if (typeof playAudioFeedback === 'function') playAudioFeedback('click');
                if (this.currentStepIndex > 0) {
                    this.currentStepIndex--;
                    this.renderSpotlightStep();
                }
            });

            document.getElementById('tut-btn-next').addEventListener('click', () => {
                if (typeof playAudioFeedback === 'function') playAudioFeedback('click');
                if (this.currentStepIndex < this.steps.length - 1) {
                    this.currentStepIndex++;
                    this.renderSpotlightStep();
                } else {
                    this.stop();
                    if (typeof window.showActionToast === 'function') {
                        window.showActionToast('Panduan selesai. Silakan duduk di sofa dan tonton TV panduan terlebih dahulu.');
                    }
                }
            });

            this._resizeHandler = () => {
                if (this.isActive && this.currentMode !== 'vr') {
                    this.positionSpotlightAndCard();
                }
            };
            window.addEventListener('resize', this._resizeHandler);

            this._keyHandler = (e) => {
                if (!this.isActive || this.currentMode === 'vr') return;
                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.stop();
                } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
                    e.preventDefault();
                    const nextBtn = document.getElementById('tut-btn-next');
                    if (nextBtn) nextBtn.click();
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const prevBtn = document.getElementById('tut-btn-prev');
                    if (prevBtn && !prevBtn.disabled) prevBtn.click();
                }
            };
            window.addEventListener('keydown', this._keyHandler);

            this.renderSpotlightStep();
        },

        renderSpotlightStep: function () {
            const step = this.steps[this.currentStepIndex];
            if (!step) return;

            const swipeZone = document.getElementById('tutorial-swipe-zone-indicator');
            if (swipeZone) {
                swipeZone.style.display = step.id === 'mob-look' ? 'flex' : 'none';
            }

            document.querySelectorAll('.tut-highlighted-btn').forEach(el => {
                el.classList.remove('tut-highlighted-btn');
            });

            if (Array.isArray(step.highlightButtons)) {
                step.highlightButtons.forEach(btnId => {
                    const btnEl = document.getElementById(btnId);
                    if (btnEl) btnEl.classList.add('tut-highlighted-btn');
                });
            }

            const numEl = document.getElementById('tut-step-num');
            const catEl = document.getElementById('tut-step-category');
            const iconEl = document.getElementById('tut-title-icon');
            const titleEl = document.getElementById('tut-card-title');
            const descEl = document.getElementById('tut-card-desc');
            const prevBtn = document.getElementById('tut-btn-prev');
            const nextBtn = document.getElementById('tut-btn-next');
            const nextLabel = document.getElementById('tut-btn-next-label');
            const nextIcon = document.getElementById('tut-btn-next-icon');
            const dotsEl = document.getElementById('tut-step-dots');

            if (numEl) numEl.textContent = step.stepNum;
            if (catEl) catEl.textContent = step.category;
            if (iconEl) iconEl.innerHTML = step.icon || SVG_ICONS.reticleTarget;
            if (titleEl) titleEl.textContent = step.title;
            if (descEl) descEl.innerHTML = step.desc;

            if (prevBtn) {
                prevBtn.style.visibility = this.currentStepIndex === 0 ? 'hidden' : 'visible';
                prevBtn.disabled = this.currentStepIndex === 0;
            }

            if (nextBtn) {
                const isLast = this.currentStepIndex === this.steps.length - 1;
                if (nextLabel) nextLabel.textContent = isLast ? 'MULAI SIMULASI' : 'LANJUT';
                if (nextIcon) nextIcon.innerHTML = isLast ? SVG_ICONS.checkMark : SVG_ICONS.chevronRight;
                nextBtn.classList.toggle('is-finish', isLast);
            }

            if (dotsEl) {
                dotsEl.innerHTML = this.steps.map((_, idx) =>
                    `<span class="tut-dot ${idx === this.currentStepIndex ? 'active' : (idx < this.currentStepIndex ? 'done' : '')}"></span>`
                ).join('');
            }

            this.positionSpotlightAndCard();
            requestAnimationFrame(() => {
                this.positionSpotlightAndCard();
            });
        },

        positionSpotlightAndCard: function () {
            const step = this.steps[this.currentStepIndex];
            if (!step) return;

            const ring = document.getElementById('tutorial-spotlight-ring');
            const card = document.getElementById('tutorial-coach-card');
            if (!ring || !card) return;

            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const pad = step.padding || 10;

            let targetEl = document.querySelector(step.targetSelector);
            let rect = null;

            if (targetEl) {
                const r = targetEl.getBoundingClientRect();
                if (r.width > 0 && r.height > 0) {
                    rect = r;
                }
            }

            if (!rect) {
                rect = {
                    left: vw / 2 - 24,
                    top: vh / 2 - 24,
                    width: 48,
                    height: 48,
                    right: vw / 2 + 24,
                    bottom: vh / 2 + 24
                };
            }

            const spotLeft = Math.max(4, rect.left - pad);
            const spotTop = Math.max(4, rect.top - pad);
            const spotWidth = Math.min(vw - 8, rect.width + pad * 2);
            const spotHeight = Math.min(vh - 8, rect.height + pad * 2);

            ring.style.left = `${spotLeft}px`;
            ring.style.top = `${spotTop}px`;
            ring.style.width = `${spotWidth}px`;
            ring.style.height = `${spotHeight}px`;
            ring.style.borderRadius = step.borderRadius || '8px';

            const cardRect = card.getBoundingClientRect();
            const cardW = cardRect.width || Math.min(380, vw - 24);
            const cardH = cardRect.height || 195;
            const margin = 12;
            const isShortLandscape = vh <= 520 && vw > vh;

            let cardLeft = (vw - cardW) / 2;
            let cardTop = (vh - cardH) / 2;

            if (isShortLandscape) {
                if (step.preferredSide === 'right') {
                    cardLeft = Math.min(vw - cardW - margin, Math.max(spotLeft + spotWidth + 16, vw * 0.36));
                    cardTop = Math.max(margin, (vh - cardH) / 2);
                } else if (step.preferredSide === 'left') {
                    cardLeft = Math.max(margin, Math.min(spotLeft - cardW - 16, vw * 0.14));
                    cardTop = Math.max(margin, (vh - cardH) / 2);
                } else {
                    if (spotTop + spotHeight + cardH + 14 <= vh - margin) {
                        cardTop = spotTop + spotHeight + 12;
                    } else if (spotTop - cardH - 12 >= margin) {
                        cardTop = spotTop - cardH - 12;
                    } else {
                        cardLeft = margin + 12;
                        cardTop = Math.max(margin, (vh - cardH) / 2);
                    }
                }
            } else {
                if (step.preferredSide === 'right' && (spotLeft + spotWidth + cardW + 20 <= vw - margin)) {
                    cardLeft = spotLeft + spotWidth + 18;
                    cardTop = spotTop + spotHeight / 2 - cardH / 2;
                } else if (step.preferredSide === 'left' && (spotLeft - cardW - 20 >= margin)) {
                    cardLeft = spotLeft - cardW - 18;
                    cardTop = spotTop + spotHeight / 2 - cardH / 2;
                } else if (step.preferredSide === 'top' || (spotTop > vh * 0.55)) {
                    cardTop = spotTop - cardH - 16;
                    cardLeft = spotLeft + spotWidth / 2 - cardW / 2;
                } else {
                    cardTop = spotTop + spotHeight + 16;
                    cardLeft = spotLeft + spotWidth / 2 - cardW / 2;
                }
            }

            cardLeft = Math.max(margin, Math.min(vw - cardW - margin, cardLeft));
            cardTop = Math.max(margin, Math.min(vh - cardH - margin, cardTop));

            card.style.left = `${Math.round(cardLeft)}px`;
            card.style.top = `${Math.round(cardTop)}px`;
        },

        // =====================================================================
        // OPSI 1: INTERACTIVE STEREO WARM-UP CHECKLIST (UNTUK MODE HEADSET VR)
        // =====================================================================
        startVRTutorial: function () {
            this.vrChecklist = {
                move: false,
                ojigi: false,
                knock: false,
                action: false
            };

            const camEl = document.getElementById('player-camera');
            if (camEl && camEl.object3D) {
                this._initialCamPos = {
                    x: camEl.object3D.position.x,
                    z: camEl.object3D.position.z
                };
            } else {
                this._initialCamPos = { x: 0, z: 14.2 };
            }

            const buildPaneHTML = (paneSuffix) => `
                <div class="vr-tut-card" id="vr-tut-card-${paneSuffix}">
                    <div class="vr-tut-top-bar"></div>
                    <div class="vr-tut-header">
                        <div class="vr-tut-title-row">
                            <span class="vr-tut-icon">${SVG_ICONS.gamepadVR}</span>
                            <span class="vr-tut-badge">KALIBRASI KONTROL VR • 操作確認</span>
                        </div>
                        <span class="vr-tut-sub">Mode Gamepad: Tekan <strong>@ + B</strong> pada Remote Bluetooth</span>
                    </div>

                    <div class="vr-tut-checklist">
                        <div class="vr-check-item" id="vr-chk-move-${paneSuffix}">
                            <span class="vr-chk-box">${SVG_ICONS.boxEmpty}</span>
                            <div class="vr-chk-text">
                                <strong>01. Navigasi Jalan (Analog Stick)</strong>
                                <small>Dorong analog maju, mundur, kiri, atau kanan</small>
                            </div>
                        </div>
                        <div class="vr-check-item" id="vr-chk-ojigi-${paneSuffix}">
                            <span class="vr-chk-box">${SVG_ICONS.boxEmpty}</span>
                            <div class="vr-chk-text">
                                <strong>02. Salam Ojigi 30° (Tombol A)</strong>
                                <small>Tekan tombol A (atau O) untuk membungkuk</small>
                            </div>
                        </div>
                        <div class="vr-check-item" id="vr-chk-knock-${paneSuffix}">
                            <span class="vr-chk-box">${SVG_ICONS.boxEmpty}</span>
                            <div class="vr-chk-text">
                                <strong>03. Ketuk Pintu 3x (Tombol C / X)</strong>
                                <small>Tekan tombol C/X (atau K) untuk latihan mengetuk</small>
                            </div>
                        </div>
                        <div class="vr-check-item" id="vr-chk-action-${paneSuffix}">
                            <span class="vr-chk-box">${SVG_ICONS.boxEmpty}</span>
                            <div class="vr-chk-text">
                                <strong>04. Aksi & Mic (Tombol D/Y & B)</strong>
                                <small>D/Y = Aksi Objek • B = Rekam Suara</small>
                            </div>
                        </div>
                    </div>

                    <div class="vr-tut-footer">
                        <span class="vr-tut-progress-label" id="vr-tut-status-${paneSuffix}">Otomatis tertutup saat 4 kontrol dicoba, atau tekan Trigger Samping:</span>
                        <button type="button" class="vr-tut-btn-done" data-action="close-vr-tut">
                            <span>LEWATI PANDUAN (TRIGGER L1 / L2)</span>
                            ${SVG_ICONS.chevronRight}
                        </button>
                    </div>
                </div>
            `;

            const vrOverlay = document.createElement('div');
            vrOverlay.id = 'mensetsu-vr-tutorial-overlay';
            vrOverlay.innerHTML = `
                <div class="vr-tut-pane vr-tut-pane-left">
                    ${buildPaneHTML('left')}
                </div>
                <div class="vr-tut-pane vr-tut-pane-right">
                    ${buildPaneHTML('right')}
                </div>
            `;
            document.body.appendChild(vrOverlay);

            vrOverlay.querySelectorAll('[data-action="close-vr-tut"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (typeof playAudioFeedback === 'function') playAudioFeedback('click');
                    this.stop();
                });
            });

            this._vrCheckInterval = setInterval(() => {
                if (!this.isActive || this.currentMode !== 'vr') return;

                const cEl = document.getElementById('player-camera');
                if (cEl && cEl.object3D && this._initialCamPos && !this.vrChecklist.move) {
                    const dx = cEl.object3D.position.x - this._initialCamPos.x;
                    const dz = cEl.object3D.position.z - this._initialCamPos.z;
                    if (Math.hypot(dx, dz) > 0.15) {
                        this.completeVRCheckItem('move');
                    }
                }
            }, 120);

            this._onVrOjigi = () => {
                if (this.isActive && this.currentMode === 'vr') {
                    this.completeVRCheckItem('ojigi');
                }
            };
            window.addEventListener('mensetsu-ojigi', this._onVrOjigi);

            this._keyHandler = (e) => {
                if (!this.isActive || this.currentMode !== 'vr') return;
                const k = e.key.toLowerCase();
                if (k === 'w' || k === 'a' || k === 's' || k === 'd' || k.startsWith('arrow')) {
                    this.completeVRCheckItem('move');
                } else if (k === 'o') {
                    this.completeVRCheckItem('ojigi');
                } else if (k === 'k' || k === 'x') {
                    this.completeVRCheckItem('knock');
                } else if (k === 'f' || k === 'e' || k === 'y' || k === 'b' || k === 'c') {
                    this.completeVRCheckItem('action');
                } else if (k === 'escape') {
                    this.stop();
                }
            };
            window.addEventListener('keydown', this._keyHandler);
        },

        notifyVRActionTriggered: function (type) {
            if (!this.isActive || this.currentMode !== 'vr') return false;
            if (type === 'knock') {
                this.completeVRCheckItem('knock');
                if (typeof playAudioFeedback === 'function') playAudioFeedback('knock');
                if (typeof window.showActionToast === 'function') {
                    window.showActionToast(' Simulasi Ketuk Pintu terverifikasi.');
                }
                return true;
            }
            if (type === 'action' || type === 'mic') {
                this.completeVRCheckItem('action');
                if (typeof playAudioFeedback === 'function') playAudioFeedback('click');
                if (typeof window.showActionToast === 'function') {
                    window.showActionToast('Simulasi Tombol Aksi / Mic terverifikasi.');
                }
                return true;
            }
            return false;
        },

        completeVRCheckItem: function (key) {
            if (!this.vrChecklist || this.vrChecklist[key]) return;
            this.vrChecklist[key] = true;

            ['left', 'right'].forEach(side => {
                const row = document.getElementById(`vr-chk-${key}-${side}`);
                if (row) {
                    row.classList.add('is-done');
                    const box = row.querySelector('.vr-chk-box');
                    if (box) box.innerHTML = SVG_ICONS.boxChecked;
                }
            });

            const allDone = this.vrChecklist.move && this.vrChecklist.ojigi && this.vrChecklist.knock && this.vrChecklist.action;
            if (allDone) {
                ['left', 'right'].forEach(side => {
                    const statusEl = document.getElementById(`vr-tut-status-${side}`);
                    if (statusEl) {
                        statusEl.innerHTML = '<strong style="color:#4ade80;">Seluruh Kontrol VR Terverifikasi (4/4)</strong>';
                    }
                });
                setTimeout(() => {
                    if (this.isActive && this.currentMode === 'vr') {
                        this.stop();
                        if (typeof window.showActionToast === 'function') {
                            window.showActionToast('Kalibrasi VR selesai. Silakan duduk di sofa dan tonton TV panduan.');
                        }
                    }
                }, 1100);
            }
        },

        stop: function () {
            this.isActive = false;

            document.querySelectorAll('.tut-highlighted-btn').forEach(el => {
                el.classList.remove('tut-highlighted-btn');
            });

            const spotOverlay = document.getElementById('mensetsu-tutorial-overlay');
            if (spotOverlay) spotOverlay.remove();

            const vrOverlay = document.getElementById('mensetsu-vr-tutorial-overlay');
            if (vrOverlay) vrOverlay.remove();

            if (this._resizeHandler) {
                window.removeEventListener('resize', this._resizeHandler);
                this._resizeHandler = null;
            }
            if (this._keyHandler) {
                window.removeEventListener('keydown', this._keyHandler);
                this._keyHandler = null;
            }
            if (this._onVrOjigi) {
                window.removeEventListener('mensetsu-ojigi', this._onVrOjigi);
                this._onVrOjigi = null;
            }
            if (this._vrCheckInterval) {
                clearInterval(this._vrCheckInterval);
                this._vrCheckInterval = null;
            }
        }
    };
})();
