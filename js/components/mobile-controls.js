// =========================================================================
// SISTEM KONTROL MOBILE SENTUH & RESPONSIF (TOUCH JOYSTICK + CAMERA SWIPE)
// Mensetsu VR Room - Adaptive Multi-Device Controller
// =========================================================================

(function () {
    // Handler Khusus Tombol Xbox B (Mic / Bicara Jawaban)
    window.handleMobileMicButton = function () {
        const interview = window.MensetsuInterview;

        // 1. Sedang merekam suara -> selesaikan rekaman dan teruskan alur wawancara
        if (window.MensetsuRecorder && window.MensetsuRecorder.isRecording) {
            if (typeof playAudioFeedback === 'function') playAudioFeedback('click');
            if (typeof window.showActionToast === 'function') {
                window.showActionToast('🎙️ Rekaman suara selesai & tersimpan.');
            }
            if (interview && typeof interview.finishCandidateAnswer === 'function') {
                interview.finishCandidateAnswer();
            } else if (window.MensetsuRecorder) {
                window.MensetsuRecorder.stopRecording();
            }
            return;
        }

        // 2. Sesi tanya jawab aktif & menunggu jawaban kandidat -> mulai merekam
        if (interview && (interview.isWaitingForCandidateAnswer || (typeof interview.currentStep === 'string' && interview.currentStep.startsWith('ANSWER_')))) {
            const qKey = interview.currentQuestionKey || 'question1';
            interview.isCandidateAnswering = true;
            if (window.MensetsuRecorder) {
                window.MensetsuRecorder.startRecording(qKey);
            }
            if (typeof playAudioFeedback === 'function') playAudioFeedback('click');
            if (typeof window.showActionToast === 'function') {
                window.showActionToast('Merekam jawaban... Tekan B lagi setelah selesai bicara.');
            }
            return;
        }

        // 3. Jika sedang duduk di kursi kandidat tapi belum giliran menjawab (NPC sedang bicara)
        if (window.isSitting) {
            if (typeof window.showActionToast === 'function') {
                window.showActionToast('Dengarkan pertanyaan pewawancara terlebih dahulu.');
            }
            return;
        }

        // 4. Jika di luar sesi tanya jawab (masih di ruang tunggu atau berdiri)
        if (typeof window.showActionToast === 'function') {
            window.showActionToast('🎙️ Tombol B (Mic): Gunakan saat menjawab pertanyaan pewawancara di kursi.');
        }
    };

    window.MensetsuControls = {
        activeMode: 'pc', // 'mobile' | 'pc' | 'vr'
        isJoystickActive: false,
        joystickVector: { x: 0, y: 0 },
        touchLookActive: false,
        lastLookTouch: { x: 0, y: 0 },
        lookSensitivity: 0.0040,
        moveSpeed: 2.8, // meter per detik
        _xboxListenersAttached: false,
        _joystickEventsAttached: false,
        _cameraSwipeAttached: false,
        _motionLoopStarted: false,
        _isStereoActive: false,
        _stereoCam: null,
        _origRender: null,
        _vrClickAttached: false,
        _origPixelRatio: null,

        // Menonaktifkan Gyroscope (Device Orientation) di mode mobile agar murni pergeseran tangan
        disableGyro: function () {
            const applyLookConfig = () => {
                const camEl = document.getElementById('player-camera');
                if (!camEl) return;
                camEl.setAttribute('look-controls', {
                    magicWindowTrackingEnabled: false,
                    touchEnabled: false,
                    mouseEnabled: true
                });
                const lc = camEl.components['look-controls'];
                if (lc) {
                    lc.data.magicWindowTrackingEnabled = false;
                    lc.data.touchEnabled = false;
                    if (typeof lc.removeMagicWindowEvents === 'function') {
                        lc.removeMagicWindowEvents();
                    }
                    if (typeof lc.removeTouchEvents === 'function') {
                        lc.removeTouchEvents();
                    }
                }
            };

            applyLookConfig();
            const scene = document.querySelector('a-scene');
            if (scene) {
                if (scene.hasLoaded) {
                    applyLookConfig();
                } else {
                    scene.addEventListener('loaded', applyLookConfig, { once: true });
                }
            }
        },

        // Mengaktifkan Mode VR Doble Layar (Stereoscopic Side-by-Side Dual Display)
        enableStereoVR: function () {
            const scene = document.querySelector('a-scene');
            if (!scene) return;

            const setupStereo = () => {
                const renderer = scene.renderer;
                if (!renderer) return;

                // 1. Simpan Pixel Ratio asli dan optimasi ke 1.25 di VR mode agar stabil di 60 FPS
                if (this._origPixelRatio === null) {
                    this._origPixelRatio = renderer.getPixelRatio();
                }
                renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));

                // 2. Inisialisasi THREE.StereoCamera bawaan A-Frame
                if (!this._stereoCam) {
                    this._stereoCam = new AFRAME.THREE.StereoCamera();
                    this._stereoCam.aspect = 0.5;
                    this._stereoCam.eyeSep = 0.064; // Interpupillary distance standar ~64mm
                }

                // 3. Aktifkan Head Tracking (Device Orientation / Gyroscope) bawaan A-Frame yang stabil & bebas glitch
                const camEl = document.getElementById('player-camera');
                if (camEl) {
                    camEl.setAttribute('look-controls', {
                        magicWindowTrackingEnabled: true,
                        touchEnabled: false,
                        mouseEnabled: false
                    });
                    const lc = camEl.components['look-controls'];
                    if (lc) {
                        lc.data.magicWindowTrackingEnabled = true;
                        lc.data.touchEnabled = false;
                        lc.data.mouseEnabled = false;
                        if (typeof lc.addMagicWindowEvents === 'function') {
                            lc.addMagicWindowEvents();
                        }
                    }
                }

                // 4. Intersepsi loop render renderer untuk membelah layar jadi 2 (mata kiri & mata kanan)
                if (!this._origRender) {
                    this._origRender = renderer.render.bind(renderer);
                    const self = this;

                    renderer.render = function (s, c) {
                        if (!self._isStereoActive || !c) {
                            return self._origRender(s, c);
                        }

                        const size = renderer.getSize(new AFRAME.THREE.Vector2());
                        const width = size.x;
                        const height = size.y;
                        const halfW = Math.floor(width / 2);

                        // Perbarui kamera stereo berdasarkan orientasi & posisi kamera aktif
                        self._stereoCam.aspect = 0.5;
                        self._stereoCam.update(c);

                        // Aktifkan Scissor Test untuk merender 2 bidang pandang terpisah
                        renderer.setScissorTest(true);

                        // --- MATA KIRI (LEFT EYE) ---
                        renderer.setScissor(0, 0, halfW, height);
                        renderer.setViewport(0, 0, halfW, height);
                        self._origRender(s, self._stereoCam.cameraL);

                        // --- MATA KANAN (RIGHT EYE) ---
                        renderer.setScissor(halfW, 0, width - halfW, height);
                        renderer.setViewport(halfW, 0, width - halfW, height);
                        self._origRender(s, self._stereoCam.cameraR);

                        // Kembalikan konfigurasi default
                        renderer.setScissorTest(false);
                        renderer.setViewport(0, 0, width, height);
                    };
                }

                this._isStereoActive = true;

                // 5. Buat Elemen UI VR (Garis pemisah tengah & Dual Reticle Dot)
                this.setupStereoVRUI();

                // 6. Tambahkan interaksi sentuh layar / tombol headset Cardboard
                if (!this._vrClickAttached) {
                    this._vrClickAttached = true;
                    window.addEventListener('click', (e) => {
                        if (this.activeMode !== 'vr') return;
                        if (e.target && e.target.closest('#top-nav-controls, #gate-screen, #reception-menu-overlay')) {
                            return;
                        }
                        if (typeof window.triggerAction === 'function') {
                            window.triggerAction();
                        }
                    });
                }
            };

            if (scene.hasLoaded && scene.renderer) {
                setupStereo();
            } else {
                scene.addEventListener('loaded', setupStereo, { once: true });
                scene.addEventListener('render-target-loaded', setupStereo, { once: true });
            }
        },

        disableStereoVR: function () {
            this._isStereoActive = false;
            document.body.classList.remove('vr-stereo-mode');
            this.removeStereoVRUI();

            const scene = document.querySelector('a-scene');
            if (scene && scene.renderer && this._origPixelRatio !== null) {
                scene.renderer.setPixelRatio(this._origPixelRatio);
            }
        },

        setupStereoVRUI: function () {
            document.body.classList.add('vr-stereo-mode');

            // Sembunyikan reticle single default
            const singleReticle = document.querySelector('.reticle-dot');
            if (singleReticle) singleReticle.style.display = 'none';

            if (!document.getElementById('vr-stereo-overlay')) {
                const overlay = document.createElement('div');
                overlay.id = 'vr-stereo-overlay';
                overlay.innerHTML = `
                    <div class="vr-divider-line"></div>
                    <div class="vr-center-marker"></div>
                    <div class="vr-reticle vr-reticle-left"></div>
                    <div class="vr-reticle vr-reticle-right"></div>
                    <div class="vr-mode-badge">
                        <span>MODE VR STEREOSKOPIK (LAYAR KANAN-KIRI)</span>
                    </div>
                `;
                document.body.appendChild(overlay);
            }
        },

        removeStereoVRUI: function () {
            document.body.classList.remove('vr-stereo-mode');
            const overlay = document.getElementById('vr-stereo-overlay');
            if (overlay) overlay.remove();
            const singleReticle = document.querySelector('.reticle-dot');
            if (singleReticle) singleReticle.style.display = 'block';
        },

        init: function (mode) {
            this.activeMode = mode || 'pc';
            console.log(`Inisialisasi kontrol mode: [${this.activeMode.toUpperCase()}]`);

            if (this.activeMode === 'mobile') {
                this.disableStereoVR();
                this.disableGyro();
                this.setupMobileUI();
                this.setupJoystickEvents();
                this.setupCameraSwipeEvents();
                this.startMotionLoop();
            } else if (this.activeMode === 'pc') {
                this.disableStereoVR();
                this.disableGyro();
                this.removeMobileUI();
            } else if (this.activeMode === 'vr') {
                this.removeMobileUI();
                this.enableStereoVR();
                this.startMotionLoop();
            }

            this.updatePromptBadges();
        },

        setupMobileUI: function () {
            // 1. Container Analog Kiri Bawah
            if (!document.getElementById('virtual-joystick-zone')) {
                const joyZone = document.createElement('div');
                joyZone.id = 'virtual-joystick-zone';
                joyZone.innerHTML = `
                    <div id="joystick-base">
                        <div id="joystick-stick"></div>
                        <div class="joystick-dir-indicator up"></div>
                        <div class="joystick-dir-indicator down"></div>
                        <div class="joystick-dir-indicator left"></div>
                        <div class="joystick-dir-indicator right"></div>
                    </div>
                    <div class="joystick-label">Gerak</div>
                `;
                document.body.appendChild(joyZone);
            }

            // 2. Container Gamepad Xbox ABXY di Kanan Bawah
            if (!document.getElementById('mobile-action-buttons')) {
                const btnContainer = document.createElement('div');
                btnContainer.id = 'mobile-action-buttons';
                btnContainer.innerHTML = `
                    <div class="xbox-pad-plate" id="xbox-pad-plate">
                        <!-- Y (Atas / Kuning) - Interaksi & Aksi -->
                        <button class="xbox-btn btn-y mob-btn btn-action" id="mob-btn-y" title="Aksi / Interaksi (Y)" data-key="Y" aria-label="Aksi">
                            <span class="xbox-letter">Y</span>
                            <span class="xbox-sublabel" id="mob-sublabel-y">Aksi</span>
                        </button>

                        <!-- X (Kiri / Biru) - Ketuk Pintu 3x -->
                        <button class="xbox-btn btn-x mob-btn btn-knock" id="mob-btn-x" title="Ketuk Pintu (X)" data-key="X" aria-label="Ketuk">
                            <span class="xbox-letter">X</span>
                            <span class="xbox-sublabel" id="mob-sublabel-x">Ketuk</span>
                        </button>

                        <!-- Center Pivot Disc -->
                        <div class="xbox-pad-center">
                            <div class="xbox-center-dot"></div>
                        </div>

                        <!-- B (Kanan / Merah) - Open Mic / Rekam Suara -->
                        <button class="xbox-btn btn-b mob-btn btn-mic" id="mob-btn-b" title="Bicara / Rekam Suara (B)" data-key="B" aria-label="Bicara">
                            <span class="xbox-letter">B</span>
                            <span class="xbox-sublabel" id="mob-sublabel-b">Mic</span>
                        </button>

                        <!-- A (Bawah / Hijau) - Ojigi Membungkuk 30° / Salam -->
                        <button class="xbox-btn btn-a mob-btn btn-ojigi" id="mob-btn-a" title="Ojigi 30° / Membungkuk (A)" data-key="A" aria-label="Ojigi">
                            <span class="xbox-letter">A</span>
                            <span class="xbox-sublabel" id="mob-sublabel-a">Ojigi</span>
                        </button>
                    </div>
                `;
                document.body.appendChild(btnContainer);

                // Helper touch/click handler dengan micro-haptic & visual feedback
                const bindXboxBtn = (id, callback) => {
                    const btn = document.getElementById(id);
                    if (!btn) return;
                    let lastTrigger = 0;
                    const onTrigger = (e) => {
                        if (e && e.type === 'touchstart') {
                            e.preventDefault();
                        }
                        const now = Date.now();
                        if (now - lastTrigger < 200) return;
                        lastTrigger = now;

                        btn.classList.add('is-active');
                        setTimeout(() => btn.classList.remove('is-active'), 150);

                        if (navigator.vibrate) {
                            try { navigator.vibrate(25); } catch (_) {}
                        }

                        callback();
                    };

                    btn.addEventListener('touchstart', onTrigger, { passive: false });
                    btn.addEventListener('click', onTrigger);
                };

                // Y: Interaksi / Aksi (Buka Pintu, Duduk Kursi/Sofa, Nonton Video TV, Berdiri)
                bindXboxBtn('mob-btn-y', () => {
                    if (typeof window.triggerAction === 'function') {
                        window.triggerAction();
                    }
                });

                // X: Ketuk Pintu (Knock)
                bindXboxBtn('mob-btn-x', () => {
                    if (typeof window.triggerKnock === 'function') {
                        window.triggerKnock();
                    }
                });

                // B: Open Mic / Rekam Suara Jawaban
                bindXboxBtn('mob-btn-b', () => {
                    if (typeof window.handleMobileMicButton === 'function') {
                        window.handleMobileMicButton();
                    }
                });

                // A: Ojigi 30 Derajat (Salam Hormat Wawancara)
                bindXboxBtn('mob-btn-a', () => {
                    if (typeof window.triggerOjigi === 'function') {
                        window.triggerOjigi();
                    }
                });

                // Inisialisasi listener reaktif status audio & tata krama
                this.setupXboxReactiveListeners();
            }

            // 3. Area Panduan Geser Kamera Layar Sentuh
            if (!document.getElementById('mobile-swipe-guide')) {
                const swipeGuide = document.createElement('div');
                swipeGuide.id = 'mobile-swipe-guide';
                swipeGuide.innerHTML = `<span>Geser layar untuk memutar kamera (Sentuhan Tangan • Bebas Gyro)</span>`;
                document.body.appendChild(swipeGuide);
                setTimeout(() => {
                    if (swipeGuide) swipeGuide.classList.add('fade-out');
                }, 4000);
            }
        },

        setupXboxReactiveListeners: function () {
            if (this._xboxListenersAttached) return;
            this._xboxListenersAttached = true;

            // 1. Pewawancara selesai mengajukan pertanyaan -> tombol B prompt siap bicara
            window.addEventListener('mensetsu-answer-prompt', () => {
                const btnB = document.getElementById('mob-btn-b');
                const subB = document.getElementById('mob-sublabel-b');
                if (btnB) btnB.classList.add('ready-to-answer');
                if (subB) subB.textContent = 'Bicara';
            });

            // 2. Rekaman suara mulai aktif
            window.addEventListener('mensetsu-rec-started', () => {
                const btnB = document.getElementById('mob-btn-b');
                const subB = document.getElementById('mob-sublabel-b');
                if (btnB) {
                    btnB.classList.remove('ready-to-answer');
                    btnB.classList.add('is-recording');
                }
                if (subB) subB.textContent = 'Rekam...';
            });

            // 3. Rekaman suara selesai
            window.addEventListener('mensetsu-rec-stopped', () => {
                const btnB = document.getElementById('mob-btn-b');
                const subB = document.getElementById('mob-sublabel-b');
                if (btnB) {
                    btnB.classList.remove('is-recording');
                    btnB.classList.remove('ready-to-answer');
                }
                if (subB) subB.textContent = 'Mic';
            });

            window.addEventListener('mensetsu-answer-done', () => {
                const btnB = document.getElementById('mob-btn-b');
                const subB = document.getElementById('mob-sublabel-b');
                if (btnB) {
                    btnB.classList.remove('is-recording');
                    btnB.classList.remove('ready-to-answer');
                }
                if (subB) subB.textContent = 'Mic';
            });

            // 4. Prompt Ojigi saat masuk / selesai wawancara
            window.addEventListener('mensetsu-prompt-ojigi', () => {
                const btnA = document.getElementById('mob-btn-a');
                if (btnA) btnA.classList.add('should-ojigi');
            });
            window.addEventListener('mensetsu-ojigi', () => {
                const btnA = document.getElementById('mob-btn-a');
                if (btnA) btnA.classList.remove('should-ojigi');
            });
        },

        removeMobileUI: function () {
            const joy = document.getElementById('virtual-joystick-zone');
            if (joy) joy.remove();
            const btns = document.getElementById('mobile-action-buttons');
            if (btns) btns.remove();
            const guide = document.getElementById('mobile-swipe-guide');
            if (guide) guide.remove();
        },

        updateSitButtonText: function () {
            const subY = document.getElementById('mob-sublabel-y');
            const btnY = document.getElementById('mob-btn-y');
            if (subY) {
                if (window.isSitting) {
                    if (window.currentSeat && window.currentSeat.id === 'waiting-sofa') {
                        subY.textContent = 'Video';
                    } else {
                        subY.textContent = 'Berdiri';
                    }
                } else {
                    subY.textContent = 'Aksi';
                }
            }
            if (btnY) {
                if (window.isSitting) {
                    btnY.classList.add('can-interact');
                } else if (!window.currentNearbyAction) {
                    btnY.classList.remove('can-interact');
                }
            }
        },

        updatePromptBadges: function () {
            // interact-prompt telah dinonaktifkan agar layar clean
        },

        // --- SISTEM ANALOG JOYSTICK (KIRI BAWAH) ---
        setupJoystickEvents: function () {
            if (this._joystickEventsAttached) return;
            this._joystickEventsAttached = true;

            const base = document.getElementById('joystick-base');
            const stick = document.getElementById('joystick-stick');
            if (!base || !stick) return;

            let touchId = null;
            let baseRect = null;
            const maxRadius = 46; // Jarak maksimal pergeseran knob (pixel)

            const onTouchStart = (e) => {
                if (touchId !== null) return;
                for (let i = 0; i < e.changedTouches.length; i++) {
                    const t = e.changedTouches[i];
                    baseRect = base.getBoundingClientRect();
                    const centerX = baseRect.left + baseRect.width / 2;
                    const centerY = baseRect.top + baseRect.height / 2;
                    const dist = Math.hypot(t.clientX - centerX, t.clientY - centerY);

                    // Aktif jika disentuh dalam radius area base (atau sekitarnya)
                    if (dist < 75) {
                        touchId = t.identifier;
                        this.isJoystickActive = true;
                        updateStickPos(t.clientX, t.clientY);
                        break;
                    }
                }
            };

            const onTouchMove = (e) => {
                if (touchId === null) return;
                for (let i = 0; i < e.changedTouches.length; i++) {
                    const t = e.changedTouches[i];
                    if (t.identifier === touchId) {
                        updateStickPos(t.clientX, t.clientY);
                        break;
                    }
                }
            };

            const onTouchEnd = (e) => {
                if (touchId === null) return;
                for (let i = 0; i < e.changedTouches.length; i++) {
                    const t = e.changedTouches[i];
                    if (t.identifier === touchId) {
                        touchId = null;
                        this.isJoystickActive = false;
                        this.joystickVector = { x: 0, y: 0 };
                        stick.style.transform = `translate(0px, 0px)`;
                        break;
                    }
                }
            };

            const updateStickPos = (clientX, clientY) => {
                if (!baseRect) baseRect = base.getBoundingClientRect();
                const centerX = baseRect.left + baseRect.width / 2;
                const centerY = baseRect.top + baseRect.height / 2;

                const dx = clientX - centerX;
                const dy = clientY - centerY;
                const distance = Math.hypot(dx, dy);

                if (distance === 0) {
                    this.joystickVector = { x: 0, y: 0 };
                    stick.style.transform = `translate(0px, 0px)`;
                    return;
                }

                const clampedDist = Math.min(distance, maxRadius);
                const normX = dx / distance;
                const normY = dy / distance;

                const moveX = normX * clampedDist;
                const moveY = normY * clampedDist;

                stick.style.transform = `translate(${moveX}px, ${moveY}px)`;

                // Vektor normalisasi pergerakan [-1.0 s/d 1.0]
                this.joystickVector = {
                    x: moveX / maxRadius,
                    y: moveY / maxRadius
                };

                // Jika sedang duduk dan menggerakkan joystick, otomatis berdiri!
                if (window.isSitting && (Math.abs(this.joystickVector.x) > 0.25 || Math.abs(this.joystickVector.y) > 0.25)) {
                    if (typeof window.standUp === 'function') {
                        window.standUp();
                        this.updateSitButtonText();
                    }
                }
            };

            // Pasang event ke window agar jari yang bergeser ke luar base tetap terdeteksi mulus
            window.addEventListener('touchstart', onTouchStart, { passive: false });
            window.addEventListener('touchmove', onTouchMove, { passive: false });
            window.addEventListener('touchend', onTouchEnd, { passive: false });
            window.addEventListener('touchcancel', onTouchEnd, { passive: false });
        },

        // --- SISTEM TOUCH SWIPE CAMERA LOOK (PERGESERAN TANGAN • BEBAS GYRO) ---
        setupCameraSwipeEvents: function () {
            if (this._cameraSwipeAttached) return;
            this._cameraSwipeAttached = true;

            let lookTouchId = null;

            window.addEventListener('touchstart', (e) => {
                if (this.activeMode !== 'mobile') return;
                const screenW = window.innerWidth;
                const screenH = window.innerHeight;

                for (let i = 0; i < e.changedTouches.length; i++) {
                    const t = e.changedTouches[i];
                    if (lookTouchId !== null) continue;

                    // Hindari pojok kiri bawah (area analog joystick) agar jari kiri tidak memutar kamera saat jalan
                    const isJoystickCorner = (t.clientX < screenW * 0.40 && t.clientY > screenH * 0.45);
                    if (isJoystickCorner) {
                        continue;
                    }

                    // Pastikan tidak menyentuh tombol gamepad atau navigasi atas
                    const el = document.elementFromPoint(t.clientX, t.clientY);
                    if (el && el.closest('#virtual-joystick-zone, #mobile-action-buttons, #top-nav-controls, #gate-screen, .interactive-modal')) {
                        continue;
                    }

                    // Verifikasi jarak langsung ke base joystick jika ada
                    const joyBase = document.getElementById('joystick-base');
                    if (joyBase) {
                        const bRect = joyBase.getBoundingClientRect();
                        const bcX = bRect.left + bRect.width / 2;
                        const bcY = bRect.top + bRect.height / 2;
                        if (Math.hypot(t.clientX - bcX, t.clientY - bcY) < 85) {
                            continue;
                        }
                    }

                    lookTouchId = t.identifier;
                    this.touchLookActive = true;
                    this.lastLookTouch = { x: t.clientX, y: t.clientY };
                    break;
                }
            }, { passive: true });

            window.addEventListener('touchmove', (e) => {
                if (this.activeMode !== 'mobile' || lookTouchId === null) return;
                for (let i = 0; i < e.changedTouches.length; i++) {
                    const t = e.changedTouches[i];
                    if (t.identifier === lookTouchId) {
                        const deltaX = t.clientX - this.lastLookTouch.x;
                        const deltaY = t.clientY - this.lastLookTouch.y;
                        this.lastLookTouch = { x: t.clientX, y: t.clientY };

                        this.applyCameraRotation(deltaX, deltaY);

                        // Cegah pull-to-refresh / scroll layar bawaan browser saat menggeser kamera
                        if (e.cancelable) {
                            e.preventDefault();
                        }
                        break;
                    }
                }
            }, { passive: false });

            const endLook = (e) => {
                if (lookTouchId === null) return;
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === lookTouchId) {
                        lookTouchId = null;
                        this.touchLookActive = false;
                        break;
                    }
                }
            };
            window.addEventListener('touchend', endLook, { passive: true });
            window.addEventListener('touchcancel', endLook, { passive: true });
        },

        applyCameraRotation: function (deltaX, deltaY) {
            const camEl = document.getElementById('player-camera');
            if (!camEl) return;
            const lookControls = camEl.components['look-controls'];
            if (!lookControls) return;

            // Putar Yaw (Kiri - Kanan)
            if (lookControls.yawObject) {
                lookControls.yawObject.rotation.y -= deltaX * this.lookSensitivity;
            }

            // Putar Pitch (Atas - Bawah) dengan batas kemiringan aman (-1.35 s/d 1.35 rad)
            if (lookControls.pitchObject) {
                const newPitch = lookControls.pitchObject.rotation.x - deltaY * this.lookSensitivity;
                lookControls.pitchObject.rotation.x = Math.max(-1.35, Math.min(1.35, newPitch));
            }
        },

        // --- LOOP GERAKAN JOYSTICK KE KAMERA PEMAIN ---
        startMotionLoop: function () {
            if (this._motionLoopStarted) return;
            this._motionLoopStarted = true;

            let lastTime = performance.now();

            const motionTick = (now) => {
                const dt = Math.min((now - lastTime) / 1000, 0.08);
                lastTime = now;

                // 1. Gerakan Virtual Touch Joystick di Layar Mobile
                if (this.activeMode === 'mobile' && this.isJoystickActive && !window.isSitting) {
                    const jx = this.joystickVector.x;
                    const jy = this.joystickVector.y; // -1 saat ditekan ke atas (maju)

                    if (Math.abs(jx) > 0.05 || Math.abs(jy) > 0.05) {
                        const camEl = document.getElementById('player-camera');
                        if (camEl && camEl.object3D) {
                            // Dapatkan arah hadap horizontal (Yaw) kamera saat ini
                            const lookControls = camEl.components['look-controls'];
                            const yawRad = lookControls && lookControls.yawObject ? lookControls.yawObject.rotation.y : camEl.object3D.rotation.y;

                            // Vektor arah maju dan ke samping relatif terhadap kamera
                            const forwardX = -Math.sin(yawRad);
                            const forwardZ = -Math.cos(yawRad);
                            const rightX = Math.cos(yawRad);
                            const rightZ = -Math.sin(yawRad);

                            // Hitung delta translasi
                            const moveDist = this.moveSpeed * dt;
                            // jy < 0 = maju, jy > 0 = mundur
                            const vx = (-jy * forwardX + jx * rightX) * moveDist;
                            const vz = (-jy * forwardZ + jx * rightZ) * moveDist;

                            const curPos = camEl.object3D.position;
                            const targetX = curPos.x + vx;
                            const targetZ = curPos.z + vz;

                            // Validasi Collision Sliding
                            if (typeof isPositionValid === 'function') {
                                if (isPositionValid(targetX, targetZ)) {
                                    curPos.x = targetX;
                                    curPos.z = targetZ;
                                } else if (isPositionValid(targetX, curPos.z)) {
                                    curPos.x = targetX; // Meluncur di sumbu X
                                } else if (isPositionValid(curPos.x, targetZ)) {
                                    curPos.z = targetZ; // Meluncur di sumbu Z
                                }
                            } else {
                                curPos.x = targetX;
                                curPos.z = targetZ;
                            }
                        }
                    }
                }

                // 2. Baca Controller Fisik Bluetooth / Gamepad VR (Analog & Tombol ABCD)
                this.pollGamepadControls(dt);

                requestAnimationFrame(motionTick);
            };

            requestAnimationFrame(motionTick);
        },

        // --- SISTEM KONTROL GAMEPAD BLUETOOTH / VR CONTROLLER FISIK (ANALOG & ABCD) ---
        pollGamepadControls: function (dt) {
            if (typeof navigator.getGamepads !== 'function') return;

            const gamepads = navigator.getGamepads();
            if (!gamepads) return;

            let gp = null;
            for (let i = 0; i < gamepads.length; i++) {
                if (gamepads[i] && gamepads[i].connected) {
                    gp = gamepads[i];
                    break;
                }
            }
            if (!gp) return;

            // 1. Baca Analog Joystick (Kalibrasi Orientasi Sesuai Mode Remote VR)
            // Push Depan: gp.axes[0] = -1 -> Maju (+1)
            // Push Belakang: gp.axes[0] = +1 -> Mundur (-1)
            // Push Kanan: gp.axes[1] = -1 -> Geser Kanan (+1)
            // Push Kiri: gp.axes[1] = +1 -> Geser Kiri (-1)
            const rawAx = gp.axes[0] || 0;
            const rawAy = gp.axes[1] || 0;

            const deadzone = 0.15;
            let forwardAmount = 0;
            let rightAmount = 0;

            if (Math.abs(rawAx) > deadzone) {
                forwardAmount = -rawAx; // rawAx < 0 (Depan) -> Maju (+1); rawAx > 0 (Belakang) -> Mundur (-1)
            }
            if (Math.abs(rawAy) > deadzone) {
                rightAmount = -rawAy; // rawAy < 0 (Kanan) -> Kanan (+1); rawAy > 0 (Kiri) -> Kiri (-1)
            }

            // Fallback jika controller memetakan D-Pad ke buttons (12: Up, 13: Down, 14: Left, 15: Right)
            if (gp.buttons[12] && (gp.buttons[12].pressed || gp.buttons[12].value > 0.5)) forwardAmount = 1;
            if (gp.buttons[13] && (gp.buttons[13].pressed || gp.buttons[13].value > 0.5)) forwardAmount = -1;
            if (gp.buttons[14] && (gp.buttons[14].pressed || gp.buttons[14].value > 0.5)) rightAmount = -1;
            if (gp.buttons[15] && (gp.buttons[15].pressed || gp.buttons[15].value > 0.5)) rightAmount = 1;

            if (Math.abs(forwardAmount) > 0 || Math.abs(rightAmount) > 0) {
                if (window.isSitting) {
                    if (typeof window.standUp === 'function') {
                        window.standUp();
                        this.updateSitButtonText();
                    }
                } else {
                    const camEl = document.getElementById('player-camera');
                    if (camEl && camEl.object3D) {
                        const camQuat = camEl.object3D.quaternion;
                        const euler = new AFRAME.THREE.Euler().setFromQuaternion(camQuat, 'YXZ');
                        const yawRad = euler.y;

                        const forwardX = -Math.sin(yawRad);
                        const forwardZ = -Math.cos(yawRad);
                        const rightX = Math.cos(yawRad);
                        const rightZ = -Math.sin(yawRad);

                        const moveDist = this.moveSpeed * dt;
                        const vx = (forwardAmount * forwardX + rightAmount * rightX) * moveDist;
                        const vz = (forwardAmount * forwardZ + rightAmount * rightZ) * moveDist;

                        const curPos = camEl.object3D.position;
                        const targetX = curPos.x + vx;
                        const targetZ = curPos.z + vz;

                        // Validasi Collision Sliding
                        if (typeof isPositionValid === 'function') {
                            if (isPositionValid(targetX, targetZ)) {
                                curPos.x = targetX;
                                curPos.z = targetZ;
                            } else if (isPositionValid(targetX, curPos.z)) {
                                curPos.x = targetX;
                            } else if (isPositionValid(curPos.x, targetZ)) {
                                curPos.z = targetZ;
                            }
                        } else {
                            curPos.x = targetX;
                            curPos.z = targetZ;
                        }
                    }
                }
            }

            // 2. Baca Tombol-Tombol Controller (A, B, C, D, Triggers) dengan Debounce
            if (!this._prevButtons) this._prevButtons = {};

            const checkButton = (index, callback) => {
                const btn = gp.buttons[index];
                const isPressed = btn && (btn.pressed || btn.value > 0.5);
                const wasPressed = !!this._prevButtons[index];
                this._prevButtons[index] = isPressed;

                if (isPressed && !wasPressed) {
                    callback();
                }
            };

            // Tombol 0 (A): Ojigi 30° / Membungkuk Salam Hormat (atau Konfirmasi jika Menu Resepsionis terbuka)
            checkButton(0, () => {
                if (window.MensetsuReceptionist && window.MensetsuReceptionist.isMenuOpen) {
                    window.MensetsuReceptionist.confirmSelectedMenu();
                } else if (typeof window.triggerOjigi === 'function') {
                    window.triggerOjigi();
                }
            });

            // Tombol 1 (B): Mic / Rekam Suara Jawaban Wawancara
            checkButton(1, () => {
                if (typeof window.handleMobileMicButton === 'function') {
                    window.handleMobileMicButton();
                }
            });

            // Tombol 2 (X / C): Ketuk Pintu 3x
            checkButton(2, () => {
                if (typeof window.triggerKnock === 'function') {
                    window.triggerKnock();
                }
            });

            // Tombol 3 (Y / D): Aksi / Interaksi / Konfirmasi Pilihan Menu Resepsionis
            checkButton(3, () => {
                if (window.MensetsuReceptionist && window.MensetsuReceptionist.isMenuOpen) {
                    window.MensetsuReceptionist.confirmSelectedMenu();
                } else if (typeof window.triggerAction === 'function') {
                    window.triggerAction();
                }
            });

            // Handler Navigasi Menu Pertanyaan Resepsionis via Tombol Shoulder L1 (Atas) & L2 (Bawah)
            const handleL1 = () => {
                if (window.MensetsuReceptionist && window.MensetsuReceptionist.isMenuOpen) {
                    window.MensetsuReceptionist.navigateMenu(-1);
                } else if (typeof window.triggerAction === 'function') {
                    window.triggerAction();
                }
            };

            const handleL2 = () => {
                if (window.MensetsuReceptionist && window.MensetsuReceptionist.isMenuOpen) {
                    window.MensetsuReceptionist.navigateMenu(1);
                } else if (typeof window.triggerOjigi === 'function') {
                    window.triggerOjigi();
                }
            };

            // Tombol 4 (L1 / Shoulder Atas): Scroll Pilihan Menu ke Atas
            checkButton(4, handleL1);

            // Tombol 5 (R1 / Shoulder Kanan Atas): Scroll Pilihan Menu ke Bawah / Ojigi
            checkButton(5, handleL2);

            // Tombol 6 (L2 / Trigger Bawah): Scroll Pilihan Menu ke Bawah
            checkButton(6, handleL2);

            // Tombol 7 (R2 / Trigger Bawah Kanan): Scroll Pilihan Menu ke Bawah
            checkButton(7, handleL2);
        }
    };

    // Notifikasi reaktif saat Controller VR terhubung via Bluetooth
    window.addEventListener('gamepadconnected', (e) => {
        console.log('Gamepad VR terhubung:', e.gamepad.id);
        if (typeof window.showActionToast === 'function') {
            window.showActionToast(`🎮 Controller VR Terhubung! Analog = Jalan, A/B/C/D = Aksi.`);
        }
    });
})();
