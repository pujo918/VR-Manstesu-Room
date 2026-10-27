// =========================================================================
// SISTEM NPC RESEPSIONIS INTERAKTIF RUANG TUNGGU (RECEPTIONIST NPC)
// Mensetsu VR Room - Takahashi Misaki (高橋 美咲 - 総合受付)
// Model 3D Rigged Humanoid, Seragam Resepsionis Korporat Jepang (Blazer Krem Gading & Pita Biru),
// Animasi Multi-Layer (Mengetik di PC, Sapaan Ojigi Duduk, Eye Tracking, Kedipan Mata, Gestur Tangan),
// serta Menu Interaktif Pilihan Topik (Check-in, Panduan Etika, Lokasi Ruangan).
// Standar Kualitas: Desain Formal Korporat Jepang, Bebas Emoji (0 Emoji)
// =========================================================================

(function () {
    const RECEPTION_DIALOGS = {
        WELCOME: {
            speaker: '高橋 美咲（総合受付）',
            jp: 'いらっしゃいませ。グローバルテック・ジャパン受付でございます。本日の面接のご用件でしたら、どうぞお声がけください。',
            displayJp: 'いらっしゃいませ。グローバルテック・ジャパン受付でございます。<br>本日の面接のご用件でしたら、どうぞお声がけください。',
            id: 'Selamat datang di Resepsionis Global Tech Japan. Tekan [F] atau [Y] untuk berbicara dengan resepsionis.',
            audioSrc: 'assets/audio/reception_welcome.mp3',
            gesture: 'bow'
        },
        MENU_PROMPT: {
            speaker: '高橋 美咲（総合受付）',
            jp: '本日はご来社ありがとうございます。どのようなご用件でしょうか？',
            displayJp: '本日はご来社ありがとうございます。<br>どのようなご用件でしょうか？',
            id: 'Terima kasih atas kedatangan Anda hari ini. Silakan pilih keperluan Anda.',
            audioSrc: 'assets/audio/reception_menu_prompt.mp3',
            gesture: 'polite'
        },
        TOPIC_CHECKIN: {
            speaker: '高橋 美咲（総合受付）',
            jp: 'お待ちしておりました。本日の面接ですね。受付を確認いたしました。順番にお呼びいたしますので、まずはソファにおかけになって、テレビで面接の案内動画をご覧になりながらお待ちください。',
            displayJp: 'お待ちしておりました。本日の面接ですね。受付を確認いたしました。<br>まずはソファにおかけになって、テレビで面接の案内動画をご覧になりながらお待ちください。',
            id: 'Silakan duduk di sofa terlebih dahulu sambil menonton panduan wawancara di televisi.',
            audioSrc: 'assets/audio/reception_topic_checkin.mp3',
            gesture: 'guide_lounge'
        },
        TOPIC_MANNER: {
            speaker: '高橋 美咲（総合受付）',
            jp: '入室前に、左手の姿見でスーツの身だしなみを整え、ソファ正面のモニターで面接マナー動画をご覧ください。入室時はドアを3回ノックし、「失礼します」と一礼してからお入りください。',
            displayJp: '入室前に、左手の姿見で身だしなみを整え、モニターでマナー動画をご覧ください。<br>入室時はドアを3回ノックし、「失礼します」と一礼してからお入りください。',
            id: 'Rapikan jas di cermin kiri dan tonton video etika di TV sofa. Ketuk pintu 3x dan bungkuk hormat saat masuk.',
            audioSrc: 'assets/audio/reception_topic_manner.mp3',
            gesture: 'guide_lounge'
        },
        TOPIC_LOCATION: {
            speaker: '高橋 美咲（総合受付）',
            jp: '第1面接室は、こちら正面奥の茶色いドアでございます。中では3名の面接官がお待ちですので、椅子の横に立って、「どうぞ」と案内されてからご着席ください。',
            displayJp: '第1面接室は、こちら正面奥の茶色いドアでございます。<br>椅子の横に立って、「どうぞ」と案内されてからご着席ください。',
            id: 'Ruang Wawancara 1 berada di balik pintu kayu di depan. Berdirilah di samping kursi hingga dipersilakan duduk.',
            audioSrc: 'assets/audio/reception_topic_location.mp3',
            gesture: 'guide_door'
        },
        CLOSING: {
            speaker: '高橋 美咲（総合受付）',
            jp: 'かしこまりました。面接がうまくいきますよう、心より応援しております。いってらっしゃいませ。',
            displayJp: 'かしこまりました。面接がうまくいきますよう、心より応援しております。<br>いってらっしゃいませ。',
            id: 'Semoga wawancara Anda berjalan lancar. Silakan menuju ruang wawancara.',
            audioSrc: 'assets/audio/reception_closing.mp3',
            gesture: 'bow'
        },
        CALL_ENTER: {
            speaker: '高橋 美咲（総合受付）',
            jp: 'お待たせいたしました。第1面接室のご準備が整いましたので、どうぞお入りください。入室の際は、ドアを3回ノックしてからお入りください。',
            displayJp: 'お待たせいたしました。第1面接室のご準備が整いましたので、どうぞお入りください。<br>入室の際は、ドアを3回ノックしてからお入りください。',
            id: 'Giliran Anda telah tiba. Lampu indikator di atas pintu telah berubah hijau, silakan ketuk pintu 3x dan masuk.',
            audioSrc: 'assets/audio/reception_call_enter.mp3',
            gesture: 'guide_door'
        },
        BOW_REPLY: {
            speaker: '高橋 美咲（総合受付）',
            jp: '恐れ入ります。どうぞよろしくお願いいたします。',
            displayJp: '恐れ入ります。どうぞよろしくお願いいたします。',
            id: 'Resepsionis membalas hormat Ojigi Anda dengan sopan.',
            audioSrc: 'assets/audio/reception_bow_reply.mp3',
            gesture: 'bow'
        }
    };

    window.MensetsuReceptionist = {
        isSpeaking: false,
        isMenuOpen: false,
        isInConversation: false,
        hasGreetedWelcome: false,
        hasCheckedIn: false,
        currentGesture: 'none', // 'none' | 'bow' | 'polite' | 'guide_lounge' | 'guide_door'
        gestureTimer: 0,
        bowTriggerTime: 0,
        currentAudio: null,
        currentSpeechDoneCallback: null,
        subtitleTimeout: null,

        // Daftar topik pertanyaan resepsionis sesuai urutan tampilan menu
        menuTopics: ['TOPIC_CHECKIN', 'TOPIC_MANNER', 'TOPIC_LOCATION', 'CLOSE'],
        selectedOptionIndex: 0,

        // Koordinat dunia konter resepsionis untuk deteksi jarak pemain
        counterPos: { x: 2.35, z: 10.45 },

        init: function () {
            this.createMenuOverlay();
            this.bindEvents();
        },

        createMenuOverlay: function () {
            if (document.getElementById('reception-menu-overlay')) return;

            const choicesHtml = `
                <button type="button" class="reception-rpg-btn" data-topic="TOPIC_CHECKIN">
                    <span class="rpg-choice-num">1.</span>
                    <span class="rpg-choice-text">本日の面接の受付をお願いします。</span>
                </button>
                <button type="button" class="reception-rpg-btn" data-topic="TOPIC_MANNER">
                    <span class="rpg-choice-num">2.</span>
                    <span class="rpg-choice-text">入室前のマナーや準備について教えてください。</span>
                </button>
                <button type="button" class="reception-rpg-btn" data-topic="TOPIC_LOCATION">
                    <span class="rpg-choice-num">3.</span>
                    <span class="rpg-choice-text">第1面接室の場所を教えてください。</span>
                </button>
                <button type="button" class="reception-rpg-btn" data-topic="CLOSE">
                    <span class="rpg-choice-num">4.</span>
                    <span class="rpg-choice-text">ありがとうございました。</span>
                </button>
            `;

            const menu = document.createElement('div');
            menu.id = 'reception-menu-overlay';
            menu.setAttribute('aria-hidden', 'true');
            menu.innerHTML = `
                <div class="reception-rpg-pane reception-rpg-pane-left">
                    ${choicesHtml}
                </div>
                <div class="reception-rpg-pane reception-rpg-pane-right" aria-hidden="true">
                    ${choicesHtml}
                </div>
            `;
            document.body.appendChild(menu);

            const topicBtns = menu.querySelectorAll('.reception-rpg-btn');
            topicBtns.forEach((btn) => {
                btn.addEventListener('mouseenter', () => {
                    const topic = btn.getAttribute('data-topic');
                    const idx = this.menuTopics.indexOf(topic);
                    if (idx !== -1) {
                        this.selectedOptionIndex = idx;
                        this.updateMenuHighlight();
                    }
                });

                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const topic = btn.getAttribute('data-topic');
                    if (topic === 'CLOSE') {
                        this.closeMenu(true);
                    } else {
                        this.selectTopic(topic);
                    }
                });
            });
        },

        updateMenuHighlight: function () {
            const menu = document.getElementById('reception-menu-overlay');
            if (!menu) return;
            const targetTopic = this.menuTopics[this.selectedOptionIndex];
            const btns = menu.querySelectorAll('.reception-rpg-btn');
            btns.forEach((btn) => {
                const isSelected = btn.getAttribute('data-topic') === targetTopic;
                btn.classList.toggle('is-selected', isSelected);
                if (isSelected) {
                    btn.setAttribute('aria-selected', 'true');
                } else {
                    btn.removeAttribute('aria-selected');
                }
            });
        },

        navigateMenu: function (dir) {
            if (!this.isMenuOpen) return;
            const len = this.menuTopics.length;
            this.selectedOptionIndex = (this.selectedOptionIndex + dir + len) % len;
            this.updateMenuHighlight();
            if (typeof playAudioFeedback === 'function') {
                playAudioFeedback('click');
            }
        },

        confirmSelectedMenu: function () {
            if (!this.isMenuOpen) return;
            const topic = this.menuTopics[this.selectedOptionIndex];
            if (topic === 'CLOSE') {
                this.closeMenu(true);
            } else {
                this.selectTopic(topic);
            }
        },

        bindEvents: function () {
            // Respons Ojigi: Jika pemain membungkuk (Ojigi) di dekat meja resepsionis, resepsionis membalas bungkukan
            window.addEventListener('mensetsu-ojigi', () => {
                if (this.isPlayerNear(3.4) && !this.isSpeaking && !this.isInConversation) {
                    this.triggerBow();
                    this.speakDialogue('BOW_REPLY');
                }
            });

            // Shortcut angka 1, 2, 3, 4, panah atas/bawah, Enter dan 0/Escape saat pilihan pertanyaan terbuka
            window.addEventListener('keydown', (e) => {
                if (!this.isInConversation) return;
                if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

                if (e.key === '0' || e.key === 'Escape') {
                    e.preventDefault();
                    this.closeMenu(true);
                    return;
                }

                if (!this.isMenuOpen) return;

                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigateMenu(-1);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navigateMenu(1);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    this.confirmSelectedMenu();
                } else if (e.key === '1') {
                    e.preventDefault();
                    this.selectTopic('TOPIC_CHECKIN');
                } else if (e.key === '2') {
                    e.preventDefault();
                    this.selectTopic('TOPIC_MANNER');
                } else if (e.key === '3') {
                    e.preventDefault();
                    this.selectTopic('TOPIC_LOCATION');
                } else if (e.key === '4') {
                    e.preventDefault();
                    this.closeMenu(true);
                }
            });
        },

        isPlayerNear: function (maxDist) {
            const camera = document.getElementById('player-camera');
            if (!camera || !camera.object3D) return false;
            const pos = camera.object3D.position;
            // Hanya di area ruang tunggu (Z > 6.2)
            if (pos.z < 6.2) return false;
            const dist = Math.hypot(pos.x - this.counterPos.x, pos.z - this.counterPos.z);
            return dist <= (maxDist || 2.8);
        },

        triggerBow: function () {
            this.bowTriggerTime = performance.now();
        },

        showChoicesMenu: function () {
            if (!this.isInConversation) return;
            this.createMenuOverlay();

            // Sembunyikan transkrip dialog NPC terlebih dahulu agar bergantian dan tidak saling menutupi
            if (this.subtitleTimeout) {
                clearTimeout(this.subtitleTimeout);
                this.subtitleTimeout = null;
            }
            const subOverlay = document.getElementById('npc-dialogue-overlay');
            if (subOverlay) {
                subOverlay.classList.remove('active');
            }

            const menu = document.getElementById('reception-menu-overlay');
            if (menu) {
                this.isMenuOpen = true;
                this.selectedOptionIndex = 0;
                this.updateMenuHighlight();
                menu.classList.add('active');
                menu.setAttribute('aria-hidden', 'false');
            }
        },

        hideChoicesMenu: function () {
            const menu = document.getElementById('reception-menu-overlay');
            if (menu) {
                menu.classList.remove('active');
                menu.setAttribute('aria-hidden', 'true');
            }
            this.isMenuOpen = false;
        },

        interact: function () {
            if (this.isInConversation) {
                // Jika resepsionis sedang berbicara dalam sesi percakapan dan user menekan tombol aksi lagi,
                // lewati ucapan saat ini dan langsung tampilkan pilihan pertanyaan RPG
                if (this.isSpeaking && !this.isMenuOpen) {
                    this.skipCurrentSpeechToChoices();
                    return;
                }
                // Jika pilihan pertanyaan sedang terbuka, tombol aksi akan mengeksekusi pilihan yang sedang disorot
                if (this.isMenuOpen) {
                    this.confirmSelectedMenu();
                    return;
                }
                this.closeMenu(true);
                return;
            }
            this.openMenu();
        },

        skipCurrentSpeechToChoices: function () {
            if (this.currentAudio) {
                try {
                    this.currentAudio.pause();
                    this.currentAudio.currentTime = 0;
                } catch (e) {}
                this.currentAudio = null;
            }
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            this.isSpeaking = false;
            this.currentGesture = 'none';
            const cb = this.currentSpeechDoneCallback;
            this.currentSpeechDoneCallback = null;
            if (cb) {
                cb();
            } else if (this.isInConversation) {
                this.showChoicesMenu();
            }
        },

        openMenu: function () {
            this.createMenuOverlay();
            this.isInConversation = true;
            this.hideChoicesMenu();

            if (typeof playAudioFeedback === 'function') {
                playAudioFeedback('click');
            }

            this.triggerBow();
            // Resepsionis berbicara terlebih dahulu; setelah selesai bicara, pilihan pertanyaan muncul bergantian
            this.speakDialogue('MENU_PROMPT', () => {
                if (this.isInConversation) {
                    this.showChoicesMenu();
                }
            });
        },

        closeMenu: function (playFarewell) {
            const wasInConv = this.isInConversation || this.isMenuOpen;
            this.isInConversation = false;
            this.currentSpeechDoneCallback = null;
            this.hideChoicesMenu();

            const menu = document.getElementById('reception-menu-overlay');
            if (menu) {
                menu.querySelectorAll('.reception-rpg-btn').forEach((btn) => {
                    btn.classList.remove('is-selected');
                });
            }

            if (wasInConv && playFarewell) {
                this.triggerBow();
                this.speakDialogue('CLOSING');
            } else if (!playFarewell) {
                if (this.currentAudio) {
                    try {
                        this.currentAudio.pause();
                        this.currentAudio.currentTime = 0;
                    } catch (e) {}
                    this.currentAudio = null;
                }
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                }
                this.isSpeaking = false;
                this.currentGesture = 'none';
                const overlay = document.getElementById('npc-dialogue-overlay');
                if (overlay) overlay.classList.remove('active');
            }
        },

        selectTopic: function (topicKey) {
            if (!RECEPTION_DIALOGS[topicKey]) return;

            if (typeof playAudioFeedback === 'function') {
                playAudioFeedback('click');
            }

            const menu = document.getElementById('reception-menu-overlay');
            if (menu) {
                menu.querySelectorAll('.reception-rpg-btn').forEach((btn) => {
                    btn.classList.toggle('is-selected', btn.getAttribute('data-topic') === topicKey);
                });
            }

            // Setiap kali kandidat menanyakan keperluan wawancara ke resepsionis, tandai sudah melapor ke resepsionis
            this.hasCheckedIn = true;
            if (!window.MensetsuState) window.MensetsuState = {};
            window.MensetsuState.receptionCheckedIn = true;

            if (topicKey === 'TOPIC_CHECKIN') {
                this.triggerBow();
            }

            // Sembunyikan pilihan pertanyaan saat resepsionis menjawab, lalu munculkan kembali setelah selesai bicara
            this.hideChoicesMenu();
            this.speakDialogue(topicKey, () => {
                if (this.isInConversation) {
                    this.showChoicesMenu();
                }
            });
        },

        callCandidateToEnter: function () {
            this.isInConversation = false;
            this.hideChoicesMenu();
            this.triggerBow();
            this.speakDialogue('CALL_ENTER');
        },

        speakDialogue: function (dialogKey, onDone) {
            const data = RECEPTION_DIALOGS[dialogKey];
            if (!data) return;

            // Pastikan pilihan pertanyaan disembunyikan selama transkrip pembicaraan NPC tampil
            this.hideChoicesMenu();

            // Tampilkan teks dialog Jepang secara berkala pada 3D Speech Bubble di atas kepala resepsionis
            if (window.MensetsuInterview && typeof window.MensetsuInterview.setSubtitleContent === 'function') {
                window.MensetsuInterview.setSubtitleContent(data.speaker, `「${data.jp || data.displayJp}」`, 'npc-receptionist');
            }

            const overlay = document.getElementById('npc-dialogue-overlay');

            if (this.subtitleTimeout) {
                clearTimeout(this.subtitleTimeout);
                this.subtitleTimeout = null;
            }

            this.isSpeaking = true;
            this.currentGesture = data.gesture || 'polite';
            this.gestureTimer = 0;
            this.currentSpeechDoneCallback = onDone || null;

            // Hentikan audio sebelumnya
            if (this.currentAudio) {
                try {
                    this.currentAudio.pause();
                    this.currentAudio.currentTime = 0;
                } catch (e) {}
                this.currentAudio = null;
            }

            const finishSpeech = () => {
                this.isSpeaking = false;
                this.currentGesture = 'none';
                const doneCb = this.currentSpeechDoneCallback;
                this.currentSpeechDoneCallback = null;

                if (doneCb) {
                    // Jeda singkat alami sebelum transkrip berganti menjadi pilihan pertanyaan RPG
                    this.subtitleTimeout = setTimeout(() => {
                        if (overlay) overlay.classList.remove('active');
                        doneCb();
                    }, 350);
                } else {
                    this.subtitleTimeout = setTimeout(() => {
                        if (!this.isSpeaking && (!window.MensetsuInterview || !window.MensetsuInterview.isNpcSpeaking)) {
                            if (overlay) overlay.classList.remove('active');
                        }
                    }, 1800);
                }
            };

            if (data.audioSrc) {
                const audio = new Audio(data.audioSrc);
                this.currentAudio = audio;
                let ended = false;
                const onEnd = () => {
                    if (ended) return;
                    ended = true;
                    this.currentAudio = null;
                    finishSpeech();
                };
                audio.onended = onEnd;
                audio.onerror = () => {
                    this.speakFallbackTTS(data.jp, onEnd);
                };
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {
                        this.speakFallbackTTS(data.jp, onEnd);
                    });
                }
            } else {
                this.speakFallbackTTS(data.jp, finishSpeech);
            }
        },

        speakFallbackTTS: function (text, onEnd) {
            if (!('speechSynthesis' in window)) {
                setTimeout(onEnd, 3200);
                return;
            }
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'ja-JP';
            const voices = window.speechSynthesis.getVoices();
            const jaVoices = voices.filter(v => v.lang.startsWith('ja') || v.lang.includes('JP'));
            const femaleVoice = jaVoices.find(v => v.name.includes('Nanami') || v.name.includes('Female') || v.name.includes('Kyoko') || v.name.includes('Haruka') || v.name.includes('Google 日本語'));
            if (femaleVoice) u.voice = femaleVoice;
            u.pitch = 1.14;
            u.rate = 0.96;
            u.onend = () => { if (onEnd) onEnd(); };
            u.onerror = () => { if (onEnd) onEnd(); };
            window.speechSynthesis.speak(u);
        }
    };

    // =========================================================================
    // GENERATOR TEKSTUR KAIN PBR PROSEDURAL (BEBAS FLAT COLOR)
    // =========================================================================
    function createCreamTweedTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Warna dasar kain blazer krem gading lembut (Warm Ivory Corporate Suit)
        ctx.fillStyle = '#f3eee4';
        ctx.fillRect(0, 0, 256, 256);

        // Serat tenun mikro (woven twill grain) agar permukaan kain tampak nyata
        for (let y = 0; y < 256; y += 2) {
            ctx.fillStyle = (y % 4 === 0) ? 'rgba(226, 218, 203, 0.45)' : 'rgba(255, 252, 245, 0.45)';
            ctx.fillRect(0, y, 256, 1);
        }
        for (let x = 0; x < 256; x += 2) {
            ctx.fillStyle = (x % 4 === 0) ? 'rgba(219, 210, 194, 0.32)' : 'rgba(255, 255, 255, 0.25)';
            ctx.fillRect(x, 0, 1, 256);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(6, 6);
        return tex;
    }

    function createCorporateRibbonTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Pita sutra biru korporat Global Tech Japan
        const grad = ctx.createLinearGradient(0, 0, 256, 256);
        grad.addColorStop(0, '#0369a1');
        grad.addColorStop(0.5, '#0284c7');
        grad.addColorStop(1, '#0c4a6e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);

        // Aksen garis diagonal sutra halus
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.28)';
        ctx.lineWidth = 6;
        for (let i = -256; i < 512; i += 32) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 256, 256);
            ctx.stroke();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    // =========================================================================
    // KOMPONEN A-FRAME: npc-receptionist
    // =========================================================================
    AFRAME.registerComponent('npc-receptionist', {
        init: function () {
            this.bones = {};
            this.morphMeshes = [];
            this.bodyMesh = null;
            this.idleTime = 0;

            // Pelacak rotasi kepala & badan halus
            this.currentHeadYaw = -0.28;
            this.currentHeadPitch = -0.06;
            this.currentSpineYaw = 0;
            this.currentSpinePitch = 0;

            // Pelacak kedipan mata natural (eye_close morph)
            this.blinkTimer = 2.5 + Math.random() * 2.5;
            this.blinkPhase = 0;
            this.isBlinking = false;

            // Pelacak anggukan ramah (Aizuchi)
            this.nodTimer = 4.0 + Math.random() * 3.0;
            this.nodPhase = 0;
            this.isNodding = false;

            const modelUrl = 'assets/teacher_nanami.glb';

            const onModelReady = () => {
                this.model = this.el.getObject3D('mesh');
                if (!this.model) return;

                // Proporsi tubuh wanita dewasa yang anggun, rapi, dan proporsional
                this.model.scale.set(1.03, 1.03, 1.03);

                this.bones = {};
                this.morphMeshes = [];

                this.model.traverse((node) => {
                    if (node.isBone) {
                        this.bones[node.name] = node;
                        node.userData.restQuat = node.quaternion.clone();
                    }
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                        if (node.morphTargetInfluences && node.morphTargetInfluences.length > 0) {
                            this.morphMeshes.push(node);
                            if (node.name === 'body') {
                                this.bodyMesh = node;
                            }
                        }
                    }
                });

                this.customizeReceptionistAppearance();
                this.applySeatedReceptionistPose();

                // Daftarkan klik langsung pada model 3D resepsionis
                this.el.classList.add('clickable');
                this.el.addEventListener('click', () => {
                    if (window.MensetsuReceptionist && window.MensetsuReceptionist.isPlayerNear(3.5)) {
                        window.MensetsuReceptionist.interact();
                    } else if (typeof window.showActionToast === 'function') {
                        window.showActionToast('Dekati meja resepsionis untuk berbicara.');
                    }
                });
            };

            this.el.addEventListener('model-loaded', onModelReady);
            if (this.el.getObject3D('mesh')) {
                onModelReady();
            } else {
                this.el.setAttribute('gltf-model', modelUrl);
            }
        },

        customizeReceptionistAppearance: function () {
            const creamSuitTex = createCreamTweedTexture();
            const blueRibbonTex = createCorporateRibbonTexture();

            const suitMat = new THREE.MeshStandardMaterial({
                map: creamSuitTex,
                color: 0xfaf6ee,
                roughness: 0.54,
                metalness: 0.04
            });

            const shirtMat = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.42,
                metalness: 0.02
            });

            const ribbonMat = new THREE.MeshStandardMaterial({
                map: blueRibbonTex,
                color: 0xffffff,
                roughness: 0.28,
                metalness: 0.14
            });

            const goldButtonMat = new THREE.MeshStandardMaterial({
                color: 0xe5b842,
                roughness: 0.22,
                metalness: 0.88
            });

            const skirtPantsMat = new THREE.MeshStandardMaterial({
                color: 0x162032,
                roughness: 0.64,
                metalness: 0.05
            });

            const shoesMat = new THREE.MeshStandardMaterial({
                color: 0x0f172a,
                roughness: 0.22,
                metalness: 0.18
            });

            const pearlMat = new THREE.MeshStandardMaterial({
                color: 0xfffcf5,
                roughness: 0.14,
                metalness: 0.25
            });

            this.model.traverse((child) => {
                if (!child.isMesh) return;

                const meshName = (child.name || '').toLowerCase();

                // 1. Lepas kacamata agar wajah bersih, cantik, dan berbeda dari Suzuki-sensei
                if (meshName.includes('eyeglass')) {
                    child.visible = false;
                    return;
                }

                // 2. Blazer Resepsionis Krem Gading (Warm Ivory Tailored Jacket)
                if (meshName === 'suit') {
                    child.material = suitMat;
                }
                // 3. Kemeja Dalam Putih Bersih
                else if (meshName === 'shirt') {
                    child.material = shirtMat;
                }
                // 4. Pita Leher Sutra Biru Korporat Global Tech Japan
                else if (meshName === 'tie') {
                    child.material = ribbonMat;
                }
                // 5. Kancing Emas Champagne
                else if (meshName.includes('button')) {
                    child.material = goldButtonMat;
                }
                // 6. Bawahan Formal Navy Gelap
                else if (meshName === 'pants') {
                    child.material = skirtPantsMat;
                }
                // 7. Sepatu Hak Formal Hitam Mengkilap
                else if (meshName === 'shoes') {
                    child.material = shoesMat;
                }
                // 8. Anting Mutiara Akoya
                else if (meshName.includes('earing')) {
                    child.material = pearlMat;
                }
                // 9. Rambut Coklat Gelap Hangat Rapi (Warm Chestnut-Espresso)
                else if (meshName.includes('nurbspath') || (child.material && child.material.name === 'HAIR')) {
                    child.material = child.material.clone();
                    child.material.color.setHex(0xd6a98a); // Memberikan nuansa coklat espresso lembut di atas tekstur rambut
                    child.material.roughness = 0.38;
                    child.material.metalness = 0.08;
                }
                // 10. Kulit Wajah & Tubuh Halus Alami
                else if (meshName === 'body') {
                    if (Array.isArray(child.material)) {
                        child.material = child.material.map(m => {
                            const cl = m.clone();
                            cl.roughness = 0.52;
                            return cl;
                        });
                    } else if (child.material) {
                        child.material = child.material.clone();
                        child.material.roughness = 0.52;
                        child.material.metalness = 0.02;
                    }
                }
            });
        },

        applySeatedReceptionistPose: function () {
            const bones = this.bones;
            const axX = new THREE.Vector3(1, 0, 0);
            const axY = new THREE.Vector3(0, 1, 0);
            const axZ = new THREE.Vector3(0, 0, 1);

            // Duduk anggun di kursi resepsionis dengan punggung tegak rapi
            if (bones['Hips']) {
                bones['Hips'].position.set(0, 0.51, -0.10);
            }

            // Kaki duduk merapat sopan (lutut dan betis sejajar rapi)
            if (bones['LeftUpLeg']) {
                bones['LeftUpLeg'].quaternion.copy(bones['LeftUpLeg'].userData.restQuat)
                    .multiply(new THREE.Quaternion().setFromAxisAngle(axX, -1.55))
                    .multiply(new THREE.Quaternion().setFromAxisAngle(axZ, -0.04));
            }
            if (bones['RightUpLeg']) {
                bones['RightUpLeg'].quaternion.copy(bones['RightUpLeg'].userData.restQuat)
                    .multiply(new THREE.Quaternion().setFromAxisAngle(axX, -1.55))
                    .multiply(new THREE.Quaternion().setFromAxisAngle(axZ, 0.04));
            }
            if (bones['LeftLeg']) {
                bones['LeftLeg'].quaternion.copy(bones['LeftLeg'].userData.restQuat)
                    .multiply(new THREE.Quaternion().setFromAxisAngle(axX, 1.52));
            }
            if (bones['RightLeg']) {
                bones['RightLeg'].quaternion.copy(bones['RightLeg'].userData.restQuat)
                    .multiply(new THREE.Quaternion().setFromAxisAngle(axX, 1.52));
            }

            // Tulang belakang tegak anggun (postur resepsionis profesional)
            if (bones['Spine']) {
                bones['Spine'].quaternion.copy(bones['Spine'].userData.restQuat);
                bones['Spine'].userData.baseQuat = bones['Spine'].quaternion.clone();
            }
            if (bones['Spine1']) {
                bones['Spine1'].userData.baseQuat = bones['Spine1'].quaternion.clone();
            }
            if (bones['Spine2']) {
                bones['Spine2'].userData.baseQuat = bones['Spine2'].quaternion.clone();
            }

            // Lengan atas turun rapat secara anatomis dari rest T-pose ke sisi pinggang (siku tidak melebar)
            const dropL = new THREE.Quaternion().setFromEuler(new THREE.Euler(1.0, -0.2, -1.1, 'XYZ'));
            const dropR = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.9, 0.3, 1.0, 'XYZ'));

            if (bones['LeftArm']) {
                bones['LeftArm'].quaternion.copy(bones['LeftArm'].userData.restQuat).multiply(dropL);
                bones['LeftArm'].userData.seatedQuat = bones['LeftArm'].quaternion.clone();
            }
            if (bones['RightArm']) {
                bones['RightArm'].quaternion.copy(bones['RightArm'].userData.restQuat).multiply(dropR);
                bones['RightArm'].userData.seatedQuat = bones['RightArm'].quaternion.clone();
            }

            // Lengan bawah mengerucut anggun ke depan di atas meja kerja dalam (postur soroeru)
            const bendL = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.75, -0.35, 0.4, 'XYZ'));
            const bendR = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.6, 0.35, -0.1, 'XYZ'));

            if (bones['LeftForeArm']) {
                bones['LeftForeArm'].quaternion.copy(bones['LeftForeArm'].userData.restQuat).multiply(bendL);
                bones['LeftForeArm'].userData.seatedQuat = bones['LeftForeArm'].quaternion.clone();
            }
            if (bones['RightForeArm']) {
                bones['RightForeArm'].quaternion.copy(bones['RightForeArm'].userData.restQuat).multiply(bendR);
                bones['RightForeArm'].userData.seatedQuat = bones['RightForeArm'].quaternion.clone();
            }

            // Pergelangan tangan menapak lembut di atas meja
            const qHandL = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.08, 0.0, -0.05, 'XYZ'));
            const qHandR = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.08, 0.0, 0.05, 'XYZ'));

            if (bones['LeftHand']) {
                bones['LeftHand'].quaternion.copy(bones['LeftHand'].userData.restQuat).multiply(qHandL);
                bones['LeftHand'].userData.seatedQuat = bones['LeftHand'].quaternion.clone();
            }
            if (bones['RightHand']) {
                bones['RightHand'].quaternion.copy(bones['RightHand'].userData.restQuat).multiply(qHandR);
                bones['RightHand'].userData.seatedQuat = bones['RightHand'].quaternion.clone();
            }

            if (bones['Head']) {
                bones['Head'].quaternion.copy(bones['Head'].userData.restQuat);
                bones['Head'].userData.baseQuat = bones['Head'].quaternion.clone();
            }
        },

        tick: function (time, delta) {
            if (!this.bones['Head'] || !this.bones['Head'].userData.baseQuat) return;

            const dt = Math.min((delta || 16) / 1000, 0.1);
            this.idleTime += dt;

            const sys = window.MensetsuReceptionist;
            const camera = document.getElementById('player-camera');
            let distToPlayer = 99;
            let relYawToPlayer = 0;
            let relPitchToPlayer = 0;

            if (camera && camera.object3D) {
                const camPos = camera.object3D.position;
                // Posisi dunia resepsionis sekitar (X: 3.16, Y: 1.34, Z: 10.46), menghadap -X
                const npcWorldX = 3.16;
                const npcWorldY = 1.34;
                const npcWorldZ = 10.46;

                const dx = camPos.x - npcWorldX;
                const dy = camPos.y - npcWorldY;
                const dz = camPos.z - npcWorldZ;
                distToPlayer = Math.hypot(dx, dz);

                // Karena resepsionis menghadap arah -X (menuju tengah lobby):
                // Vektor depan resepsionis adalah (-1, 0, 0), vektor kanan resepsionis adalah (0, 0, -1)
                const forwardDist = Math.max(0.4, -dx);
                // Di koordinat lokal tulang Head Nanami, rotasi +Y menoleh ke kiri (+Z dunia), -Y menoleh ke kanan (-Z dunia)
                relYawToPlayer = THREE.MathUtils.clamp(Math.atan2(dz, forwardDist), -0.58, 0.58);
                relPitchToPlayer = THREE.MathUtils.clamp(-Math.atan2(dy, forwardDist) * 0.6, -0.22, 0.18);
            }

            const isPlayerApproaching = distToPlayer <= 3.3 && camera && camera.object3D.position.z > 6.2;
            const isSpeaking = sys && sys.isSpeaking;

            // Tutup menu & percakapan otomatis jika pemain berjalan menjauh dari meja resepsionis
            if (sys && (sys.isMenuOpen || sys.isInConversation) && distToPlayer > 3.6) {
                sys.closeMenu(false);
            }

            // =========================================================
            // 1. PERNAPASAN ALAMI & OJIGI DUDUK (ZAREI 15 DERAJAT)
            // =========================================================
            const breath = Math.sin(this.idleTime * 1.7) * 0.012 + Math.sin(this.idleTime * 3.3) * 0.003;

            let bowPitch = 0;
            if (sys && sys.bowTriggerTime > 0) {
                const elapsedBow = performance.now() - sys.bowTriggerTime;
                const bowDuration = 1350;
                if (elapsedBow < bowDuration) {
                    // Kurva membungkuk hormat resepsionis (turun halus, tahan sejenak, kembali tegak)
                    const p = elapsedBow / bowDuration;
                    const bowCurve = Math.sin(p * Math.PI);
                    bowPitch = bowCurve * 0.24; // ~14 derajat duduk membungkuk anggun
                } else {
                    sys.bowTriggerTime = 0;
                }
            }

            const targetSpinePitch = breath + bowPitch;
            const targetSpineYaw = isPlayerApproaching ? (relYawToPlayer * 0.25) : -0.10;

            this.currentSpinePitch = THREE.MathUtils.lerp(this.currentSpinePitch, targetSpinePitch, dt * 6.0);
            this.currentSpineYaw = THREE.MathUtils.lerp(this.currentSpineYaw, targetSpineYaw, dt * 4.5);

            const axX = new THREE.Vector3(1, 0, 0);
            const axY = new THREE.Vector3(0, 1, 0);
            const axZ = new THREE.Vector3(0, 0, 1);

            if (this.bones['Spine1'] && this.bones['Spine1'].userData.baseQuat) {
                const qS1 = new THREE.Quaternion()
                    .setFromAxisAngle(axX, this.currentSpinePitch * 0.55)
                    .multiply(new THREE.Quaternion().setFromAxisAngle(axY, this.currentSpineYaw * 0.5));
                this.bones['Spine1'].quaternion.copy(this.bones['Spine1'].userData.baseQuat).multiply(qS1);
            }
            if (this.bones['Spine2'] && this.bones['Spine2'].userData.baseQuat) {
                const qS2 = new THREE.Quaternion()
                    .setFromAxisAngle(axX, this.currentSpinePitch * 0.45)
                    .multiply(new THREE.Quaternion().setFromAxisAngle(axY, this.currentSpineYaw * 0.5));
                this.bones['Spine2'].quaternion.copy(this.bones['Spine2'].userData.baseQuat).multiply(qS2);
            }

            // =========================================================
            // 2. PANDANGAN KEPALA & ANGGUKAN RAMAH (EYE CONTACT & AIZUCHI)
            // =========================================================
            let targetHeadYaw = 0;
            let targetHeadPitch = 0;

            if (isPlayerApproaching || isSpeaking || (sys && sys.isMenuOpen)) {
                // Menatap ramah ke arah mata kandidat
                targetHeadYaw = relYawToPlayer * 0.75;
                targetHeadPitch = relPitchToPlayer + (bowPitch * 0.35);
            } else {
                // Saat kandidat jauh: melihat ke layar monitor widescreen di sisi kiri (+Z) & buku daftar hadir
                const workCycle = Math.sin(this.idleTime * 0.45);
                if (workCycle > -0.3) {
                    // Menatap layar monitor resepsionis
                    targetHeadYaw = 0.34 + Math.sin(this.idleTime * 1.1) * 0.03;
                    targetHeadPitch = -0.05 + Math.cos(this.idleTime * 0.9) * 0.02;
                } else {
                    // Mengecek buku tamu / catatan di meja
                    targetHeadYaw = -0.08;
                    targetHeadPitch = 0.14;
                }
            }

            // Anggukan sopan berkala
            this.nodTimer -= dt;
            if (this.nodTimer <= 0 && !this.isNodding) {
                this.isNodding = true;
                this.nodPhase = 0;
                this.nodTimer = isPlayerApproaching ? (3.2 + Math.random() * 2.8) : (5.0 + Math.random() * 4.0);
            }
            let nodOffset = 0;
            if (this.isNodding) {
                this.nodPhase += dt * 3.8;
                if (this.nodPhase <= Math.PI * 2) {
                    nodOffset = Math.sin(this.nodPhase) * 0.07;
                } else {
                    this.isNodding = false;
                }
            }

            const speakHeadMicro = isSpeaking ? Math.sin(this.idleTime * 4.5) * 0.022 : 0;

            this.currentHeadYaw = THREE.MathUtils.lerp(this.currentHeadYaw, targetHeadYaw, dt * 5.0);
            this.currentHeadPitch = THREE.MathUtils.lerp(this.currentHeadPitch, targetHeadPitch + nodOffset + speakHeadMicro, dt * 5.0);

            const qHead = new THREE.Quaternion()
                .setFromAxisAngle(axX, this.currentHeadPitch)
                .multiply(new THREE.Quaternion().setFromAxisAngle(axY, this.currentHeadYaw));
            this.bones['Head'].quaternion.copy(this.bones['Head'].userData.baseQuat).multiply(qHead);

            // =========================================================
            // 3. ANIMASI TANGAN: MENGETIK SAAT IDLE & GESTUR PEMANDU SAAT BICARA
            // =========================================================
            if (isSpeaking && sys) {
                sys.gestureTimer += dt;
                const gType = sys.currentGesture;

                if (gType === 'guide_lounge' || gType === 'guide_door') {
                    // Gestur tangan kanan terbuka mempersilakan (案内ポーズ - Open-palm directional gesture)
                    const dirWave = Math.sin(sys.gestureTimer * 2.6) * 0.06;
                    if (this.bones['RightForeArm'] && this.bones['RightForeArm'].userData.seatedQuat) {
                        const qGuideArm = new THREE.Quaternion()
                            .setFromAxisAngle(axX, -0.22 + dirWave)
                            .multiply(new THREE.Quaternion().setFromAxisAngle(axZ, -0.18));
                        this.bones['RightForeArm'].quaternion.slerp(
                            this.bones['RightForeArm'].userData.seatedQuat.clone().multiply(qGuideArm),
                            dt * 6.0
                        );
                    }
                    if (this.bones['RightHand'] && this.bones['RightHand'].userData.seatedQuat) {
                        const qGuideHand = new THREE.Quaternion()
                            .setFromAxisAngle(axY, -0.35)
                            .multiply(new THREE.Quaternion().setFromAxisAngle(axX, -0.15));
                        this.bones['RightHand'].quaternion.slerp(
                            this.bones['RightHand'].userData.seatedQuat.clone().multiply(qGuideHand),
                            dt * 6.0
                        );
                    }
                } else {
                    // Gestur bicara formal yang halus
                    const lift = Math.sin(this.idleTime * 3.2) * 0.045 - 0.03;
                    if (this.bones['RightForeArm'] && this.bones['RightForeArm'].userData.seatedQuat) {
                        const qLift = new THREE.Quaternion().setFromAxisAngle(axX, lift);
                        this.bones['RightForeArm'].quaternion.slerp(
                            this.bones['RightForeArm'].userData.seatedQuat.clone().multiply(qLift),
                            dt * 6.0
                        );
                    }
                }
            } else if (!isPlayerApproaching) {
                // Saat idle: gerakan jari & pergelangan tangan mengetik lembut di keyboard
                const typeL = Math.sin(this.idleTime * 7.5) * 0.035 + Math.cos(this.idleTime * 11.2) * 0.015;
                const typeR = Math.cos(this.idleTime * 8.2) * 0.035 + Math.sin(this.idleTime * 12.0) * 0.015;

                if (this.bones['LeftHand'] && this.bones['LeftHand'].userData.seatedQuat) {
                    const qTL = new THREE.Quaternion().setFromAxisAngle(axX, typeL);
                    this.bones['LeftHand'].quaternion.copy(this.bones['LeftHand'].userData.seatedQuat).multiply(qTL);
                }
                if (this.bones['RightHand'] && this.bones['RightHand'].userData.seatedQuat) {
                    const qTR = new THREE.Quaternion().setFromAxisAngle(axX, typeR);
                    this.bones['RightHand'].quaternion.copy(this.bones['RightHand'].userData.seatedQuat).multiply(qTR);
                }
                if (this.bones['RightForeArm'] && this.bones['RightForeArm'].userData.seatedQuat) {
                    this.bones['RightForeArm'].quaternion.slerp(this.bones['RightForeArm'].userData.seatedQuat, dt * 5.0);
                }
            } else {
                // Saat kandidat di depan meja: tangan merapat sopan dan tenang di atas meja
                const gentleBreathHand = Math.sin(this.idleTime * 1.7) * 0.008;
                if (this.bones['LeftHand'] && this.bones['LeftHand'].userData.seatedQuat) {
                    const qHL = new THREE.Quaternion().setFromAxisAngle(axX, gentleBreathHand);
                    this.bones['LeftHand'].quaternion.slerp(
                        this.bones['LeftHand'].userData.seatedQuat.clone().multiply(qHL),
                        dt * 5.0
                    );
                }
                if (this.bones['RightHand'] && this.bones['RightHand'].userData.seatedQuat) {
                    this.bones['RightHand'].quaternion.slerp(this.bones['RightHand'].userData.seatedQuat, dt * 5.0);
                }
                if (this.bones['RightForeArm'] && this.bones['RightForeArm'].userData.seatedQuat) {
                    this.bones['RightForeArm'].quaternion.slerp(this.bones['RightForeArm'].userData.seatedQuat, dt * 5.0);
                }
            }

            // =========================================================
            // 4. EKSPRESI WAJAH: KEDIPAN MATA ALAMI & LIP-SYNC BICARA
            // =========================================================
            this.blinkTimer -= dt;
            if (this.blinkTimer <= 0 && !this.isBlinking) {
                this.isBlinking = true;
                this.blinkPhase = 0;
                this.blinkTimer = 2.6 + Math.random() * 3.2;
            }

            let blinkVal = 0;
            if (this.isBlinking) {
                this.blinkPhase += dt * 18.0; // Kedipan cepat alami (~0.17 detik)
                if (this.blinkPhase <= Math.PI) {
                    blinkVal = Math.sin(this.blinkPhase);
                } else {
                    this.isBlinking = false;
                }
            }

            let mouthOpenVal = 0;
            if (isSpeaking) {
                const cadence = Math.sin(this.idleTime * 13.5) * 0.5 + Math.cos(this.idleTime * 8.2) * 0.5;
                mouthOpenVal = Math.max(0.04, cadence * 0.42);
            }

            if (this.bodyMesh && this.bodyMesh.morphTargetInfluences) {
                const influences = this.bodyMesh.morphTargetInfluences;
                const dict = this.bodyMesh.morphTargetDictionary;

                // Lip-sync mulut (Blendshape 0)
                influences[0] = THREE.MathUtils.lerp(influences[0] || 0, mouthOpenVal, 0.45);

                // Kedipan kelopak mata (eye_close)
                const eyeCloseIdx = (dict && dict['eye_close'] !== undefined) ? dict['eye_close'] : 22;
                if (influences.length > eyeCloseIdx) {
                    influences[eyeCloseIdx] = blinkVal;
                }
            }
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.MensetsuReceptionist.init());
    } else {
        window.MensetsuReceptionist.init();
    }
})();
