// =========================================================================
// SISTEM KONTROL MOBILE SENTUH & RESPONSIF (TOUCH JOYSTICK + CAMERA SWIPE)
// Mensetsu VR Room - Adaptive Multi-Device Controller
// =========================================================================

(function () {
    window.MensetsuControls = {
        activeMode: 'pc', // 'mobile' | 'pc' | 'vr'
        isJoystickActive: false,
        joystickVector: { x: 0, y: 0 },
        touchLookActive: false,
        lastLookTouch: { x: 0, y: 0 },
        lookSensitivity: 0.0038,
        moveSpeed: 2.8, // meter per detik

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

            // 2. Container Tombol Aksi Sentuh di Kanan Bawah
            if (!document.getElementById('mobile-action-buttons')) {
                const btnContainer = document.createElement('div');
                btnContainer.id = 'mobile-action-buttons';
                btnContainer.innerHTML = `
                    <button class="mob-btn btn-knock" id="mob-btn-knock" title="Ketuk pintu">
                        <span class="mob-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 21V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v17"/><path d="M14 12v.01"/></svg>
                        </span>
                        <span class="mob-text">Ketuk</span>
                    </button>
                    <button class="mob-btn btn-ojigi" id="mob-btn-ojigi" title="Ojigi 30 derajat">
                        <span class="mob-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="16" cy="4" r="2"/><path d="M6 18l4-8 5 2 3-5"/></svg>
                        </span>
                        <span class="mob-text">Ojigi</span>
                    </button>
                    <button class="mob-btn btn-sit" id="mob-btn-sit" title="Duduk atau berdiri">
                        <span class="mob-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4"/><path d="M5 16v5"/><path d="M19 16v5"/><path d="M5 10h14"/></svg>
                        </span>
                        <span class="mob-text" id="mob-text-sit">Duduk</span>
                    </button>
                    <button class="mob-btn btn-action" id="mob-btn-action" title="Interaksi objek">
                        <span class="mob-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>
                        </span>
                        <span class="mob-text">Aksi</span>
                    </button>
                `;
                document.body.appendChild(btnContainer);

                // Event Listeners Tombol Aksi Mobile
                document.getElementById('mob-btn-knock').addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    if (typeof window.triggerKnock === 'function') window.triggerKnock();
                });
                document.getElementById('mob-btn-ojigi').addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    if (typeof window.triggerOjigi === 'function') window.triggerOjigi();
                });
                document.getElementById('mob-btn-sit').addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    if (typeof window.toggleSit === 'function') window.toggleSit();
                    this.updateSitButtonText();
                });
                document.getElementById('mob-btn-action').addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    if (typeof window.triggerAction === 'function') window.triggerAction();
                });

                // Fallback untuk klik mouse di desktop saat uji coba mode mobile
                document.getElementById('mob-btn-knock').addEventListener('click', () => {
                    if (typeof window.triggerKnock === 'function') window.triggerKnock();
                });
                document.getElementById('mob-btn-ojigi').addEventListener('click', () => {
                    if (typeof window.triggerOjigi === 'function') window.triggerOjigi();
                });
                document.getElementById('mob-btn-sit').addEventListener('click', () => {
                    if (typeof window.toggleSit === 'function') window.toggleSit();
                    this.updateSitButtonText();
                });
                document.getElementById('mob-btn-action').addEventListener('click', () => {
                    if (typeof window.triggerAction === 'function') window.triggerAction();
                });
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

        removeMobileUI: function () {
            const joy = document.getElementById('virtual-joystick-zone');
            if (joy) joy.remove();
            const btns = document.getElementById('mobile-action-buttons');
            if (btns) btns.remove();
            const guide = document.getElementById('mobile-swipe-guide');
            if (guide) guide.remove();
        },

        updateSitButtonText: function () {
            const txt = document.getElementById('mob-text-sit');
            if (txt) {
                txt.textContent = window.isSitting ? 'Berdiri' : 'Duduk';
            }
        },

        updatePromptBadges: function () {
            const badge = document.querySelector('.key-badge');
            if (badge) {
                badge.textContent = this.activeMode === 'mobile' ? 'SENTUH' : 'F';
            }
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
