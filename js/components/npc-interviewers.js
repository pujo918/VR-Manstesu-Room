// =========================================================================
// SISTEM 3 NPC PEWAWANCARA & DIALOG AUDIO JEPANG (3 INTERVIEWER NPCS)
// Mensetsu VR Room - Natural Japanese Voice, Seated 3D Models & Game-Ready Anim
// Kiri: Tanaka-sensei (Pria Muda/Aktif, Jas Navy, Map Berkas)
// Tengah: Sato-sensei (Ketua Pewawancara Senior, Jas 3-Piece Charcoal, Kacamata, Pulpen & Hyoukahyou)
// Kanan: Suzuki-sensei (Pewawancara Wanita, Blazer Navy, Kemeja & Dasi Pita, Anting & Kacamata)
// Standar Kualitas: Desain Formal Akademis Jepang, Game-Ready Humanoid Rig, 0 Emoji
// =========================================================================

(function () {
    // Definisi Dialog Resmi Wawancara Akademis S2 Jepang (Skenario Quartet II & Sensei)
    const INTERVIEW_DIALOGS = {
        PERMIT_SIT: {
            speaker: '佐藤先生（面接官）',
            speakerNpcId: 'npc-center',
            gender: 'male_center',
            jp: 'どうぞ、お座りください。',
            displayJp: 'どうぞ、お座りください。',
            romaji: 'Douzo, osuwari kudasai.',
            id: 'Silakan duduk di kursi kandidat.',
            audioSrc: 'assets/audio/npc_permit_sit.mp3'
        },
        QUESTION_1: {
            speaker: '田中先生（面接官）',
            speakerNpcId: 'npc-left',
            gender: 'male_left',
            jp: 'それでは、面接を始めます。まず、大学院でこの研究を志望した理由を教えてください。',
            displayJp: 'それでは、面接を始めます。<br>まず、大学院でこの研究を志望した理由を教えてください。',
            romaji: 'Soredewa, mensetsu o hajimemasu. Mazu, daigakuin de kono kenkyuu o shibou shita riyuu o oshiete kudasai.',
            id: 'Baiklah, kita mulai wawancara. Pertama, tolong jelaskan alasan Anda memilih bidang riset ini di pascasarjana.',
            audioSrc: 'assets/audio/npc_question_1.mp3'
        },
        QUESTION_2: {
            speaker: '鈴木先生（面接官）',
            speakerNpcId: 'npc-right',
            gender: 'female_right',
            jp: 'ありがとうございます。次に、あなたの長所と、これまでに困難を乗り越えた具体的な経験について教えてください。',
            displayJp: 'ありがとうございます。<br>次に、あなたの長所と、これまでに困難を乗り越えた具体的な経験について教えてください。',
            romaji: 'Arigatou gozaimasu. Tsugi ni, anata no choushou to, kore made ni konnan o norikoeta gutaiteki na keiken ni tsuite oshiete kudasai.',
            id: 'Terima kasih. Selanjutnya, tolong jelaskan kelebihan diri Anda dan pengalaman konkret saat mengatasi kegagalan.',
            audioSrc: 'assets/audio/npc_question_2.mp3'
        },
        CLOSING: {
            speaker: '佐藤先生（面接官）',
            speakerNpcId: 'npc-center',
            gender: 'male_center',
            jp: '本日の面接は以上となります。結果は後日連絡いたします。お疲れ様でした。',
            displayJp: '本日の面接は以上となります。<br>結果は後日連絡いたします。お疲れ様でした。',
            romaji: 'Honjitsu no mensetsu wa ijou to narimasu. Kekka wa gojitsu renraku itashimasu. Otsukaresama deshita.',
            id: 'Wawancara hari ini selesai. Pengumuman hasil akan diinformasikan kemudian. Terima kasih atas kerja kerasnya.',
            audioSrc: 'assets/audio/npc_closing.mp3'
        }
    };

    // State Machine Wawancara Global
    window.MensetsuInterview = {
        currentStep: 'WAITING_ENTRY', // WAITING_ENTRY | PERMIT_SIT | QUESTION_1 | ANSWER_1 | QUESTION_2 | ANSWER_2 | CLOSING | FINISHED
        isNpcSpeaking: false,
        activeSpeakerId: null,
        isCandidateAnswering: false,
        currentAudio: null,

        init: function () {
            console.log('Sistem 3 NPC Pewawancara Diaktifkan.');
            this.createSubtitleOverlay();
            this.startProximityWatcher();
        },

        createSubtitleOverlay: function () {
            if (document.getElementById('npc-dialogue-overlay')) return;

            const box = document.createElement('div');
            box.id = 'npc-dialogue-overlay';
            box.innerHTML = `
                <div class="npc-sub-header">
                    <span class="npc-sub-speaker" id="npc-sub-speaker">佐藤先生（面接官）</span>
                </div>
                <div class="npc-sub-jp" id="npc-sub-jp"></div>
            `;
            document.body.appendChild(box);
        },

        showDialogue: function (dialogKey, callback) {
            const data = INTERVIEW_DIALOGS[dialogKey];
            if (!data) return;

            this.isNpcSpeaking = true;
            this.activeSpeakerId = data.speakerNpcId;

            const overlay = document.getElementById('npc-dialogue-overlay');
            const spk = document.getElementById('npc-sub-speaker');
            const jp = document.getElementById('npc-sub-jp');

            if (spk) spk.textContent = data.speaker;
            if (jp) jp.innerHTML = `「${data.displayJp || data.jp}」`;

            if (overlay) overlay.classList.add('active');

            // Suara Alami Asli Orang Jepang (Native Japanese Audio)
            this.speakJapanese(data, () => {
                this.isNpcSpeaking = false;
                this.activeSpeakerId = null;
                if (callback) callback();
            });
        },

        speakJapanese: function (data, onEnd) {
            // Hentikan audio sebelumnya jika sedang memutar
            if (this.currentAudio) {
                try {
                    this.currentAudio.pause();
                    this.currentAudio.currentTime = 0;
                } catch (e) {}
                this.currentAudio = null;
            }

            // 1. Prioritaskan pemutaran file audio asli orang Jepang (Studio Native Human Audio)
            if (data && data.audioSrc) {
                const audio = new Audio(data.audioSrc);
                this.currentAudio = audio;

                let hasEnded = false;
                const endHandler = () => {
                    if (hasEnded) return;
                    hasEnded = true;
                    this.currentAudio = null;
                    if (onEnd) onEnd();
                };

                audio.onended = endHandler;
                audio.onerror = (err) => {
                    console.warn('Gagal memuat file audio asli, fallback ke speechSynthesis:', data.audioSrc, err);
                    this.speakWithSpeechSynthesis(data.jp, data.gender, endHandler);
                };

                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        console.warn('Autoplay dicegah browser, fallback ke speechSynthesis:', err);
                        this.speakWithSpeechSynthesis(data.jp, data.gender, endHandler);
                    });
                }
                return;
            }

            this.speakWithSpeechSynthesis(typeof data === 'string' ? data : (data.jp || ''), data ? data.gender : null, onEnd);
        },

        speakWithSpeechSynthesis: function (text, genderType, onEnd) {
            if (!('speechSynthesis' in window)) {
                setTimeout(onEnd, 3000);
                return;
            }

            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';

            // Ambil daftar suara browser
            const voices = window.speechSynthesis.getVoices();
            const jaVoices = voices.filter(v => v.lang.startsWith('ja') || v.lang.includes('JP'));

            if (genderType === 'female_right') {
                // Suara Pewawancara Wanita (Halus, Sopan, Jelas)
                const femaleVoice = jaVoices.find(v => v.name.includes('Female') || v.name.includes('Kyoko') || v.name.includes('Nanami') || v.name.includes('Haruka') || v.name.includes('Google 日本語'));
                if (femaleVoice) utterance.voice = femaleVoice;
                utterance.pitch = 1.08;
                utterance.rate = 0.94;
            } else if (genderType === 'male_center') {
                // Suara Ketua Pewawancara (Berwibawa, Tenang, Nada Rendah)
                const maleVoice = jaVoices.find(v => v.name.includes('Male') || v.name.includes('Ichiro') || v.name.includes('Otoya') || v.name.includes('Keita'));
                if (maleVoice) utterance.voice = maleVoice;
                utterance.pitch = 0.85;
                utterance.rate = 0.90;
            } else {
                // Suara Pewawancara Pria Kiri (Artikulasi jernih, nada tengah)
                const maleVoice = jaVoices.find(v => v.name.includes('Male') || v.name.includes('Ichiro') || v.name.includes('Otoya'));
                if (maleVoice) utterance.voice = maleVoice;
                utterance.pitch = 0.96;
                utterance.rate = 0.93;
            }

            utterance.onend = () => { if (onEnd) onEnd(); };
            utterance.onerror = () => { if (onEnd) onEnd(); };

            window.speechSynthesis.speak(utterance);
        },

        // Pemantau Langkah & Jarak Kandidat
        startProximityWatcher: function () {
            const loop = setInterval(() => {
                const camera = document.getElementById('player-camera');
                if (!camera) return;

                const pos = camera.getAttribute('position');
                const isSitting = window.isSitting;

                // 1. Saat kandidat tiba di dekat meja/kursi wawancara (Z < 0.8) tapi belum duduk
                if (this.currentStep === 'WAITING_ENTRY' && pos.z < 0.8 && pos.z > -2.0 && !isSitting) {
                    this.currentStep = 'PERMIT_SIT';
                    window.dispatchEvent(new CustomEvent('mensetsu-npc-permit-sit'));

                    // Ketua NPC memberi instruksi "Douzo, osuwari kudasai"
                    this.showDialogue('PERMIT_SIT', () => {
                        if (typeof window.showActionToast === 'function') {
                            window.showActionToast('Silakan duduk di kursi kandidat.');
                        }
                    });
                }

                // 2. Saat kandidat telah duduk di kursi kandidat
                if ((this.currentStep === 'PERMIT_SIT' || this.currentStep === 'WAITING_ENTRY') && isSitting && window.currentSeat && window.currentSeat.id === 'candidate-chair') {
                    this.currentStep = 'QUESTION_1';
                    // Jeda sejenak 1.2 detik lalu Pewawancara Kiri bertanya
                    setTimeout(() => {
                        this.triggerQuestion1();
                    }, 1200);
                }

            }, 300);
        },

        triggerQuestion1: function () {
            this.showDialogue('QUESTION_1', () => {
                this.currentStep = 'ANSWER_1';
                this.showAnswerControls('Pertanyaan 1: Alasan minat riset pascasarjana', () => {
                    this.triggerQuestion2();
                });
            });
        },

        triggerQuestion2: function () {
            this.currentStep = 'QUESTION_2';
            // Pewawancara Wanita Kanan Bertanya
            this.showDialogue('QUESTION_2', () => {
                this.currentStep = 'ANSWER_2';
                this.showAnswerControls('Pertanyaan 2: Kelebihan diri dan pengalaman mengatasi kesulitan', () => {
                    this.triggerClosing();
                });
            });
        },

        triggerClosing: function () {
            this.currentStep = 'CLOSING';
            // Ketua Pewawancara Tengah Menutup Wawancara
            this.showDialogue('CLOSING', () => {
                this.currentStep = 'FINISHED';
                if (window.MannerEvaluation) {
                    window.MannerEvaluation.flags.interviewFinished = true;
                }

                setTimeout(() => {
                    const overlay = document.getElementById('npc-dialogue-overlay');
                    if (overlay) overlay.classList.remove('active');
                }, 3500);

                if (typeof window.showActionToast === 'function') {
                    window.showActionToast('Sesi wawancara selesai. Silakan berdiri dan lakukan ojigi perpisahan (Tombol A).');
                }
                window.dispatchEvent(new CustomEvent('mensetsu-prompt-ojigi'));

                // Kirim otomatis seluruh hasil ujian & audio ke Google Apps Script (Drive 5TB & Spreadsheet)
                if (window.MensetsuRecorder && typeof window.MensetsuRecorder.sendDataToGoogleCloud === 'function') {
                    window.MensetsuRecorder.sendDataToGoogleCloud();
                }
            });
        },

        showAnswerControls: function (label, onFinishedAnswer) {
            const qKey = this.currentStep === 'ANSWER_1' ? 'question1' : 'question2';
            this.currentAnswerCallback = onFinishedAnswer;
            this.currentQuestionKey = qKey;
            this.isWaitingForCandidateAnswer = true;

            // Beri tahu tombol Xbox B bahwa pewawancara sedang menunggu jawaban
            window.dispatchEvent(new CustomEvent('mensetsu-answer-prompt', { detail: { label: label, questionKey: qKey } }));

            if (typeof window.showActionToast === 'function') {
                window.showActionToast('🎙️ Giliran Menjawab: Tekan Tombol B (Mic) untuk mulai bicara.');
            }
        },

        finishCandidateAnswer: function () {
            if (!this.isWaitingForCandidateAnswer && !this.isCandidateAnswering) return;

            this.isCandidateAnswering = false;
            this.isWaitingForCandidateAnswer = false;

            window.dispatchEvent(new CustomEvent('mensetsu-answer-done'));
            if (typeof playAudioFeedback === 'function') playAudioFeedback('click');

            if (window.MensetsuRecorder && window.MensetsuRecorder.isRecording) {
                window.MensetsuRecorder.stopRecording();
            }

            if (this.currentAnswerCallback) {
                const cb = this.currentAnswerCallback;
                this.currentAnswerCallback = null;
                cb();
            }
        }
    };

    // =========================================================================
    // KOMPONEN 3D NPC PEWAWANCARA (SEATED 3D GLTF RIGGED HUMANOID)
    // Karakter:
    // Tanaka-sensei (Kiri): player_rpm.glb dalam Jas Navy Gelap, Rambut Hitam Rapi, Map Berkas
    // Sato-sensei (Tengah): player_rpm.glb dalam Jas Charcoal 3-Piece, Rambut Beruban, Kacamata, Pulpen & Hyoukahyou
    // Suzuki-sensei (Kanan): teacher_nanami.glb dalam Blazer Navy Wanita, Kacamata, Anting Mutiara, Notebook
    // Multi-Layer Animation: Breathing, Attention Tracking, Aizuchi, Note Taking, Speaking Gestures
    // =========================================================================
    AFRAME.registerComponent('npc-interviewer', {
        schema: {
            role: { type: 'string', default: 'center' }, // 'left' | 'center' | 'right'
            gender: { type: 'string', default: 'male' },  // 'male' | 'female'
            name: { type: 'string', default: 'Interviewer' }
        },

        init: function () {
            this.bones = {};
            this.morphMeshes = [];
            this.idleTime = Math.random() * 20;

            // State Animasi Game-Ready
            this.attentionMode = 'candidate'; // 'candidate' | 'desk' | 'colleague'
            this.attentionTimer = 2.0 + Math.random() * 4.0;
            this.targetHeadRot = { x: 0, y: 0, z: 0 };
            this.currentHeadRot = { x: 0, y: 0, z: 0 };

            // Anggukan Aizuchi khas Jepang
            this.nodCycle = 0;
            this.isNodding = false;
            this.nextNodTime = 3.5 + Math.random() * 4.0;

            // Fase Catat Pulpen (Sato-sensei)
            this.writingPhase = 0;

            // Fase Gestur Berbicara
            this.gesturePhase = 0;

            const isFemale = this.data.gender === 'female' || this.data.role === 'right';
            const isCenter = this.data.role === 'center';
            const isLeft = this.data.role === 'left';

            // Pilih Model 3D Berkualitas Tinggi
            const modelUrl = isFemale ? 'assets/teacher_nanami.glb' : 'assets/player_rpm.glb';

            const onModelReady = () => {
                this.model = this.el.getObject3D('mesh');
                if (!this.model) return;

                // Skala Model Berdasarkan Karakter
                if (isFemale) {
                    this.model.scale.set(1.03, 1.03, 1.03); // Proporsi proporsional dewasa sejajar dengan meja
                } else if (isCenter) {
                    this.model.scale.set(0.97, 0.97, 0.97); // Berwibawa senior ketua
                } else {
                    this.model.scale.set(0.96, 0.96, 0.96); // Proporsi pria eksekutif
                }

                // Koleksi Tulang Rangka & Mesh
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
                        }
                    }
                });

                // Kustomisasi Penampilan Karakter (Bahan PBR, Warna Jas & Rambut)
                this.setupCharacterStyling(isFemale, isCenter, isLeft);

                // Tambahkan Perlengkapan di Tangan & Meja (Pulpen, Kacamata, Map)
                this.setupAccessoriesAndProps(isFemale, isCenter, isLeft);

                // Terapkan Postur Duduk Alami & Ergonomis
                if (isFemale) {
                    this.poseSeatedNanami();
                } else {
                    this.poseSeatedRPM(isCenter, isLeft);
                }
            };

            this.el.addEventListener('model-loaded', onModelReady);
            if (this.el.getObject3D('mesh')) {
                onModelReady();
            } else {
                this.el.setAttribute('gltf-model', modelUrl);
            }
        },

        setupCharacterStyling: function (isFemale, isCenter, isLeft) {
            if (isFemale) {
                // Suzuki-sensei (teacher_nanami.glb):
                // Sudah memiliki jas blazer navy, kemeja putih, dasi pita merah, kacamata, anting mutiara
                this.model.traverse((child) => {
                    if (child.isMesh && child.material) {
                        child.material.roughness = 0.65;
                        child.material.metalness = 0.05;
                    }
                });
            } else if (isLeft) {
                // Tanaka-sensei: Jas formal navy gelap, rambut hitam alami, dasi navy
                this.model.traverse((child) => {
                    if (child.isMesh && child.material) {
                        if (child.name === 'Wolf3D_Outfit_Top') {
                            child.material = child.material.clone();
                            child.material.color.setHex(0x182436); // midnight navy formal suit
                            child.material.roughness = 0.65;
                            child.material.metalness = 0.05;
                        } else if (child.name === 'Wolf3D_Outfit_Bottom') {
                            child.material = child.material.clone();
                            child.material.color.setHex(0x182436);
                            child.material.roughness = 0.70;
                        } else if (child.name === 'Wolf3D_Hair') {
                            child.material = child.material.clone();
                            child.material.color.setHex(0x0a0c10); // natural Japanese deep black
                            child.material.roughness = 0.45;
                        }
                    }
                });
            } else if (isCenter) {
                // Sato-sensei: Jas 3-piece charcoal eksekutif, rambut beruban dignified (salt & pepper)
                this.model.traverse((child) => {
                    if (child.isMesh && child.material) {
                        if (child.name === 'Wolf3D_Hair') {
                            child.material = child.material.clone();
                            child.material.color.setHex(0x383e48); // dignified silver/gray tone
                            child.material.roughness = 0.50;
                        }
                    }
                });
            }
        },

        setupAccessoriesAndProps: function (isFemale, isCenter, isLeft) {
            if (isCenter) {
                // 1. Kacamata Titanium Baca Resmi untuk Sato-sensei
                if (this.bones['Head']) {
                    const glassesGroup = new THREE.Group();
                    const frameMat = new THREE.MeshStandardMaterial({
                        color: 0x334155,
                        metalness: 0.95,
                        roughness: 0.15
                    });

                    // Rim Kiri & Kanan
                    const rimGeo = new THREE.TorusGeometry(0.019, 0.0013, 12, 28);
                    const rimL = new THREE.Mesh(rimGeo, frameMat);
                    rimL.position.set(-0.034, 0.045, 0.088);
                    glassesGroup.add(rimL);

                    const rimR = new THREE.Mesh(rimGeo, frameMat);
                    rimR.position.set(0.034, 0.045, 0.088);
                    glassesGroup.add(rimR);

                    // Nose Bridge
                    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.0012, 0.0012, 0.020, 8), frameMat);
                    bridge.rotation.z = Math.PI / 2;
                    bridge.position.set(0, 0.048, 0.088);
                    glassesGroup.add(bridge);

                    // Gagang Kacamata ke Telinga
                    const armGeo = new THREE.CylinderGeometry(0.0010, 0.0010, 0.11, 8);
                    const armL = new THREE.Mesh(armGeo, frameMat);
                    armL.rotation.x = Math.PI / 2;
                    armL.position.set(-0.052, 0.045, 0.036);
                    glassesGroup.add(armL);

                    const armR = new THREE.Mesh(armGeo, frameMat);
                    armR.rotation.x = Math.PI / 2;
                    armR.position.set(0.052, 0.045, 0.036);
                    glassesGroup.add(armR);

                    this.bones['Head'].add(glassesGroup);
                }

                // 2. Pulpen Eksekutif (Digenggam Tangan Kanan Sato-sensei)
                if (this.bones['RightHand']) {
                    const penMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.2 });
                    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.14, 12), penMat);
                    // Pen diposisikan miring natural seperti sedang dipegang di antara jari telunjuk dan ibu jari
                    pen.rotation.set(Math.PI / 2.2, 0.20, Math.PI / 3.8);
                    pen.position.set(0.015, -0.012, 0.035);

                    // Klip emas pulpen
                    const goldClip = new THREE.Mesh(
                        new THREE.BoxGeometry(0.003, 0.035, 0.006),
                        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 })
                    );
                    goldClip.position.set(0.004, 0.02, 0);
                    pen.add(goldClip);

                    this.bones['RightHand'].add(pen);
                    this.penMesh = pen;
                }
            }
        },

        poseSeatedRPM: function (isCenter, isLeft) {
            const bones = this.bones;
            const axX = new THREE.Vector3(1, 0, 0);
            const axY = new THREE.Vector3(0, 1, 0);
            const axZ = new THREE.Vector3(0, 0, 1);

            // Tinggi panggul pas di atas dudukan kursi
            if (bones['Hips']) {
                bones['Hips'].position.set(0, 0.53, 0.00);
            }

            // Kaki duduk rapi maju masuk ke kolong meja
            if (bones['LeftUpLeg']) bones['LeftUpLeg'].quaternion.copy(bones['LeftUpLeg'].userData.restQuat).multiply(new THREE.Quaternion().setFromAxisAngle(axX, 1.48));
            if (bones['RightUpLeg']) bones['RightUpLeg'].quaternion.copy(bones['RightUpLeg'].userData.restQuat).multiply(new THREE.Quaternion().setFromAxisAngle(axX, 1.48));
            if (bones['LeftLeg']) bones['LeftLeg'].quaternion.copy(bones['LeftLeg'].userData.restQuat).multiply(new THREE.Quaternion().setFromAxisAngle(axX, -1.50));
            if (bones['RightLeg']) bones['RightLeg'].quaternion.copy(bones['RightLeg'].userData.restQuat).multiply(new THREE.Quaternion().setFromAxisAngle(axX, -1.50));

            // Postur tulang belakang tegap formal berwibawa
            if (bones['Spine']) {
                bones['Spine'].quaternion.copy(bones['Spine'].userData.restQuat).multiply(new THREE.Quaternion().setFromAxisAngle(axX, -0.03));
            }

            // Lengan atas menggantung wajar di samping torso, siku rapat di sisi badan
            const qArmL = new THREE.Quaternion()
                .setFromAxisAngle(axX, 0.54)
                .multiply(new THREE.Quaternion().setFromAxisAngle(axZ, 0.03))
                .multiply(new THREE.Quaternion().setFromAxisAngle(axY, 0.04));

            const qArmR = new THREE.Quaternion()
                .setFromAxisAngle(axX, 0.54)
                .multiply(new THREE.Quaternion().setFromAxisAngle(axZ, -0.03))
                .multiply(new THREE.Quaternion().setFromAxisAngle(axY, -0.04));

            if (bones['LeftArm']) {
                bones['LeftArm'].quaternion.copy(bones['LeftArm'].userData.restQuat).multiply(qArmL);
                bones['LeftArm'].userData.seatedQuat = bones['LeftArm'].quaternion.clone();
            }
            if (bones['RightArm']) {
                bones['RightArm'].quaternion.copy(bones['RightArm'].userData.restQuat).multiply(qArmR);
                bones['RightArm'].userData.seatedQuat = bones['RightArm'].quaternion.clone();
            }

            // Lengan bawah condong ke depan dan mengerucut lembut ke dalam (/ \) ke atas berkas
            // Pronasi lengan bawah merata di sepanjang tulang lengan bawah (+0.95 rad / -0.95 rad pada Y)
            const qForeL = new THREE.Quaternion()
                .setFromAxisAngle(axZ, 1.30)
                .multiply(new THREE.Quaternion().setFromAxisAngle(axY, 0.95))
                .multiply(new THREE.Quaternion().setFromAxisAngle(axX, -0.15));

            const qForeR = new THREE.Quaternion()
                .setFromAxisAngle(axZ, -1.30)
                .multiply(new THREE.Quaternion().setFromAxisAngle(axY, -0.95))
                .multiply(new THREE.Quaternion().setFromAxisAngle(axX, -0.15));

            if (bones['LeftForeArm']) {
                bones['LeftForeArm'].quaternion.copy(bones['LeftForeArm'].userData.restQuat).multiply(qForeL);
                bones['LeftForeArm'].userData.seatedQuat = bones['LeftForeArm'].quaternion.clone();
            }
            if (bones['RightForeArm']) {
                bones['RightForeArm'].quaternion.copy(bones['RightForeArm'].userData.restQuat).multiply(qForeR);
                bones['RightForeArm'].userData.seatedQuat = bones['RightForeArm'].quaternion.clone();
            }

            // Telapak tangan pronasi datar menapak sempurna di atas kertas / meja tanpa distorsi pergelangan
            const qHandL = new THREE.Quaternion()
                .setFromAxisAngle(axY, 0.25)
                .multiply(new THREE.Quaternion().setFromAxisAngle(axZ, -0.10))
                .multiply(new THREE.Quaternion().setFromAxisAngle(axX, -0.18));

            let qHandR;
            if (isCenter) {
                // Sato-sensei: tangan kanan memegang pulpen dengan posisi resting di lembar evaluasi
                qHandR = new THREE.Quaternion()
                    .setFromAxisAngle(axY, -0.15)
                    .multiply(new THREE.Quaternion().setFromAxisAngle(axZ, 0.14))
                    .multiply(new THREE.Quaternion().setFromAxisAngle(axX, -0.16));

                if (this.penMesh) {
                    this.penMesh.position.set(0.015, -0.010, 0.032);
                    this.penMesh.rotation.set(Math.PI / 2.3, 0.12, Math.PI / 4.5);
                }
            } else {
                // Tanaka-sensei: tangan kanan menapak datar simetris di atas clipboard
                qHandR = new THREE.Quaternion()
                    .setFromAxisAngle(axY, -0.25)
                    .multiply(new THREE.Quaternion().setFromAxisAngle(axZ, 0.10))
                    .multiply(new THREE.Quaternion().setFromAxisAngle(axX, -0.18));
            }

            if (bones['LeftHand']) {
                bones['LeftHand'].quaternion.copy(bones['LeftHand'].userData.restQuat).multiply(qHandL);
                bones['LeftHand'].userData.seatedQuat = bones['LeftHand'].quaternion.clone();
            }
            if (bones['RightHand']) {
                bones['RightHand'].quaternion.copy(bones['RightHand'].userData.restQuat).multiply(qHandR);
                bones['RightHand'].userData.seatedQuat = bones['RightHand'].quaternion.clone();
            }

            // Pertahankan jari-jemari alami model 3D asli yang rileks dan merapat (postur formal 揃える - soroeru)
            const fingers = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];
            ['Left', 'Right'].forEach((side) => {
                fingers.forEach((finger) => {
                    for (let k = 1; k <= 4; k++) {
                        const bName = `${side}Hand${finger}${k}`;
                        const b = bones[bName];
                        if (b && b.userData.restQuat) {
                            b.quaternion.copy(b.userData.restQuat);
                        }
                    }
                });
            });

            // Kepala menoleh dengan tatapan fokus dan ramah ke arah kandidat
            if (bones['Head']) {
                const pitchQ = new THREE.Quaternion().setFromAxisAngle(axX, -0.02);
                const yawAngle = isCenter ? 0 : 0.16;
                const yawQ = new THREE.Quaternion().setFromAxisAngle(axY, -yawAngle);
                bones['Head'].quaternion.copy(bones['Head'].userData.restQuat).multiply(pitchQ).multiply(yawQ);
                bones['Head'].userData.baseQuat = bones['Head'].quaternion.clone();
            }
        },

        poseSeatedNanami: function () {
            const bones = this.bones;
            const axX = new THREE.Vector3(1, 0, 0);
            const axY = new THREE.Vector3(0, 1, 0);
            const axZ = new THREE.Vector3(0, 0, 1);

            // Nanami duduk anggun di bantalan kursi, bersandar rapi di sandaran kursi bebas tabrakan dari meja
            if (bones['Hips']) {
                bones['Hips'].position.set(0, 0.51, -0.15);
            }

            if (bones['LeftUpLeg']) bones['LeftUpLeg'].quaternion.copy(bones['LeftUpLeg'].userData.restQuat).multiply(new THREE.Quaternion().setFromAxisAngle(axX, -1.57));
            if (bones['RightUpLeg']) bones['RightUpLeg'].quaternion.copy(bones['RightUpLeg'].userData.restQuat).multiply(new THREE.Quaternion().setFromAxisAngle(axX, -1.57));
            if (bones['LeftLeg']) bones['LeftLeg'].quaternion.copy(bones['LeftLeg'].userData.restQuat).multiply(new THREE.Quaternion().setFromAxisAngle(axX, 1.57));
            if (bones['RightLeg']) bones['RightLeg'].quaternion.copy(bones['RightLeg'].userData.restQuat).multiply(new THREE.Quaternion().setFromAxisAngle(axX, 1.57));

            // Tulang belakang tegak rapi (kashikomatte-iru formal wanita Jepang)
            if (bones['Spine']) {
                bones['Spine'].quaternion.copy(bones['Spine'].userData.restQuat);
            }

            // Lengan atas menggantung anggun di samping torso (tanpa flare melebar)
            const dropL = new THREE.Quaternion()
                .setFromAxisAngle(axZ, 0.08)
                .multiply(new THREE.Quaternion().setFromAxisAngle(axX, 0.52))
                .multiply(new THREE.Quaternion().setFromAxisAngle(axY, -0.06));

            const dropR = new THREE.Quaternion()
                .setFromAxisAngle(axZ, -0.08)
                .multiply(new THREE.Quaternion().setFromAxisAngle(axX, 0.52))
                .multiply(new THREE.Quaternion().setFromAxisAngle(axY, 0.06));

            if (bones['LeftArm']) {
                bones['LeftArm'].quaternion.copy(bones['LeftArm'].userData.restQuat).multiply(dropL);
                bones['LeftArm'].userData.seatedQuat = bones['LeftArm'].quaternion.clone();
            }
            if (bones['RightArm']) {
                bones['RightArm'].quaternion.copy(bones['RightArm'].userData.restQuat).multiply(dropR);
                bones['RightArm'].userData.seatedQuat = bones['RightArm'].quaternion.clone();
            }

            // Lengan bawah mendatar ke depan, mengerucut lembut ke atas clipboard
            const bendL = new THREE.Quaternion()
                .setFromAxisAngle(axX, 1.05)
                .multiply(new THREE.Quaternion().setFromAxisAngle(axZ, -0.28))
                .multiply(new THREE.Quaternion().setFromAxisAngle(axY, 0.18));

            const bendR = new THREE.Quaternion()
                .setFromAxisAngle(axX, 1.05)
                .multiply(new THREE.Quaternion().setFromAxisAngle(axZ, 0.28))
                .multiply(new THREE.Quaternion().setFromAxisAngle(axY, -0.18));

            if (bones['LeftForeArm']) {
                bones['LeftForeArm'].quaternion.copy(bones['LeftForeArm'].userData.restQuat).multiply(bendL);
                bones['LeftForeArm'].userData.seatedQuat = bones['LeftForeArm'].quaternion.clone();
            }
            if (bones['RightForeArm']) {
                bones['RightForeArm'].quaternion.copy(bones['RightForeArm'].userData.restQuat).multiply(bendR);
                bones['RightForeArm'].userData.seatedQuat = bones['RightForeArm'].quaternion.clone();
            }

            // Pergelangan tangan menapak santai dan datar di atas clipboard
            const qHandNanamiL = new THREE.Quaternion()
                .setFromAxisAngle(axX, -0.12)
                .multiply(new THREE.Quaternion().setFromAxisAngle(axZ, -0.08));

            const qHandNanamiR = new THREE.Quaternion()
                .setFromAxisAngle(axX, -0.12)
                .multiply(new THREE.Quaternion().setFromAxisAngle(axZ, 0.08));

            if (bones['LeftHand']) {
                bones['LeftHand'].quaternion.copy(bones['LeftHand'].userData.restQuat).multiply(qHandNanamiL);
                bones['LeftHand'].userData.seatedQuat = bones['LeftHand'].quaternion.clone();
            }
            if (bones['RightHand']) {
                bones['RightHand'].quaternion.copy(bones['RightHand'].userData.restQuat).multiply(qHandNanamiR);
                bones['RightHand'].userData.seatedQuat = bones['RightHand'].quaternion.clone();
            }

            // Kepala menatap kandidat dengan ramah dan fokus
            if (bones['Head']) {
                const pitchQ = new THREE.Quaternion().setFromAxisAngle(axX, -0.01);
                const yawQ = new THREE.Quaternion().setFromAxisAngle(axY, 0.12);
                bones['Head'].quaternion.copy(bones['Head'].userData.restQuat).multiply(pitchQ).multiply(yawQ);
                bones['Head'].userData.baseQuat = bones['Head'].quaternion.clone();
            }
        },

        tick: function (time, delta) {
            if (!this.bones['Head'] || !this.bones['Head'].userData.baseQuat) return;

            const dt = Math.min((delta || 16) / 1000, 0.1);
            this.idleTime += dt;

            const isCenter = this.data.role === 'center';
            const isLeft = this.data.role === 'left';
            const isRight = this.data.role === 'right';
            const isSpeaking = window.MensetsuInterview && 
                               window.MensetsuInterview.isNpcSpeaking && 
                               window.MensetsuInterview.activeSpeakerId === this.el.id;
            const isCandidateAnswering = window.MensetsuInterview && window.MensetsuInterview.isCandidateAnswering;

            // =========================================================
            // LAYER 1: PERNAPASAN MULTI-FREKUENSI ALAMI (BREATHING RIG)
            // =========================================================
            const breathChest = Math.sin(this.idleTime * 1.5) * 0.012 + Math.sin(this.idleTime * 3.1) * 0.003;
            if (this.bones['Spine1']) {
                this.bones['Spine1'].rotation.x = breathChest;
            }
            if (this.bones['Spine2']) {
                this.bones['Spine2'].rotation.x = breathChest * 0.7;
            }

            // =========================================================
            // LAYER 2: PENJEJAKAN PANDANGAN MATA & KEPALA (ATTENTION FSM)
            // =========================================================
            this.attentionTimer -= dt;
            if (this.attentionTimer <= 0) {
                if (isSpeaking) {
                    this.attentionMode = 'candidate';
                    this.attentionTimer = 3.5 + Math.random() * 3.0;
                } else if (isCandidateAnswering) {
                    // Saat kandidat menjawab: Sato fokus mencatat, Tanaka & Suzuki fokus menyimak
                    if (isCenter) {
                        this.attentionMode = Math.random() < 0.65 ? 'desk' : 'candidate';
                    } else {
                        this.attentionMode = 'candidate';
                    }
                    this.attentionTimer = 3.0 + Math.random() * 4.0;
                } else {
                    const roll = Math.random();
                    if (roll < 0.70) {
                        this.attentionMode = 'candidate'; // 70% menatap kandidat dengan serius
                        this.attentionTimer = 4.0 + Math.random() * 4.0;
                    } else if (roll < 0.90) {
                        this.attentionMode = 'desk';      // 20% melihat berkas di meja
                        this.attentionTimer = 2.0 + Math.random() * 3.0;
                    } else {
                        this.attentionMode = 'colleague'; // 10% melirik rekan pewawancara
                        this.attentionTimer = 1.5 + Math.random() * 2.0;
                    }
                }
            }

            let targetPitch = 0;
            let targetYaw = 0;

            if (this.attentionMode === 'desk') {
                targetPitch = -0.12; // Menunduk wajar membaca berkas / mencatat
            } else if (this.attentionMode === 'colleague') {
                targetPitch = -0.04;
                targetYaw = isLeft ? -0.28 : (isRight ? 0.28 : (Math.random() > 0.5 ? 0.25 : -0.25));
            }

            // =========================================================
            // LAYER 3: ANGGUKAN AKTIF MENYIMAK JEPANG (AIZUCHI NODDING)
            // =========================================================
            this.nextNodTime -= dt;
            if (this.nextNodTime <= 0 && !this.isNodding) {
                this.isNodding = true;
                this.nodCycle = 0;
                this.nextNodTime = isCenter ? (3.5 + Math.random() * 3.5) : (4.5 + Math.random() * 5.0);
            }

            let nodOffset = 0;
            if (this.isNodding) {
                this.nodCycle += dt * 3.4; // Durasi anggukan ~0.9 detik
                if (this.nodCycle <= Math.PI * 2) {
                    nodOffset = -Math.sin(this.nodCycle) * 0.10;
                } else {
                    this.isNodding = false;
                }
            }

            // =========================================================
            // LAYER 4: ANIMASI BERBICARA, GESTUR TANGAN & MENCATAT
            // =========================================================
            let speakPitch = 0;
            let speakYaw = 0;
            let mouthVal = 0;

            if (isSpeaking) {
                const spkCadence = Math.sin(this.idleTime * 12.0);
                mouthVal = Math.max(0, spkCadence) * 0.40;
                speakPitch = Math.sin(this.idleTime * 4.0) * 0.025;
                speakYaw = Math.cos(this.idleTime * 2.8) * 0.02;

                this.gesturePhase += dt * 2.8;

                // Gestur tangan berbicara yang elegan & formal
                if (this.bones['RightForeArm'] && this.bones['RightForeArm'].userData.seatedQuat) {
                    const liftAngle = Math.sin(this.gesturePhase) * 0.06 - 0.04;
                    const liftQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), liftAngle);
                    this.bones['RightForeArm'].quaternion.copy(this.bones['RightForeArm'].userData.seatedQuat).multiply(liftQ);
                }
            } else {
                mouthVal = 0.0;

                if (isCenter) {
                    // SATO-SENSEI (KETUA): MENULIS DENGAN PULPEN DI ATAS LEMBAR EVALUASI
                    if (isCandidateAnswering || this.attentionMode === 'desk') {
                        this.writingPhase += dt * 6.5;
                        if (this.bones['RightHand'] && this.bones['RightHand'].userData.seatedQuat) {
                            // Gerakan pergelangan tangan menulis kanji / mencatat nilai
                            const writeX = Math.sin(this.writingPhase) * 0.025 + Math.sin(this.writingPhase * 2.2) * 0.010;
                            const writeY = Math.cos(this.writingPhase * 0.8) * 0.020;
                            const writeZ = Math.sin(this.writingPhase * 0.5) * 0.015;
                            const writeQ = new THREE.Quaternion()
                                .setFromAxisAngle(new THREE.Vector3(1, 0, 0), writeX)
                                .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), writeY))
                                .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), writeZ));
                            this.bones['RightHand'].quaternion.copy(this.bones['RightHand'].userData.seatedQuat).multiply(writeQ);
                        }
                        if (this.bones['RightForeArm'] && this.bones['RightForeArm'].userData.seatedQuat) {
                            const armDrift = Math.sin(this.writingPhase * 0.35) * 0.025;
                            const armQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), armDrift);
                            this.bones['RightForeArm'].quaternion.copy(this.bones['RightForeArm'].userData.seatedQuat).multiply(armQ);
                        }
                    } else {
                        // Micro-movement saat idle: mengetuk pulpen halus & menyesuaikan jari
                        const tapCycle = Math.sin(this.idleTime * 1.6);
                        const tapWrist = tapCycle > 0.75 ? (tapCycle - 0.75) * 0.04 : 0;
                        if (this.bones['RightHand'] && this.bones['RightHand'].userData.seatedQuat) {
                            const idleQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), tapWrist);
                            this.bones['RightHand'].quaternion.copy(this.bones['RightHand'].userData.seatedQuat).multiply(idleQ);
                        }
                        if (this.bones['RightForeArm'] && this.bones['RightForeArm'].userData.seatedQuat) {
                            this.bones['RightForeArm'].quaternion.slerp(this.bones['RightForeArm'].userData.seatedQuat, dt * 4.0);
                        }
                    }
                } else if (isLeft) {
                    // TANAKA-SENSEI (KIRI): MICRO-MOVEMENT TANGAN DI ATAS MAP BERKAS
                    const handSway = Math.sin(this.idleTime * 1.3) * 0.015;
                    if (this.bones['LeftHand'] && this.bones['LeftHand'].userData.seatedQuat) {
                        const qSway = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), handSway);
                        this.bones['LeftHand'].quaternion.copy(this.bones['LeftHand'].userData.seatedQuat).multiply(qSway);
                    }
                    if (this.bones['RightHand'] && this.bones['RightHand'].userData.seatedQuat) {
                        const fingerTap = Math.sin(this.idleTime * 2.4) * 0.012;
                        const qTap = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), fingerTap);
                        this.bones['RightHand'].quaternion.copy(this.bones['RightHand'].userData.seatedQuat).multiply(qTap);
                    }
                } else if (isRight) {
                    // SUZUKI-SENSEI (KANAN): MICRO-MOVEMENT TANGAN DI ATAS NOTEBOOK
                    const noteShift = Math.sin(this.idleTime * 1.4) * 0.012;
                    if (this.bones['RightHand'] && this.bones['RightHand'].userData.seatedQuat) {
                        const qShift = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), noteShift);
                        this.bones['RightHand'].quaternion.copy(this.bones['RightHand'].userData.seatedQuat).multiply(qShift);
                    }
                }
            }

            // Terapkan Morph Target Mulut (Bicara Natural)
            if (this.morphMeshes.length > 0) {
                for (let i = 0; i < this.morphMeshes.length; i++) {
                    const mesh = this.morphMeshes[i];
                    if (mesh.name && mesh.name.toLowerCase().includes('eye')) continue;
                    if (mesh.morphTargetInfluences) {
                        // Blendshape 0 (mouthOpen)
                        mesh.morphTargetInfluences[0] = THREE.MathUtils.lerp(mesh.morphTargetInfluences[0] || 0, mouthVal, 0.45);
                    }
                }
            }

            // Interpolasi Halus Rotasi Kepala (Damped Smooth Easing)
            const finalPitch = targetPitch + nodOffset + speakPitch;
            const finalYaw = targetYaw + speakYaw;

            this.currentHeadRot.x = THREE.MathUtils.lerp(this.currentHeadRot.x, finalPitch, dt * 4.5);
            this.currentHeadRot.y = THREE.MathUtils.lerp(this.currentHeadRot.y, finalYaw, dt * 4.5);

            const qHeadPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.currentHeadRot.x);
            const qHeadYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.currentHeadRot.y);

            this.bones['Head'].quaternion.copy(this.bones['Head'].userData.baseQuat)
                .multiply(qHeadPitch)
                .multiply(qHeadYaw);
        }
    });

    // Auto-init saat DOM siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.MensetsuInterview.init());
    } else {
        window.MensetsuInterview.init();
    }
})();
