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
        if (interview && (interview.isWaitingForCandidateAnswer || interview.currentStep === 'ANSWER_1' || interview.currentStep === 'ANSWER_2')) {
            const qKey = interview.currentQuestionKey || (interview.currentStep === 'ANSWER_1' ? 'question1' : 'question2');
            interview.isCandidateAnswering = true;
            if (window.MensetsuRecorder) {
                window.MensetsuRecorder.startRecording(qKey);
            }
            if (typeof playAudioFeedback === 'function') playAudioFeedback('click');
            if (typeof window.showActionToast === 'function') {
                window.showActionToast('🔴 Merekam jawaban... Tekan B lagi setelah selesai bicara.');
            }
            return;
        }

        // 3. Jika sedang duduk di kursi kandidat tapi belum giliran menjawab (NPC sedang bicara)
        if (window.isSitting) {
            if (typeof window.showActionToast === 'function') {
                window.showActionToast('🎙️ Dengarkan pertanyaan pewawancara terlebih dahulu.');
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
        lookSensitivity: 0.0038,
        moveSpeed: 2.8, // meter per detik
        _xboxListenersAttached: false,

        init: function (mode) {
            this.activeMode = mode || 'pc';
            console.log(`Inisialisasi kontrol mode: [${this.activeMode.toUpperCase()}]`);

            if (this.activeMode === 'mobile') {
                this.setupMobileUI();
                this.setupJoystickEvents();
                this.setupCameraSwipeEvents();
                this.startMotionLoop();
            } else if (this.activeMode === 'pc') {
                this.removeMobileUI();
            } else if (this.activeMode === 'vr') {
                this.removeMobileUI();
                // A-Frame WebXR menangani kontrol 6DoF secara otomatis
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

            // 3. Area Panduan Geser Kamera Kanan
            if (!document.getElementById('mobile-swipe-guide')) {
                const swipeGuide = document.createElement('div');
                swipeGuide.id = 'mobile-swipe-guide';
                swipeGuide.innerHTML = `<span>Geser sisi kanan layar untuk memutar kamera</span>`;
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

        // --- SISTEM TOUCH SWIPE CAMERA LOOK (KANAN LAYAR) ---
        setupCameraSwipeEvents: function () {
            let lookTouchId = null;

            window.addEventListener('touchstart', (e) => {
                if (this.activeMode !== 'mobile') return;
                const screenW = window.innerWidth;

                for (let i = 0; i < e.changedTouches.length; i++) {
                    const t = e.changedTouches[i];
                    // Sentuhan di sisi kanan layar (X > 45% lebar layar)
                    if (t.clientX > screenW * 0.42 && lookTouchId === null) {
                        // Pastikan tidak menyentuh tombol aksi kanan
                        const el = document.elementFromPoint(t.clientX, t.clientY);
                        if (el && el.closest('#mobile-action-buttons, #top-nav-controls, #gate-screen')) {
                            continue;
                        }
                        lookTouchId = t.identifier;
                        this.touchLookActive = true;
                        this.lastLookTouch = { x: t.clientX, y: t.clientY };
                        break;
                    }
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
                        break;
                    }
                }
            }, { passive: true });

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

            // Putar Pitch (Atas - Bawah) dengan batas kemiringan aman (-1.4 s/d 1.4 rad)
            if (lookControls.pitchObject) {
                const newPitch = lookControls.pitchObject.rotation.x - deltaY * this.lookSensitivity;
                lookControls.pitchObject.rotation.x = Math.max(-1.35, Math.min(1.35, newPitch));
            }
        },

        // --- LOOP GERAKAN JOYSTICK KE KAMERA PEMAIN ---
        startMotionLoop: function () {
            let lastTime = performance.now();

            const motionTick = (now) => {
                const dt = Math.min((now - lastTime) / 1000, 0.08);
                lastTime = now;

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

                requestAnimationFrame(motionTick);
            };

            requestAnimationFrame(motionTick);
        }
    };
})();
