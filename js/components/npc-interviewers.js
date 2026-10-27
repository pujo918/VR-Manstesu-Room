// =========================================================================
// SISTEM 3 NPC PEWAWANCARA & DIALOG AUDIO JEPANG (3 INTERVIEWER NPCS)
// Mensetsu VR Room - Natural Japanese Voice, Seated 3D Models & Game-Ready Anim
// Kiri: Tanaka-sensei (Pria Muda/Aktif, Jas Navy, Map Berkas)
// Tengah: Sato-sensei (Ketua Pewawancara Senior, Jas 3-Piece Charcoal, Kacamata, Pulpen & Hyoukahyou)
// Kanan: Suzuki-sensei (Pewawancara Wanita, Blazer Navy, Kemeja & Dasi Pita, Anting & Kacamata)
// Standar Kualitas: Desain Formal Akademis Jepang, Game-Ready Humanoid Rig, 0 Emoji
// =========================================================================

(function () {
    // Definisi Dialog Resmi Wawancara Akademis & Studi Jepang
    const INTERVIEW_DIALOGS = {
        PERMIT_SIT: {
            speaker: '佐藤先生（面接官）',
            speakerNpcId: 'npc-center',
            gender: 'male_center',
            jp: '失礼します。どうぞおかけください。まずは簡単に自己紹介をお願いします。',
            displayJp: '失礼します。どうぞおかけください。<br>まずは簡単に自己紹介をお願いします。',
            audioSrc: 'assets/audio/npc_permit_sit.mp3'
        },
        QUESTION_1: {
            speaker: '田中先生（面接官）',
            speakerNpcId: 'npc-left',
            gender: 'male_left',
            jp: 'ありがとうございます。数ある国の中で、なぜ日本へ留学しようと思ったのですか？',
            displayJp: 'ありがとうございます。<br>数ある国の中で、なぜ日本へ留学しようと思ったのですか？',
            audioSrc: 'assets/audio/npc_q1_ryuugaku.mp3'
        },
        QUESTION_2: {
            speaker: '鈴木先生（面接官）',
            speakerNpcId: 'npc-right',
            gender: 'female_right',
            jp: 'では、数ある大学の中で、なぜ本校を志望しましたか？',
            displayJp: 'では、数ある大学の中で、<br>なぜ本校を志望しましたか？',
            audioSrc: 'assets/audio/npc_q2_shibou.mp3'
        },
        QUESTION_3: {
            speaker: '田中先生（面接官）',
            speakerNpcId: 'npc-left',
            gender: 'male_left',
            jp: '本校のことを、どのようにして知りましたか？',
            displayJp: '本校のことを、どのようにして知りましたか？',
            audioSrc: 'assets/audio/npc_q3_jouhou.mp3'
        },
        QUESTION_4: {
            speaker: '鈴木先生（面接官）',
            speakerNpcId: 'npc-right',
            gender: 'female_right',
            jp: 'それでは、あなたの長所について教えてください。',
            displayJp: 'それでは、あなたの長所について教えてください。',
            audioSrc: 'assets/audio/npc_q4_chousho.mp3'
        },
        QUESTION_5: {
            speaker: '佐藤先生（面接官）',
            speakerNpcId: 'npc-center',
            gender: 'male_center',
            jp: 'ご自身の短所は何だと思いますか？また、それをどのように克服しようと心がけていますか？',
            displayJp: 'ご自身の短所は何だと思いますか？<br>また、それをどのように克服しようと心がけていますか？',
            audioSrc: 'assets/audio/npc_q5_tansho.mp3'
        },
        CLOSING: {
            speaker: '佐藤先生（面接官）',
            speakerNpcId: 'npc-center',
            gender: 'male_center',
            jp: '本日の面接は以上となります。結果は後日連絡いたします。どうぞお気をつけてお帰りください。',
            displayJp: '本日の面接は以上となります。<br>結果は後日連絡いたします。どうぞお気をつけてお帰りください。',
            audioSrc: 'assets/audio/npc_closing.mp3'
        }
    };

    // State Machine Wawancara Global
    window.MensetsuInterview = {
        currentStep: 'WAITING_ENTRY', // WAITING_ENTRY | PERMIT_SIT | ANSWER_INTRO | QUESTION_1 | ANSWER_1 | ... | CLOSING | FINISHED
        isNpcSpeaking: false,
        activeSpeakerId: null,
        activeDialogKey: null,
        isCandidateAnswering: false,
        currentAudio: null,
        bowTriggerTime: 0,
        lastQuestionEndTime: 0,

        bubbleMesh: null,
        bubbleCanvas: null,
        bubbleCtx: null,
        bubbleTexture: null,
        bubbleTargetNpcId: null,
        bubbleVisible: false,
        bubblePopTime: 0,
        bubbleChunkTimers: [],
        _bubbleTickerStarted: false,

        init: function () {
            console.log('Sistem 3 NPC Pewawancara & 3D Speech Bubble Diaktifkan.');
            this.createSubtitleOverlay();
            this.ensure3DSpeechBubble();
            this.startProximityWatcher();
        },

        createSubtitleOverlay: function () {
            if (document.getElementById('npc-dialogue-overlay')) return;

            // Elemen dummy tersembunyi untuk kompatibilitas pemicu penutupan dialog
            const box = document.createElement('div');
            box.id = 'npc-dialogue-overlay';
            box.style.display = 'none';
            box.innerHTML = `
                <div class="npc-sub-pane npc-sub-pane-left">
                    <div class="npc-sub-header"><span class="npc-sub-speaker" id="npc-sub-speaker"></span></div>
                    <div class="npc-sub-jp" id="npc-sub-jp"></div>
                </div>
            `;
            document.body.appendChild(box);

            // Jika ada komponen yang memanggil overlay.classList.remove('active'), otomatis sembunyikan balon 3D
            const origRemove = box.classList.remove.bind(box.classList);
            box.classList.remove = (...args) => {
                origRemove(...args);
                if (args.includes('active')) {
                    this.hideSubtitleBubble();
                }
            };
        },

        ensure3DSpeechBubble: function () {
            const scene = document.querySelector('a-scene');
            if (!scene || !scene.object3D || typeof THREE === 'undefined') return null;

            if (!this.bubbleCanvas) {
                this.bubbleCanvas = document.createElement('canvas');
                this.bubbleCanvas.width = 1024;
                this.bubbleCanvas.height = 512;
                this.bubbleCtx = this.bubbleCanvas.getContext('2d');

                this.bubbleTexture = new THREE.CanvasTexture(this.bubbleCanvas);
                this.bubbleTexture.minFilter = THREE.LinearFilter;
                this.bubbleTexture.magFilter = THREE.LinearFilter;
                this.bubbleTexture.needsUpdate = true;

                // Geometri bidang balon dengan titik jangkar (origin Y=0) tepat di ujung lancip ekor balon bawah
                const geo = new THREE.PlaneGeometry(1.52, 0.76);
                geo.translate(0, 0.38, 0);

                const mat = new THREE.MeshBasicMaterial({
                    map: this.bubbleTexture,
                    transparent: true,
                    depthTest: false,
                    depthWrite: false,
                    side: THREE.DoubleSide
                });

                this.bubbleMesh = new THREE.Mesh(geo, mat);
                this.bubbleMesh.renderOrder = 9999;
                this.bubbleMesh.visible = false;
                this.bubbleMesh.frustumCulled = false;
                scene.object3D.add(this.bubbleMesh);
            } else if (this.bubbleMesh && !this.bubbleMesh.parent) {
                scene.object3D.add(this.bubbleMesh);
            }

            if (!this._bubbleTickerStarted) {
                this._bubbleTickerStarted = true;
                this.startBubbleFollowTicker();
            }

            return this.bubbleMesh;
        },

        getNpcHeadWorldPosition: function (npcId, outVec) {
            const el = document.getElementById(npcId);
            if (el && el.components) {
                const comp = el.components['npc-interviewer'] || el.components['npc-receptionist'];
                if (comp && comp.bones && comp.bones['Head']) {
                    comp.bones['Head'].getWorldPosition(outVec);
                    outVec.y += 0.21; // Tepat di atas puncak rambut/kepala NPC
                    return outVec;
                }
                if (el.object3D) {
                    el.object3D.getWorldPosition(outVec);
                    outVec.y += 1.38;
                    return outVec;
                }
            }
            if (npcId === 'npc-left') return outVec.set(-1.3, 1.38, -4.02);
            if (npcId === 'npc-right') return outVec.set(1.3, 1.36, -4.02);
            if (npcId === 'npc-receptionist') return outVec.set(2.96, 1.52, 10.50);
            return outVec.set(0.0, 1.40, -4.02);
        },

        startBubbleFollowTicker: function () {
            const headPos = new THREE.Vector3();
            const camPos = new THREE.Vector3();

            const updateLoop = () => {
                requestAnimationFrame(updateLoop);
                if (!this.bubbleMesh || !this.bubbleVisible || !this.bubbleTargetNpcId) return;

                const camEl = document.getElementById('player-camera');
                if (!camEl || !camEl.object3D) return;

                this.getNpcHeadWorldPosition(this.bubbleTargetNpcId, headPos);
                camEl.object3D.getWorldPosition(camPos);

                // Sembunyikan otomatis jika pemain berada di ruangan berbeda (terhalang tembok Z=6.0) atau terlalu jauh
                const dist = camPos.distanceTo(headPos);
                const isPlayerInWaitingRoom = camPos.z > 6.05;
                const isNpcInWaitingRoom = headPos.z > 6.05;
                if (dist > 11.5 || (isPlayerInWaitingRoom !== isNpcInWaitingRoom && !window.isDoorOpen)) {
                    this.bubbleMesh.visible = false;
                    return;
                }
                this.bubbleMesh.visible = true;

                // Posisikan ujung ekor balon komik tepat di atas kepala NPC yang sedang bicara
                this.bubbleMesh.position.copy(headPos);

                // Auto-billboard: selalu menghadap lurus ke arah kamera pemain
                this.bubbleMesh.lookAt(camPos.x, headPos.y + 0.12, camPos.z);

                // Animasi pop-in elastis + skala adaptif yang lebih besar agar teks sangat jelas terbaca
                const elapsed = Math.min(1, (performance.now() - this.bubblePopTime) / 180);
                const popEase = 0.25 + 0.75 * (1 - Math.pow(1 - elapsed, 3));
                const distScale = THREE.MathUtils.clamp(dist * 0.36, 0.72, 2.20);
                const finalScale = distScale * popEase;
                this.bubbleMesh.scale.set(finalScale, finalScale, finalScale);
            };
            requestAnimationFrame(updateLoop);
        },

        // Memecah kalimat panjang Jepang menjadi potongan kalimat pendek (chunks) agar ditampilkan berkala dengan huruf besar
        splitIntoProgressiveChunks: function (rawHtml) {
            let clean = String(rawHtml || '')
                .replace(/<br\s*\/?>/gi, ' ')
                .replace(/^[「\s]+|[」\s]+$/g, '')
                .trim();

            if (!clean) return ['...'];

            // 1. Pisahkan berdasarkan akhir kalimat Jepang (。 ？ ！)
            const rawSentences = clean.match(/[^。？！]+[。？！]?/g) || [clean];
            const chunks = [];

            rawSentences.forEach((sent) => {
                const s = sent.trim();
                if (!s) return;

                // Jika kalimat pendek (<= 22 karakter), tampilkan utuh sebagai 1 tahap
                if (s.length <= 22) {
                    // Gabungkan sapaan super pendek (<= 9 huruf, misal "失礼します。") dengan klausa pendek berikutnya bila muat
                    if (chunks.length > 0 && chunks[chunks.length - 1].length + s.length <= 20) {
                        chunks[chunks.length - 1] += s;
                    } else {
                        chunks.push(s);
                    }
                    return;
                }

                // 2. Jika kalimat agak panjang (> 22 karakter), pecah secara alami pada tanda koma Jepang (、)
                const subClauses = s.split(/(?<=、)/);
                let buffer = '';
                subClauses.forEach((clause) => {
                    const c = clause.trim();
                    if (!c) return;
                    if ((buffer + c).length <= 22) {
                        buffer += c;
                    } else {
                        if (buffer) chunks.push(buffer);
                        // Jika klausa tunggal masih > 26 karakter tanpa koma, bagi dua di tengah
                        if (c.length > 26) {
                            const mid = Math.ceil(c.length / 2);
                            chunks.push(c.slice(0, mid));
                            buffer = c.slice(mid);
                        } else {
                            buffer = c;
                        }
                    }
                });
                if (buffer) chunks.push(buffer);
            });

            return chunks.length > 0 ? chunks : [clean];
        },

        clearBubbleChunkTimers: function () {
            if (this.bubbleChunkTimers && this.bubbleChunkTimers.length > 0) {
                this.bubbleChunkTimers.forEach((t) => clearTimeout(t));
                this.bubbleChunkTimers = [];
            }
        },

        drawComicSpeechBubble: function (speakerText, chunkText, npcId, chunkIdx, totalChunks) {
            this.ensure3DSpeechBubble();
            if (!this.bubbleCtx || !this.bubbleCanvas) return;

            const ctx = this.bubbleCtx;
            const W = this.bubbleCanvas.width;
            const H = this.bubbleCanvas.height;
            ctx.clearRect(0, 0, W, H);

            // Tema warna identitas per NPC agar mudah dibedakan siapa yang berbicara
            let accentColor = '#0284c7'; // Sato-sensei (Tengah - Biru Utama)
            if (npcId === 'npc-left') accentColor = '#0d9488'; // Tanaka-sensei (Kiri - Teal)
            else if (npcId === 'npc-right') accentColor = '#be185d'; // Suzuki-sensei (Kanan - Rose/Burgundy)
            else if (npcId === 'npc-receptionist') accentColor = '#2563eb'; // Resepsionis (Biru Royal)

            const displayStr = `「${String(chunkText || '').replace(/^[「]+|[」]+$/g, '')}」`;

            // Ukuran font jauh lebih besar (52px - 58px) karena teks ditampilkan bertahap per kalimat pendek
            const fontSize = displayStr.length <= 14 ? 58 : 52;
            const fontMain = `bold ${fontSize}px "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", "Noto Sans JP", sans-serif`;
            ctx.font = fontMain;

            const maxTextWidth = W - 150;
            const lines = [];
            let currentLine = '';
            for (let i = 0; i < displayStr.length; i++) {
                const ch = displayStr[i];
                const testLine = currentLine + ch;
                if (ctx.measureText(testLine).width > maxTextWidth && currentLine.length > 0) {
                    lines.push(currentLine);
                    currentLine = ch;
                } else {
                    currentLine = testLine;
                }
            }
            if (currentLine) lines.push(currentLine);
            if (lines.length === 0) lines.push('...');

            const lineHeight = fontSize + 18;
            const textBlockH = lines.length * lineHeight;
            const tailH = 44;
            const tailTipY = H - 8;
            const boxBottom = tailTipY - tailH;
            const boxH = Math.min(H - 56, Math.max(230, textBlockH + 132));
            const boxTop = boxBottom - boxH;
            const boxLeft = 32;
            const boxRight = W - 32;
            const radius = 40;
            const tailCenterX = W / 2;
            const tailHalfW = 30;

            // Gambar bayangan lembut balon komik
            ctx.save();
            ctx.shadowColor = 'rgba(2, 6, 23, 0.58)';
            ctx.shadowBlur = 22;
            ctx.shadowOffsetY = 8;

            // Path Balon Komik (Kotak Melengkung + Ekor Segitiga Menunjuk Kepala NPC di Bawah)
            ctx.beginPath();
            ctx.moveTo(boxLeft + radius, boxTop);
            ctx.lineTo(boxRight - radius, boxTop);
            ctx.quadraticCurveTo(boxRight, boxTop, boxRight, boxTop + radius);
            ctx.lineTo(boxRight, boxBottom - radius);
            ctx.quadraticCurveTo(boxRight, boxBottom, boxRight - radius, boxBottom);
            // Sisi kanan ekor balon
            ctx.lineTo(tailCenterX + tailHalfW, boxBottom);
            ctx.lineTo(tailCenterX, tailTipY); // Ujung lancip bawah menunjuk ke kepala NPC
            ctx.lineTo(tailCenterX - tailHalfW, boxBottom);
            // Sisi kiri bawah
            ctx.lineTo(boxLeft + radius, boxBottom);
            ctx.quadraticCurveTo(boxLeft, boxBottom, boxLeft, boxBottom - radius);
            ctx.lineTo(boxLeft, boxTop + radius);
            ctx.quadraticCurveTo(boxLeft, boxTop, boxLeft + radius, boxTop);
            ctx.closePath();

            // Latar putih gading bersih khas balon komik manga/visual novel
            const grad = ctx.createLinearGradient(0, boxTop, 0, boxBottom);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(1, '#f1f5f9');
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.restore();

            // Garis tepi luar tebal bergaya komik + aksen warna pembicara
            ctx.lineWidth = 9;
            ctx.strokeStyle = '#0f172a';
            ctx.stroke();

            ctx.lineWidth = 4;
            ctx.strokeStyle = accentColor;
            ctx.stroke();

            // Badge Nama Pembicara di Kiri Atas Dalam Balon
            const speakerStr = speakerText || '面接官';
            ctx.font = 'bold 28px "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif';
            const badgeTextW = ctx.measureText(speakerStr).width;
            const badgeW = badgeTextW + 56;
            const badgeH = 48;
            const badgeX = boxLeft + 28;
            const badgeY = boxTop + 20;

            ctx.beginPath();
            ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 24);
            ctx.fillStyle = accentColor;
            ctx.fill();

            // Titik indikator suara aktif di dalam badge
            ctx.beginPath();
            ctx.arc(badgeX + 22, badgeY + badgeH / 2, 7, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(speakerStr, badgeX + 36, badgeY + badgeH / 2 + 1);

            // Indikator halaman/tahap kalimat di kanan atas balon (misal: 1/2, 2/2) jika lebih dari 1 potongan
            if (totalChunks && totalChunks > 1) {
                const stepStr = `${chunkIdx + 1} / ${totalChunks}`;
                ctx.font = 'bold 24px "Inter", "Meiryo", sans-serif';
                ctx.fillStyle = '#64748b';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(stepStr, boxRight - 32, badgeY + badgeH / 2 + 1);
            }

            // Teks Dialog Bahasa Jepang Ukuran Besar di Tengah Balon
            ctx.font = fontMain;
            ctx.fillStyle = '#0f172a';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const contentTop = badgeY + badgeH + 14;
            const contentAreaH = boxBottom - contentTop - 14;
            const startY = contentTop + (contentAreaH - textBlockH) / 2 + lineHeight / 2;

            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], W / 2, startY + i * lineHeight);
            }

            if (this.bubbleTexture) {
                this.bubbleTexture.needsUpdate = true;
            }
        },

        setSubtitleContent: function (speakerText, jpHtml, targetNpcId) {
            this.createSubtitleOverlay();
            this.clearBubbleChunkTimers();

            const resolvedNpcId = targetNpcId || this.activeSpeakerId || 'npc-center';
            this.bubbleTargetNpcId = resolvedNpcId;
            this.bubbleVisible = true;
            this.bubblePopTime = performance.now();

            const chunks = this.splitIntoProgressiveChunks(jpHtml);
            // Tampilkan potongan kalimat pertama seketika dengan huruf besar
            this.drawComicSpeechBubble(speakerText, chunks[0], resolvedNpcId, 0, chunks.length);
            if (this.bubbleMesh) {
                this.bubbleMesh.visible = true;
            }

            // Jadwalkan potongan kalimat berikutnya secara berkala mengikuti irama bicara Jepang (~175ms per huruf + jeda)
            if (chunks.length > 1) {
                let cumulativeMs = 0;
                for (let i = 0; i < chunks.length - 1; i++) {
                    const charCount = chunks[i].length;
                    const durationMs = Math.max(1500, Math.min(4200, charCount * 175 + 320));
                    cumulativeMs += durationMs;
                    const nextIndex = i + 1;
                    const timerId = setTimeout(() => {
                        if (!this.bubbleVisible || this.bubbleTargetNpcId !== resolvedNpcId) return;
                        this.drawComicSpeechBubble(speakerText, chunks[nextIndex], resolvedNpcId, nextIndex, chunks.length);
                    }, cumulativeMs);
                    this.bubbleChunkTimers.push(timerId);
                }
            }
        },

        hideSubtitleBubble: function () {
            this.clearBubbleChunkTimers();
            this.bubbleVisible = false;
            if (this.bubbleMesh) {
                this.bubbleMesh.visible = false;
            }
        },

        showDialogue: function (dialogKey, callback) {
            const data = INTERVIEW_DIALOGS[dialogKey];
            if (!data) return;

            this.isNpcSpeaking = true;
            this.activeSpeakerId = data.speakerNpcId;
            this.activeDialogKey = dialogKey;

            if (dialogKey === 'PERMIT_SIT' || dialogKey === 'CLOSING') {
                this.bowTriggerTime = performance.now();
            }

            this.setSubtitleContent(data.speaker, `「${data.displayJp || data.jp}」`, data.speakerNpcId);

            // Suara Alami Asli Orang Jepang (Native Japanese Audio)
            this.speakJapanese(data, () => {
                this.isNpcSpeaking = false;
                this.activeSpeakerId = null;
                this.lastQuestionEndTime = performance.now();
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

                    // Ketua NPC memberi instruksi "Shitsurei shimasu. Douzo okake kudasai. Mazu wa kantan ni jikoshoukai o onegai shimasu."
                    this.showDialogue('PERMIT_SIT', () => {
                        this.currentStep = 'ANSWER_INTRO';
                        this.showAnswerControls('自己紹介（Perkenalan Diri）', () => {
                            this.triggerQuestion1();
                        });
                    });
                }

                // 2. Jika kandidat langsung duduk di kursi kandidat saat status masih WAITING_ENTRY atau PERMIT_SIT
                if (this.currentStep === 'WAITING_ENTRY' && isSitting && window.currentSeat && window.currentSeat.id === 'candidate-chair') {
                    this.currentStep = 'PERMIT_SIT';
                    this.showDialogue('PERMIT_SIT', () => {
                        this.currentStep = 'ANSWER_INTRO';
                        this.showAnswerControls('自己紹介（Perkenalan Diri）', () => {
                            this.triggerQuestion1();
                        });
                    });
                }

            }, 300);
        },

        triggerQuestion1: function () {
            this.currentStep = 'QUESTION_1';
            setTimeout(() => {
                this.showDialogue('QUESTION_1', () => {
                    this.currentStep = 'ANSWER_1';
                    this.showAnswerControls('日本への留学理由（Alasan Studi ke Jepang）', () => {
                        this.triggerQuestion2();
                    });
                });
            }, 800);
        },

        triggerQuestion2: function () {
            this.currentStep = 'QUESTION_2';
            setTimeout(() => {
                this.showDialogue('QUESTION_2', () => {
                    this.currentStep = 'ANSWER_2';
                    this.showAnswerControls('志望理由（Alasan Memilih Kampus）', () => {
                        this.triggerQuestion3();
                    });
                });
            }, 800);
        },

        triggerQuestion3: function () {
            this.currentStep = 'QUESTION_3';
            setTimeout(() => {
                this.showDialogue('QUESTION_3', () => {
                    this.currentStep = 'ANSWER_3';
                    this.showAnswerControls('情報の入手方法（Cara Tahu Kampus）', () => {
                        this.triggerQuestion4();
                    });
                });
            }, 800);
        },

        triggerQuestion4: function () {
            this.currentStep = 'QUESTION_4';
            setTimeout(() => {
                this.showDialogue('QUESTION_4', () => {
                    this.currentStep = 'ANSWER_4';
                    this.showAnswerControls('長所・強み（Kelebihan Diri）', () => {
                        this.triggerQuestion5();
                    });
                });
            }, 800);
        },

        triggerQuestion5: function () {
            this.currentStep = 'QUESTION_5';
            setTimeout(() => {
                this.showDialogue('QUESTION_5', () => {
                    this.currentStep = 'ANSWER_5';
                    this.showAnswerControls('短所・克服方法（Kekurangan & Solusi）', () => {
                        this.triggerClosing();
                    });
                });
            }, 800);
        },

        triggerClosing: function () {
            this.currentStep = 'CLOSING';
            // Ketua Pewawancara Tengah Menutup Wawancara
            setTimeout(() => {
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
            }, 1000);
        },

        showAnswerControls: function (label, onFinishedAnswer) {
            const stepMap = {
                'ANSWER_INTRO': 'question_intro',
                'ANSWER_1': 'question1',
                'ANSWER_2': 'question2',
                'ANSWER_3': 'question3',
                'ANSWER_4': 'question4',
                'ANSWER_5': 'question5'
            };
            const qKey = stepMap[this.currentStep] || this.currentStep.toLowerCase();
            this.currentAnswerCallback = onFinishedAnswer;
            this.currentQuestionKey = qKey;
            this.isWaitingForCandidateAnswer = true;

            // Beri tahu tombol Xbox B bahwa pewawancara sedang menunggu jawaban
            window.dispatchEvent(new CustomEvent('mensetsu-answer-prompt', { detail: { label: label, questionKey: qKey } }));

            if (typeof window.showActionToast === 'function') {
                window.showActionToast(`Giliran Menjawab: ${label}. Tekan Tombol B (Mic) untuk mulai bicara.`);
            }
        },

        finishCandidateAnswer: function () {
            if (!this.isWaitingForCandidateAnswer && !this.isCandidateAnswering) return;

            this.isCandidateAnswering = false;
            this.isWaitingForCandidateAnswer = false;
            this.lastQuestionEndTime = performance.now();

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
    // PEMBUAT MODEL PULPEN EKSEKUTIF 3D (DIGENGGAM TANGAN KANAN PEWAWANCARA)
    // =========================================================================
    function createExecutivePen(barrelColor) {
        const penGroup = new THREE.Group();

        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.0048, 0.0042, 0.14, 12),
            new THREE.MeshStandardMaterial({ color: barrelColor, roughness: 0.22, metalness: 0.55 })
        );
        penGroup.add(barrel);

        const grip = new THREE.Mesh(
            new THREE.CylinderGeometry(0.0049, 0.0044, 0.035, 12),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.3 })
        );
        grip.position.set(0, -0.045, 0);
        penGroup.add(grip);

        const goldTip = new THREE.Mesh(
            new THREE.ConeGeometry(0.0044, 0.018, 12),
            new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.92, roughness: 0.14 })
        );
        goldTip.position.set(0, -0.078, 0);
        goldTip.rotation.x = Math.PI;
        penGroup.add(goldTip);

        const nib = new THREE.Mesh(
            new THREE.ConeGeometry(0.0014, 0.006, 8),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 })
        );
        nib.position.set(0, -0.088, 0);
        nib.rotation.x = Math.PI;
        penGroup.add(nib);
        penGroup.userData.nib = nib;

        const goldRing = new THREE.Mesh(
            new THREE.CylinderGeometry(0.0052, 0.0052, 0.005, 12),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.92, roughness: 0.1 })
        );
        goldRing.position.set(0, 0.008, 0);
        penGroup.add(goldRing);

        const goldClip = new THREE.Mesh(
            new THREE.BoxGeometry(0.0028, 0.042, 0.0055),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.92, roughness: 0.1 })
        );
        goldClip.position.set(0.005, 0.035, 0);
        penGroup.add(goldClip);

        return penGroup;
    }

    // =========================================================================
    // KOMPONEN 3D NPC PEWAWANCARA (SEATED 3D GLTF RIGGED HUMANOID)
    // Karakter:
    // Tanaka-sensei (Kiri): player_rpm.glb dalam Jas Navy Gelap, Pulpen Navy & Hyoukahyou
    // Sato-sensei (Tengah): player_rpm.glb dalam Jas Charcoal 3-Piece, Kacamata, Pulpen Hitam & Saitenhyou
    // Suzuki-sensei (Kanan): teacher_nanami.glb dalam Blazer Navy Wanita, Kacamata, Pulpen Burgundy & Hyoukahyou
    // Multi-Layer Animation: Breathing, Zarei Bow, Eye Tracking, Aizuchi, Active Note-Taking, Speaking Gestures
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
            this.bodyMesh = null;

            const roleOffset = this.data.role === 'center' ? 0.0 : (this.data.role === 'left' ? 2.4 : 4.8);
            this.idleTime = roleOffset;

            // State Animasi & Perhatian Interaktif
            // 'candidate' (menatap kandidat) | 'writing' (mencatat di lembar evaluasi) | 'resume' (mengecek berkas) | 'colleague'
            this.attentionMode = this.data.role === 'center' ? 'writing' : 'candidate';
            this.attentionTimer = 1.8 + roleOffset * 0.4;
            this.currentHeadRot = { x: 0, y: 0, z: 0 };
            this.currentSpinePitch = 0.05;
            this.currentSpineYaw = 0;

            // Anggukan Aizuchi khas Jepang (single & double nod)
            this.nodCycle = 0;
            this.nodCountTarget = 1;
            this.isNodding = false;
            this.nextNodTime = 2.8 + Math.random() * 2.5;

            // Kedipan mata alami (eye_close morph target)
            this.blinkTimer = 2.2 + Math.random() * 2.5;
            this.blinkPhase = 0;
            this.isBlinking = false;

            // Fase Menulis Pulpen & Gestur Bicara
            this.writingPhase = roleOffset * 1.7;
            this.gesturePhase = 0;

            const isFemale = this.data.gender === 'female' || this.data.role === 'right';
            const isCenter = this.data.role === 'center';
            const isLeft = this.data.role === 'left';

            const modelUrl = isFemale ? 'assets/teacher_nanami.glb' : 'assets/player_rpm.glb';

            const onModelReady = () => {
                this.model = this.el.getObject3D('mesh');
                if (!this.model) return;

                if (isFemale) {
                    this.model.scale.set(1.03, 1.03, 1.03);
                } else if (isCenter) {
                    this.model.scale.set(0.97, 0.97, 0.97);
                } else {
                    this.model.scale.set(0.96, 0.96, 0.96);
                }

                this.bones = {};
                this.morphMeshes = [];
                this.bodyMesh = null;

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

                this.setupCharacterStyling(isFemale, isCenter, isLeft);
                this.setupAccessoriesAndProps(isFemale, isCenter, isLeft);

                if (isFemale) {
                    this.poseSeatedNanami();
                } else {
                    this.poseSeatedRPM(isCenter, isLeft);
                }

                this.alignPenToEvaluationSheet(isFemale);
                this.computeWorldAlignedAxes();
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
                this.model.traverse((child) => {
                    if (child.isMesh && child.material) {
                        child.material.roughness = 0.65;
                        child.material.metalness = 0.05;
                    }
                });
            } else if (isLeft) {
                this.model.traverse((child) => {
                    if (child.isMesh && child.material) {
                        if (child.name === 'Wolf3D_Outfit_Top') {
                            child.material = child.material.clone();
                            child.material.color.setHex(0x182436);
                            child.material.roughness = 0.65;
                            child.material.metalness = 0.05;
                        } else if (child.name === 'Wolf3D_Outfit_Bottom') {
                            child.material = child.material.clone();
                            child.material.color.setHex(0x182436);
                            child.material.roughness = 0.70;
                        } else if (child.name === 'Wolf3D_Hair') {
                            child.material = child.material.clone();
                            child.material.color.setHex(0x0a0c10);
                            child.material.roughness = 0.45;
                        }
                    }
                });
            } else if (isCenter) {
                this.model.traverse((child) => {
                    if (child.isMesh && child.material) {
                        if (child.name === 'Wolf3D_Hair') {
                            child.material = child.material.clone();
                            child.material.color.setHex(0x383e48);
                            child.material.roughness = 0.50;
                        }
                    }
                });
            }
        },

        setupAccessoriesAndProps: function (isFemale, isCenter, isLeft) {
            // 1. Kacamata Titanium Baca Resmi untuk Sato-sensei (Ketua Pewawancara)
            if (isCenter && this.bones['Head']) {
                const glassesGroup = new THREE.Group();
                const frameMat = new THREE.MeshStandardMaterial({
                    color: 0x334155,
                    metalness: 0.95,
                    roughness: 0.15
                });

                const rimGeo = new THREE.TorusGeometry(0.019, 0.0013, 12, 28);
                const rimL = new THREE.Mesh(rimGeo, frameMat);
                rimL.position.set(-0.034, 0.045, 0.088);
                glassesGroup.add(rimL);

                const rimR = new THREE.Mesh(rimGeo, frameMat);
                rimR.position.set(0.034, 0.045, 0.088);
                glassesGroup.add(rimR);

                const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.0012, 0.0012, 0.020, 8), frameMat);
                bridge.rotation.z = Math.PI / 2;
                bridge.position.set(0, 0.048, 0.088);
                glassesGroup.add(bridge);

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

            // 2. Pulpen Eksekutif pada Tangan Kanan Ketiga Pewawancara untuk Mencatat Nilai
            if (this.bones['RightHand']) {
                if (this.penMesh && this.penMesh.parent) {
                    this.penMesh.parent.remove(this.penMesh);
                }
                const penColor = isCenter ? 0x0f172a : (isLeft ? 0x1e3a8a : 0x7f1d1d);
                const pen = createExecutivePen(penColor);
                this.bones['RightHand'].add(pen);
                this.penMesh = pen;
            }
        },

        aimBoneZeroTwist: function (bone, childBone, targetDirWorld) {
            if (!bone || !childBone) return;
            bone.parent.updateWorldMatrix(true, false);
            bone.updateWorldMatrix(true, false);
            childBone.updateWorldMatrix(true, false);

            const pB = new THREE.Vector3();
            const pC = new THREE.Vector3();
            bone.getWorldPosition(pB);
            childBone.getWorldPosition(pC);

            const curDir = pC.sub(pB).normalize();
            const desDir = targetDirWorld.clone().normalize();

            const qSwingWorld = new THREE.Quaternion().setFromUnitVectors(curDir, desDir);
            const qCurWorld = new THREE.Quaternion();
            bone.getWorldQuaternion(qCurWorld);
            const qParentWorld = new THREE.Quaternion();
            bone.parent.getWorldQuaternion(qParentWorld);

            const qNewWorld = qSwingWorld.multiply(qCurWorld);
            bone.quaternion.copy(qParentWorld.invert().multiply(qNewWorld));
            bone.updateWorldMatrix(true, true);
        },

        aimChainAtTargets: function (b1, b2, b3, b4, dir1, dir2, dir3) {
            if (b1 && b2 && dir1) this.aimBoneZeroTwist(b1, b2, dir1);
            if (b2 && b3 && dir2) this.aimBoneZeroTwist(b2, b3, dir2);
            if (b3 && b4 && dir3) this.aimBoneZeroTwist(b3, b4, dir3);
        },

        poseHandsWithNaturalTripodGrip: function () {
            const bones = this.bones;
            const fingers = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];

            // Reset seluruh sendi jari ke restQuat sebelum mengarahkan secara anatomis (zero-twist)
            ['Left', 'Right'].forEach((side) => {
                fingers.forEach((f) => {
                    for (let k = 1; k <= 4; k++) {
                        const b = bones[`${side}Hand${f}${k}`];
                        if (b && b.userData.restQuat) {
                            b.quaternion.copy(b.userData.restQuat);
                        }
                    }
                });
            });

            this.el.object3D.updateMatrixWorld(true);

            // Arahkan telapak tangan kiri (mendatar di atas Rirekisho) & telapak tangan kanan (melengkung ke atas untuk Tripod Grip)
            this.aimBoneZeroTwist(bones['LeftHand'], bones['LeftHandMiddle1'], new THREE.Vector3(-0.08, 0.04, 0.99));
            this.aimBoneZeroTwist(bones['RightHand'], bones['RightHandMiddle1'], new THREE.Vector3(0.10, 0.22, 0.97));

            if (bones['LeftHand']) bones['LeftHand'].userData.seatedQuat = bones['LeftHand'].quaternion.clone();
            if (bones['RightHand']) bones['RightHand'].userData.seatedQuat = bones['RightHand'].quaternion.clone();

            // 1. TANGAN KIRI: Postur Soroeru mendatar di atas lembar Rirekisho (seluruh tulang jari berada di Y = 0.785m - 0.794m, bebas tembus kertas)
            ['Index', 'Middle', 'Ring', 'Pinky'].forEach((f, idx) => {
                const b1 = bones[`LeftHand${f}1`];
                const b2 = bones[`LeftHand${f}2`];
                const b3 = bones[`LeftHand${f}3`];
                const b4 = bones[`LeftHand${f}4`];
                const spreadX = (1.5 - idx) * 0.035;
                this.aimChainAtTargets(
                    b1, b2, b3, b4,
                    new THREE.Vector3(spreadX - 0.06, -0.02, 0.99),
                    new THREE.Vector3(spreadX - 0.06, -0.01, 0.99),
                    new THREE.Vector3(spreadX - 0.06,  0.00, 1.00)
                );
            });
            this.aimChainAtTargets(
                bones['LeftHandThumb1'], bones['LeftHandThumb2'], bones['LeftHandThumb3'], bones['LeftHandThumb4'],
                new THREE.Vector3(-0.42, 0.04, 0.90),
                new THREE.Vector3(-0.22, 0.02, 0.97),
                new THREE.Vector3(-0.10, 0.02, 0.99)
            );

            // 2. TANGAN KANAN: Dynamic Tripod Pen Grip (Genggaman 3 Jari Alami: Telunjuk, Ibu Jari, Jari Tengah)
            // Jari telunjuk melengkung anggun dari buku jari atas (Y ~ 0.812m) menjepit karet grip pulpen (Y ~ 0.788m)
            this.aimChainAtTargets(
                bones['RightHandIndex1'], bones['RightHandIndex2'], bones['RightHandIndex3'], bones['RightHandIndex4'],
                new THREE.Vector3(0.08, -0.14, 0.98),
                new THREE.Vector3(0.14, -0.36, 0.92),
                new THREE.Vector3(0.18, -0.28, 0.94)
            );

            // Ibu jari mengarah ke depan-dalam menjepit sisi kiri karet grip pulpen berhadapan dengan telunjuk
            this.aimChainAtTargets(
                bones['RightHandThumb1'], bones['RightHandThumb2'], bones['RightHandThumb3'], bones['RightHandThumb4'],
                new THREE.Vector3(0.28, -0.06, 0.96),
                new THREE.Vector3(-0.04, -0.05, 0.99),
                new THREE.Vector3(-0.36, -0.04, 0.93)
            );

            // Jari tengah menekuk di bawah batang pulpen sebagai tumpuan ke-3 tripod (Y ~ 0.786m)
            this.aimChainAtTargets(
                bones['RightHandMiddle1'], bones['RightHandMiddle2'], bones['RightHandMiddle3'], bones['RightHandMiddle4'],
                new THREE.Vector3(0.14, -0.22, 0.96),
                new THREE.Vector3(0.42, -0.32, 0.85),
                new THREE.Vector3(0.72,  0.02, 0.45)
            );

            // Jari manis & kelingking menekuk rapi ke arah telapak tangan di atas kertas (Y >= 0.783m)
            this.aimChainAtTargets(
                bones['RightHandRing1'], bones['RightHandRing2'], bones['RightHandRing3'], bones['RightHandRing4'],
                new THREE.Vector3(0.22, -0.20, 0.95),
                new THREE.Vector3(0.68, -0.10, 0.52),
                new THREE.Vector3(0.82,  0.10, -0.55)
            );
            this.aimChainAtTargets(
                bones['RightHandPinky1'], bones['RightHandPinky2'], bones['RightHandPinky3'], bones['RightHandPinky4'],
                new THREE.Vector3(0.28, -0.14, 0.95),
                new THREE.Vector3(0.74, -0.04, 0.40),
                new THREE.Vector3(0.80,  0.12, -0.58)
            );

            // Simpan seatedQuat pada seluruh sendi jari agar animasi goresan jari tripod dapat berinterpolasi mulus
            ['Left', 'Right'].forEach((side) => {
                fingers.forEach((f) => {
                    for (let k = 1; k <= 4; k++) {
                        const b = bones[`${side}Hand${f}${k}`];
                        if (b) {
                            b.userData.seatedQuat = b.quaternion.clone();
                        }
                    }
                });
            });
        },

        poseSeatedRPM: function (isCenter, isLeft) {
            const bones = this.bones;
            const axX = new THREE.Vector3(1, 0, 0);

            // Kompensasi skala model (npc-left = 0.96 vs npc-center = 0.97) agar tinggi bahu & tangan di dunia 100% identik
            if (bones['Hips']) {
                bones['Hips'].position.set(0, isLeft ? 0.569 : 0.560, 0.00);
            }

            // Kaki duduk rapi di kolong meja
            if (bones['LeftUpLeg']) bones['LeftUpLeg'].quaternion.copy(bones['LeftUpLeg'].userData.restQuat).multiply(new THREE.Quaternion().setFromAxisAngle(axX, 1.48));
            if (bones['RightUpLeg']) bones['RightUpLeg'].quaternion.copy(bones['RightUpLeg'].userData.restQuat).multiply(new THREE.Quaternion().setFromAxisAngle(axX, 1.48));
            if (bones['LeftLeg']) bones['LeftLeg'].quaternion.copy(bones['LeftLeg'].userData.restQuat).multiply(new THREE.Quaternion().setFromAxisAngle(axX, -1.50));
            if (bones['RightLeg']) bones['RightLeg'].quaternion.copy(bones['RightLeg'].userData.restQuat).multiply(new THREE.Quaternion().setFromAxisAngle(axX, -1.50));

            // Tulang belakang condong halus ke depan (+0.05 rad) menghadap meja kerja
            if (bones['Spine']) {
                bones['Spine'].quaternion.copy(bones['Spine'].userData.restQuat)
                    .multiply(new THREE.Quaternion().setFromAxisAngle(axX, 0.05));
                bones['Spine'].userData.baseQuat = bones['Spine'].quaternion.clone();
            }
            if (bones['Spine1']) {
                bones['Spine1'].quaternion.copy(bones['Spine1'].userData.restQuat);
                bones['Spine1'].userData.baseQuat = bones['Spine1'].quaternion.clone();
            }
            if (bones['Spine2']) {
                bones['Spine2'].quaternion.copy(bones['Spine2'].userData.restQuat);
                bones['Spine2'].userData.baseQuat = bones['Spine2'].quaternion.clone();
            }
            if (bones['Neck']) {
                bones['Neck'].quaternion.copy(bones['Neck'].userData.restQuat);
            }

            // Lengan atas, lengan bawah, dan pergelangan tangan dengan ruang bebas jari >= 0.782m di atas kertas (0.764m)
            const qArmL = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.40, -0.15, 0.58, 'XYZ'));
            const qArmR = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.39, 0.14, -0.58, 'XYZ'));

            if (bones['LeftArm']) {
                bones['LeftArm'].quaternion.copy(bones['LeftArm'].userData.restQuat).multiply(qArmL);
                bones['LeftArm'].userData.seatedQuat = bones['LeftArm'].quaternion.clone();
            }
            if (bones['RightArm']) {
                bones['RightArm'].quaternion.copy(bones['RightArm'].userData.restQuat).multiply(qArmR);
                bones['RightArm'].userData.seatedQuat = bones['RightArm'].quaternion.clone();
            }

            const qForeL = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.56, 0.86, 1.32, 'XYZ'));
            const qForeR = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.80, -0.88, -1.43, 'XYZ'));

            if (bones['LeftForeArm']) {
                bones['LeftForeArm'].quaternion.copy(bones['LeftForeArm'].userData.restQuat).multiply(qForeL);
                bones['LeftForeArm'].userData.seatedQuat = bones['LeftForeArm'].quaternion.clone();
            }
            if (bones['RightForeArm']) {
                bones['RightForeArm'].quaternion.copy(bones['RightForeArm'].userData.restQuat).multiply(qForeR);
                bones['RightForeArm'].userData.seatedQuat = bones['RightForeArm'].quaternion.clone();
            }

            const qHandL = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.18, 0.19, -0.25, 'XYZ'));
            const qHandR = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.34, -0.10, 0.24, 'XYZ'));

            if (bones['LeftHand']) {
                bones['LeftHand'].quaternion.copy(bones['LeftHand'].userData.restQuat).multiply(qHandL);
                bones['LeftHand'].userData.seatedQuat = bones['LeftHand'].quaternion.clone();
            }
            if (bones['RightHand']) {
                bones['RightHand'].quaternion.copy(bones['RightHand'].userData.restQuat).multiply(qHandR);
                bones['RightHand'].userData.seatedQuat = bones['RightHand'].quaternion.clone();
            }

            this.poseHandsWithNaturalTripodGrip();

            if (bones['Head']) {
                bones['Head'].quaternion.copy(bones['Head'].userData.restQuat);
                bones['Head'].userData.baseQuat = bones['Head'].quaternion.clone();
            }
        },

        poseSeatedNanami: function () {
            const bones = this.bones;
            const axX = new THREE.Vector3(1, 0, 0);

            if (bones['Hips']) {
                bones['Hips'].position.set(0, 0.515, 0.00);
            }

            if (bones['LeftUpLeg']) bones['LeftUpLeg'].quaternion.copy(bones['LeftUpLeg'].userData.restQuat).multiply(new THREE.Quaternion().setFromAxisAngle(axX, -1.55));
            if (bones['RightUpLeg']) bones['RightUpLeg'].quaternion.copy(bones['RightUpLeg'].userData.restQuat).multiply(new THREE.Quaternion().setFromAxisAngle(axX, -1.55));
            if (bones['LeftLeg']) bones['LeftLeg'].quaternion.copy(bones['LeftLeg'].userData.restQuat).multiply(new THREE.Quaternion().setFromAxisAngle(axX, 1.52));
            if (bones['RightLeg']) bones['RightLeg'].quaternion.copy(bones['RightLeg'].userData.restQuat).multiply(new THREE.Quaternion().setFromAxisAngle(axX, 1.52));

            if (bones['Spine']) {
                bones['Spine'].quaternion.copy(bones['Spine'].userData.restQuat)
                    .multiply(new THREE.Quaternion().setFromAxisAngle(axX, 0.04));
                bones['Spine'].userData.baseQuat = bones['Spine'].quaternion.clone();
            }
            if (bones['Spine1']) {
                bones['Spine1'].quaternion.copy(bones['Spine1'].userData.restQuat);
                bones['Spine1'].userData.baseQuat = bones['Spine1'].quaternion.clone();
            }
            if (bones['Spine2']) {
                bones['Spine2'].quaternion.copy(bones['Spine2'].userData.restQuat);
                bones['Spine2'].userData.baseQuat = bones['Spine2'].quaternion.clone();
            }
            if (bones['Neck']) {
                bones['Neck'].quaternion.copy(bones['Neck'].userData.restQuat);
            }

            const dropL = new THREE.Quaternion().setFromEuler(new THREE.Euler(1.005, -0.20, -0.89, 'XYZ'));
            const dropR = new THREE.Quaternion().setFromEuler(new THREE.Euler(1.005, 0.20, 0.89, 'XYZ'));

            if (bones['LeftArm']) {
                bones['LeftArm'].quaternion.copy(bones['LeftArm'].userData.restQuat).multiply(dropL);
                bones['LeftArm'].userData.seatedQuat = bones['LeftArm'].quaternion.clone();
            }
            if (bones['RightArm']) {
                bones['RightArm'].quaternion.copy(bones['RightArm'].userData.restQuat).multiply(dropR);
                bones['RightArm'].userData.seatedQuat = bones['RightArm'].quaternion.clone();
            }

            const bendL = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.52, 0.65, 0.48, 'XYZ'));
            const bendR = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.58, -0.65, -0.47, 'XYZ'));

            if (bones['LeftForeArm']) {
                bones['LeftForeArm'].quaternion.copy(bones['LeftForeArm'].userData.restQuat).multiply(bendL);
                bones['LeftForeArm'].userData.seatedQuat = bones['LeftForeArm'].quaternion.clone();
            }
            if (bones['RightForeArm']) {
                bones['RightForeArm'].quaternion.copy(bones['RightForeArm'].userData.restQuat).multiply(bendR);
                bones['RightForeArm'].userData.seatedQuat = bones['RightForeArm'].quaternion.clone();
            }

            const qHandNanamiL = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.20, -0.16, 0.24, 'XYZ'));
            const qHandNanamiR = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.10, 0.14, -0.18, 'XYZ'));

            if (bones['LeftHand']) {
                bones['LeftHand'].quaternion.copy(bones['LeftHand'].userData.restQuat).multiply(qHandNanamiL);
                bones['LeftHand'].userData.seatedQuat = bones['LeftHand'].quaternion.clone();
            }
            if (bones['RightHand']) {
                bones['RightHand'].quaternion.copy(bones['RightHand'].userData.restQuat).multiply(qHandNanamiR);
                bones['RightHand'].userData.seatedQuat = bones['RightHand'].quaternion.clone();
            }

            this.poseHandsWithNaturalTripodGrip();

            if (bones['Head']) {
                bones['Head'].quaternion.copy(bones['Head'].userData.restQuat);
                bones['Head'].userData.baseQuat = bones['Head'].quaternion.clone();
            }
        },

        alignPenToEvaluationSheet: function (isFemale) {
            const bones = this.bones;
            if (!this.penMesh || !bones['RightHand'] || !bones['RightHandIndex3'] || !bones['RightHandThumb3'] || !bones['RightHandIndex1']) return;

            this.el.object3D.updateMatrixWorld(true);
            const handBone = bones['RightHand'];

            const pIdx3 = new THREE.Vector3();
            const pIdx4 = new THREE.Vector3();
            const pThm3 = new THREE.Vector3();
            const pThm4 = new THREE.Vector3();
            const pIdx1 = new THREE.Vector3();

            bones['RightHandIndex3'].getWorldPosition(pIdx3);
            if (bones['RightHandIndex4']) {
                bones['RightHandIndex4'].getWorldPosition(pIdx4);
            } else {
                pIdx4.copy(pIdx3);
            }
            bones['RightHandThumb3'].getWorldPosition(pThm3);
            if (bones['RightHandThumb4']) {
                bones['RightHandThumb4'].getWorldPosition(pThm4);
            } else {
                pThm4.copy(pThm3);
            }
            bones['RightHandIndex1'].getWorldPosition(pIdx1);

            // Titik jepit tepat di tengah antara bantalan ujung telunjuk & ibu jari (Tripod Pinch Point)
            const pinchPadIndex = pIdx3.clone().lerp(pIdx4, 0.55);
            const pinchPadThumb = pThm3.clone().lerp(pThm4, 0.55);
            const pinchMid = pinchPadIndex.clone().lerp(pinchPadThumb, 0.45);

            // Mata pena (nib) menyentuh permukaan kertas evaluasi (Y = 0.765m) ~1.9 cm di depan titik jepit jari,
            // sedangkan batang atas pena bersandar alami pada lekukan pangkal telunjuk & ibu jari (purlicue web)
            const nibWorld = new THREE.Vector3(
                pinchMid.x + 0.003,
                0.765,
                pinchMid.z + 0.019
            );
            const webRestWorld = new THREE.Vector3(
                pIdx1.x + (isFemale ? 0.013 : 0.015),
                pIdx1.y + 0.003,
                pIdx1.z - 0.010
            );

            const dirPinch = pinchMid.clone().sub(nibWorld).normalize();
            const dirWeb = webRestWorld.clone().sub(nibWorld).normalize();
            const penDir = dirPinch.lerp(dirWeb, 0.45).normalize();

            const centerWorld = nibWorld.clone().addScaledVector(penDir, 0.088);
            const invHand = new THREE.Matrix4().copy(handBone.matrixWorld).invert();
            this.penMesh.position.copy(centerWorld.applyMatrix4(invHand));

            const handWorldQuat = new THREE.Quaternion();
            handBone.getWorldQuaternion(handWorldQuat);
            const worldPenQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), penDir);
            this.penMesh.quaternion.copy(handWorldQuat.invert().multiply(worldPenQuat));
        },

        computeWorldAlignedAxes: function () {
            // Menghitung sumbu lokal tulang yang sejajar dengan sumbu Dunia:
            // - axisWorldRight (+X dunia): sumbu engsel vertikal (rotasi negatif mengangkat lengan/tangan/jari ke atas meja)
            // - axisWorldUp (+Y dunia): sumbu sapuan horizontal (menggerakkan lengan/tangan kiri-kanan sejajar permukaan kertas)
            // - axisWorldFwd (+Z dunia): sumbu pronasi/supinasi telapak tangan
            this.el.object3D.updateMatrixWorld(true);
            const targetBones = [
                'LeftForeArm', 'RightForeArm',
                'LeftHand', 'RightHand',
                'RightHandIndex1', 'RightHandIndex2',
                'RightHandThumb2', 'RightHandMiddle1'
            ];
            targetBones.forEach((bName) => {
                const b = this.bones[bName];
                if (!b) return;
                const qWorld = new THREE.Quaternion();
                b.getWorldQuaternion(qWorld);
                const qInv = qWorld.clone().invert();
                b.userData.axisWorldRight = new THREE.Vector3(1, 0, 0).applyQuaternion(qInv).normalize();
                b.userData.axisWorldUp = new THREE.Vector3(0, 1, 0).applyQuaternion(qInv).normalize();
                b.userData.axisWorldFwd = new THREE.Vector3(0, 0, 1).applyQuaternion(qInv).normalize();
            });
        },

        tick: function (time, delta) {
            if (!this.bones['Head'] || !this.bones['Head'].userData.baseQuat) return;

            const dt = Math.min((delta || 16) / 1000, 0.1);
            this.idleTime += dt;

            const isCenter = this.data.role === 'center';
            const isLeft = this.data.role === 'left';
            const isRight = this.data.role === 'right';
            const sys = window.MensetsuInterview;
            const isSpeaking = sys && sys.isNpcSpeaking && sys.activeSpeakerId === this.el.id;
            const isCandidateAnswering = sys && sys.isCandidateAnswering;
            const timeSinceLastSpeech = (sys && sys.lastQuestionEndTime > 0)
                ? (performance.now() - sys.lastQuestionEndTime)
                : 99999;
            const postQuestionWriteBoost = timeSinceLastSpeech < 4200;

            const axX = new THREE.Vector3(1, 0, 0);
            const axY = new THREE.Vector3(0, 1, 0);

            // Hitung sudut nyata ke kamera pemain (#player-camera) agar kontak mata akurat
            const npcWorldX = isLeft ? -1.3 : (isRight ? 1.3 : 0.0);
            const npcWorldY = 1.12;
            const npcWorldZ = -4.02;
            let relYawToPlayer = isLeft ? 0.36 : (isRight ? -0.36 : 0.0);
            let relPitchToPlayer = -0.02;

            const camera = document.getElementById('player-camera');
            if (camera && camera.object3D) {
                const camPos = camera.object3D.position;
                if (camPos.z < 6.0) {
                    const dx = camPos.x - npcWorldX;
                    const dy = camPos.y - npcWorldY;
                    const dz = Math.max(0.65, camPos.z - npcWorldZ);
                    relYawToPlayer = THREE.MathUtils.clamp(Math.atan2(dx, dz), -0.58, 0.58);
                    relPitchToPlayer = THREE.MathUtils.clamp(Math.atan2(dy, dz) * 0.45, -0.18, 0.14);
                }
            }

            // =========================================================
            // LAYER 1: PERNAPASAN, OJIGI DUDUK (ZAREI) & CONDONG TORSO
            // =========================================================
            const breathChest = Math.sin(this.idleTime * 1.55) * 0.005 + Math.sin(this.idleTime * 3.1) * 0.002;

            let bowPitch = 0;
            if (sys && sys.bowTriggerTime > 0) {
                const elapsedBow = performance.now() - sys.bowTriggerTime;
                const bowDuration = 1450;
                if (elapsedBow < bowDuration) {
                    const p = elapsedBow / bowDuration;
                    bowPitch = Math.sin(p * Math.PI) * 0.22; // ~13 derajat Zarei formal
                }
            }

            const isWritingActive = !isSpeaking && (
                this.attentionMode === 'writing' ||
                (isCandidateAnswering && (isCenter || Math.sin(this.idleTime * 0.55) > -0.2)) ||
                (postQuestionWriteBoost && (isCenter || isLeft))
            );

            const targetSpinePitch = breathChest + bowPitch;
            const targetSpineYaw = (this.attentionMode === 'candidate' || isSpeaking)
                ? (relYawToPlayer * 0.22)
                : (isLeft ? 0.04 : (isRight ? -0.04 : 0.0));

            this.currentSpinePitch = THREE.MathUtils.lerp(this.currentSpinePitch, targetSpinePitch, dt * 5.0);
            this.currentSpineYaw = THREE.MathUtils.lerp(this.currentSpineYaw, targetSpineYaw, dt * 4.0);

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
            // LAYER 2: PENJEJAKAN PANDANGAN MATA & KEPALA (ATTENTION FSM)
            // =========================================================
            this.attentionTimer -= dt;
            if (this.attentionTimer <= 0) {
                if (isSpeaking) {
                    this.attentionMode = Math.random() < 0.80 ? 'candidate' : 'resume';
                    this.attentionTimer = 2.2 + Math.random() * 2.2;
                } else if (isCandidateAnswering) {
                    const writeProb = isCenter ? 0.68 : 0.52;
                    this.attentionMode = Math.random() < writeProb ? 'writing' : 'candidate';
                    this.attentionTimer = 2.4 + Math.random() * 2.6;
                } else {
                    const roll = Math.random();
                    if (roll < 0.48) {
                        this.attentionMode = 'candidate';
                        this.attentionTimer = 3.0 + Math.random() * 2.8;
                    } else if (roll < 0.80) {
                        this.attentionMode = 'writing';
                        this.attentionTimer = 2.6 + Math.random() * 2.4;
                    } else if (roll < 0.93) {
                        this.attentionMode = 'resume';
                        this.attentionTimer = 2.0 + Math.random() * 2.0;
                    } else {
                        this.attentionMode = 'colleague';
                        this.attentionTimer = 1.4 + Math.random() * 1.5;
                    }
                }
            }

            let targetPitch = relPitchToPlayer;
            let targetYaw = relYawToPlayer * 0.72;

            if (isWritingActive || this.attentionMode === 'writing') {
                targetPitch = -0.17 + Math.sin(this.writingPhase * 0.35) * 0.012;
                targetYaw = -0.09 + Math.sin(this.writingPhase * 0.30) * 0.028;
            } else if (this.attentionMode === 'resume') {
                targetPitch = -0.15;
                targetYaw = 0.09 + Math.sin(this.idleTime * 1.2) * 0.025;
            } else if (this.attentionMode === 'colleague') {
                targetPitch = -0.04;
                targetYaw = isLeft ? 0.35 : (isRight ? -0.35 : (Math.sin(this.idleTime) > 0 ? 0.26 : -0.26));
            }

            // =========================================================
            // LAYER 3: ANGGUKAN AIZUCHI JEPANG & KEDIPAN MATA ALAMI
            // =========================================================
            this.nextNodTime -= dt;
            if (this.nextNodTime <= 0 && !this.isNodding && !isWritingActive) {
                this.isNodding = true;
                this.nodCycle = 0;
                this.nodCountTarget = (isCandidateAnswering && Math.random() < 0.65) ? 2 : 1;
                this.nextNodTime = isCandidateAnswering
                    ? (2.2 + Math.random() * 2.4)
                    : (3.6 + Math.random() * 3.8);
            }

            let nodOffset = 0;
            if (this.isNodding) {
                this.nodCycle += dt * 4.2;
                const maxCycle = Math.PI * 2 * this.nodCountTarget;
                if (this.nodCycle <= maxCycle) {
                    nodOffset = -Math.abs(Math.sin(this.nodCycle * 0.5)) * 0.095;
                } else {
                    this.isNodding = false;
                }
            }

            this.blinkTimer -= dt;
            if (this.blinkTimer <= 0 && !this.isBlinking) {
                this.isBlinking = true;
                this.blinkPhase = 0;
                this.blinkTimer = 2.5 + Math.random() * 3.2;
            }
            let blinkVal = 0;
            if (this.isBlinking) {
                this.blinkPhase += dt * 18.0;
                if (this.blinkPhase <= Math.PI) {
                    blinkVal = Math.sin(this.blinkPhase);
                } else {
                    this.isBlinking = false;
                }
            }

            // =========================================================
            // LAYER 4: ANIMASI TANGAN & JARI INTERAKTIF (BIOMECHANICAL TRIPOD WRITING)
            // 1. Kompensasi otomatis rotasi Spine agar tangan tetap bertumpu stabil di atas permukaan kertas
            // 2. Siklus menulis 3 tahap: (A) Goresan jari tripod + geser lengan kiri-ke-kanan,
            //    (B) Angkat ujung pena mikro untuk pindah kolom/baris, (C) Jeda baca singkat
            // =========================================================
            let speakPitch = 0;
            let speakYaw = 0;
            let mouthVal = 0;

            const lFore = this.bones['LeftForeArm'];
            const rFore = this.bones['RightForeArm'];
            const lHand = this.bones['LeftHand'];
            const rHand = this.bones['RightHand'];
            const rIdx1 = this.bones['RightHandIndex1'];
            const rIdx2 = this.bones['RightHandIndex2'];
            const rThm2 = this.bones['RightHandThumb2'];
            const rMid1 = this.bones['RightHandMiddle1'];

            let targetLForeQuat = lFore && lFore.userData.seatedQuat ? lFore.userData.seatedQuat.clone() : null;
            let targetRForeQuat = rFore && rFore.userData.seatedQuat ? rFore.userData.seatedQuat.clone() : null;
            let targetLHandQuat = lHand && lHand.userData.seatedQuat ? lHand.userData.seatedQuat.clone() : null;
            let targetRHandQuat = rHand && rHand.userData.seatedQuat ? rHand.userData.seatedQuat.clone() : null;

            let targetRIdx1Quat = rIdx1 && rIdx1.userData.seatedQuat ? rIdx1.userData.seatedQuat.clone() : null;
            let targetRIdx2Quat = rIdx2 && rIdx2.userData.seatedQuat ? rIdx2.userData.seatedQuat.clone() : null;
            let targetRThm2Quat = rThm2 && rThm2.userData.seatedQuat ? rThm2.userData.seatedQuat.clone() : null;
            let targetRMid1Quat = rMid1 && rMid1.userData.seatedQuat ? rMid1.userData.seatedQuat.clone() : null;

            // Kompensasi pitch torso (pernapasan / ojigi) agar lengan bawah tidak pernah tertekan turun menembus meja
            const spineCompLift = -Math.max(0, this.currentSpinePitch) * 1.05;
            if (spineCompLift < -0.0005) {
                if (lFore && lFore.userData.axisWorldRight && targetLForeQuat) {
                    targetLForeQuat.multiply(new THREE.Quaternion().setFromAxisAngle(lFore.userData.axisWorldRight, spineCompLift));
                }
                if (rFore && rFore.userData.axisWorldRight && targetRForeQuat) {
                    targetRForeQuat.multiply(new THREE.Quaternion().setFromAxisAngle(rFore.userData.axisWorldRight, spineCompLift));
                }
            }

            if (isSpeaking) {
                const spkCadence = Math.sin(this.idleTime * 12.5) * 0.5 + Math.cos(this.idleTime * 8.0) * 0.5;
                mouthVal = Math.max(0.04, spkCadence * 0.42);
                speakPitch = Math.sin(this.idleTime * 4.2) * 0.026;
                speakYaw = Math.cos(this.idleTime * 2.9) * 0.022;

                this.gesturePhase += dt * 2.8;
                const isPermitSit = sys && sys.activeDialogKey === 'PERMIT_SIT';

                if (isPermitSit && lFore && lFore.userData.axisWorldRight && lHand && lHand.userData.axisWorldRight) {
                    // Gestur mempersilakan duduk ("Douzo okake kudasai"): tangan kiri terangkat sopan mengarah ke kursi kandidat
                    const wave = Math.max(0, Math.sin(this.gesturePhase * 0.9)) * 0.05;
                    const qLF = new THREE.Quaternion()
                        .setFromAxisAngle(lFore.userData.axisWorldRight, -0.14 - wave)
                        .multiply(new THREE.Quaternion().setFromAxisAngle(lFore.userData.axisWorldUp, 0.12));
                    targetLForeQuat.multiply(qLF);

                    const qLH = new THREE.Quaternion()
                        .setFromAxisAngle(lHand.userData.axisWorldRight, -0.08)
                        .multiply(new THREE.Quaternion().setFromAxisAngle(lHand.userData.axisWorldFwd, -0.22));
                    targetLHandQuat.multiply(qLH);
                } else {
                    // Gestur pewawancara saat mengajukan pertanyaan (hanya ke arah atas meja: rotasi negatif pada axisWorldRight)
                    const liftL = Math.max(0, Math.sin(this.gesturePhase * 1.1)) * 0.085 + 0.02;
                    const sweepL = Math.sin(this.gesturePhase * 0.7) * 0.045;

                    if (lFore && lFore.userData.axisWorldRight) {
                        const qLF = new THREE.Quaternion()
                            .setFromAxisAngle(lFore.userData.axisWorldRight, -liftL)
                            .multiply(new THREE.Quaternion().setFromAxisAngle(lFore.userData.axisWorldUp, sweepL));
                        targetLForeQuat.multiply(qLF);
                    }
                    if (lHand && lHand.userData.axisWorldRight) {
                        const wristFlex = -Math.abs(Math.sin(this.gesturePhase * 1.6)) * 0.05;
                        const qLH = new THREE.Quaternion()
                            .setFromAxisAngle(lHand.userData.axisWorldRight, wristFlex)
                            .multiply(new THREE.Quaternion().setFromAxisAngle(lHand.userData.axisWorldFwd, -0.10));
                        targetLHandQuat.multiply(qLH);
                    }

                    const liftR = Math.max(0, Math.cos(this.gesturePhase * 0.95)) * 0.032;
                    if (rFore && rFore.userData.axisWorldRight) {
                        const qRF = new THREE.Quaternion()
                            .setFromAxisAngle(rFore.userData.axisWorldRight, -liftR);
                        targetRForeQuat.multiply(qRF);
                    }
                }
            } else if (isWritingActive) {
                // =========================================================
                // SIKLUS MENULIS BIOMEKANIKA 3 TAHAP (DYNAMIC TRIPOD HANDWRITING)
                // Tahap A (0.0s - 2.3s): Goresan karakter kanji/nilai oleh sendi jari tripod + sapuan halus lengan kiri-ke-kanan
                // Tahap B (2.3s - 2.9s): Angkat pena mikro (+4mm) & geser ke kotak/baris berikutnya
                // Tahap C (2.9s - 3.8s): Jeda singkat meninjau catatan sebelum menulis baris selanjutnya
                // =========================================================
                mouthVal = 0.0;
                this.writingPhase += dt * 5.8;

                const cyclePeriod = 3.8;
                const cyclePos = (this.idleTime * 1.0) % cyclePeriod;

                let lineProgress = 0.0;
                let forearmLift = -0.008;
                let wristLift = -0.004;
                let wristSide = 0.0;
                let fingerFlex = 0.0;

                if (cyclePos < 2.3) {
                    // Tahap A: Menulis aktif sepanjang baris (kiri ke kanan) dengan gerakan halus jari tripod
                    const u = cyclePos / 2.3;
                    lineProgress = (u - 0.5) * 0.026; // Sapuan halus ~1.1 cm melintasi kolom penilaian

                    // Modulasi goresan kuas/pena huruf Jepang (3-4 goresan per detik, berhenti sejenak antar karakter)
                    const charEnvelope = Math.sin(u * Math.PI * 3.0) > -0.45 ? 1.0 : 0.15;
                    const strokeVert = Math.abs(Math.sin(this.writingPhase * 1.85)) * charEnvelope;
                    const strokeDiag = (Math.cos(this.writingPhase * 2.35) * 0.65 + Math.sin(this.writingPhase * 3.7) * 0.35) * charEnvelope;

                    forearmLift = -0.008 - strokeVert * 0.005;
                    // Pergelangan tangan tetap stabil (hanya mikro-pivot <= 0 pada axisWorldRight agar jari tidak pernah turun menembus kertas)
                    wristLift = -0.005 - strokeVert * 0.012;
                    wristSide = strokeDiag * 0.011;
                    // Goresan halus utama digerakkan oleh fleksi-ekstensi jari telunjuk, ibu jari, dan jari tengah (Dynamic Tripod)
                    fingerFlex = strokeVert * 0.055;
                } else if (cyclePos < 2.9) {
                    // Tahap B: Mengangkat ujung pena sedikit dari kertas untuk berpindah baris/kolom (Carriage Return)
                    const v = (cyclePos - 2.3) / 0.6;
                    const arc = Math.sin(v * Math.PI);
                    lineProgress = THREE.MathUtils.lerp(0.013, -0.013, v);
                    forearmLift = -0.010 - arc * 0.020;
                    wristLift = -0.008 - arc * 0.016;
                    wristSide = 0.0;
                    fingerFlex = -arc * 0.025;
                } else {
                    // Tahap C: Jeda sejenak memeriksa tulisan dengan pena siap di atas baris baru
                    lineProgress = -0.013;
                    forearmLift = -0.010;
                    wristLift = -0.006;
                    wristSide = 0.0;
                    fingerFlex = 0.0;
                }

                if (rFore && rFore.userData.axisWorldUp && rFore.userData.axisWorldRight) {
                    const qRF = new THREE.Quaternion()
                        .setFromAxisAngle(rFore.userData.axisWorldUp, lineProgress)
                        .multiply(new THREE.Quaternion().setFromAxisAngle(rFore.userData.axisWorldRight, forearmLift));
                    targetRForeQuat.multiply(qRF);
                }

                if (rHand && rHand.userData.axisWorldRight && rHand.userData.axisWorldUp) {
                    const qRH = new THREE.Quaternion()
                        .setFromAxisAngle(rHand.userData.axisWorldRight, wristLift)
                        .multiply(new THREE.Quaternion().setFromAxisAngle(rHand.userData.axisWorldUp, wristSide));
                    targetRHandQuat.multiply(qRH);
                }

                // Gerakan mikro sendi jari Tripod (Telunjuk, Ibu Jari, Jari Tengah) yang menggerakkan mata pena secara realistis
                if (rIdx1 && rIdx1.userData.axisWorldRight && targetRIdx1Quat) {
                    targetRIdx1Quat.multiply(new THREE.Quaternion().setFromAxisAngle(rIdx1.userData.axisWorldRight, -fingerFlex * 0.7));
                }
                if (rIdx2 && rIdx2.userData.axisWorldRight && targetRIdx2Quat) {
                    targetRIdx2Quat.multiply(new THREE.Quaternion().setFromAxisAngle(rIdx2.userData.axisWorldRight, fingerFlex * 0.9));
                }
                if (rThm2 && rThm2.userData.axisWorldUp && targetRThm2Quat) {
                    targetRThm2Quat.multiply(new THREE.Quaternion().setFromAxisAngle(rThm2.userData.axisWorldUp, -fingerFlex * 0.75));
                }
                if (rMid1 && rMid1.userData.axisWorldRight && targetRMid1Quat) {
                    targetRMid1Quat.multiply(new THREE.Quaternion().setFromAxisAngle(rMid1.userData.axisWorldRight, -fingerFlex * 0.5));
                }

                // Tangan kiri menahan lembar dokumen di sisi kiri dengan stabil
                if (lHand && lHand.userData.axisWorldUp) {
                    const holdShift = Math.sin(this.idleTime * 0.8) * 0.008;
                    const qLH = new THREE.Quaternion().setFromAxisAngle(lHand.userData.axisWorldUp, holdShift);
                    targetLHandQuat.multiply(qLH);
                }
            } else if (this.attentionMode === 'resume') {
                // =========================================================
                // ANIMASI MENGECEK / MENELUSURI BERKAS RIREKISHO DENGAN TANGAN KIRI
                // =========================================================
                mouthVal = 0.0;
                const traceSweep = Math.sin(this.idleTime * 1.6) * 0.032 + 0.015;
                const traceLift = -0.020 - Math.abs(Math.cos(this.idleTime * 1.6)) * 0.015;

                if (lFore && lFore.userData.axisWorldUp && lFore.userData.axisWorldRight) {
                    const qLF = new THREE.Quaternion()
                        .setFromAxisAngle(lFore.userData.axisWorldUp, traceSweep)
                        .multiply(new THREE.Quaternion().setFromAxisAngle(lFore.userData.axisWorldRight, traceLift));
                    targetLForeQuat.multiply(qLF);
                }
                if (lHand && lHand.userData.axisWorldRight) {
                    const qLH = new THREE.Quaternion()
                        .setFromAxisAngle(lHand.userData.axisWorldRight, -0.02);
                    targetLHandQuat.multiply(qLH);
                }
            } else {
                // =========================================================
                // IDLE MENYIMAK AKTIF: MICRO-MOVEMENT HALUS DI ATAS KERTAS
                // =========================================================
                mouthVal = 0.0;
                const gentleSway = Math.sin(this.idleTime * 1.3) * 0.010;
                const gentleLift = -Math.abs(Math.sin(this.idleTime * 0.9)) * 0.010;

                if (lHand && lHand.userData.axisWorldUp) {
                    const qLH = new THREE.Quaternion().setFromAxisAngle(lHand.userData.axisWorldUp, gentleSway);
                    targetLHandQuat.multiply(qLH);
                }
                if (rHand && rHand.userData.axisWorldRight) {
                    const qRH = new THREE.Quaternion().setFromAxisAngle(rHand.userData.axisWorldRight, gentleLift);
                    targetRHandQuat.multiply(qRH);
                }
            }

            // Terapkan interpolasi quaternion halus (slerp) pada lengan bawah, pergelangan tangan, dan jari tripod
            const armLerpSpeed = isWritingActive ? (dt * 12.0) : (dt * 6.5);
            if (lFore && targetLForeQuat) lFore.quaternion.slerp(targetLForeQuat, dt * 6.5);
            if (rFore && targetRForeQuat) rFore.quaternion.slerp(targetRForeQuat, armLerpSpeed);
            if (lHand && targetLHandQuat) lHand.quaternion.slerp(targetLHandQuat, dt * 7.5);
            if (rHand && targetRHandQuat) rHand.quaternion.slerp(targetRHandQuat, armLerpSpeed);

            if (rIdx1 && targetRIdx1Quat) rIdx1.quaternion.slerp(targetRIdx1Quat, armLerpSpeed);
            if (rIdx2 && targetRIdx2Quat) rIdx2.quaternion.slerp(targetRIdx2Quat, armLerpSpeed);
            if (rThm2 && targetRThm2Quat) rThm2.quaternion.slerp(targetRThm2Quat, armLerpSpeed);
            if (rMid1 && targetRMid1Quat) rMid1.quaternion.slerp(targetRMid1Quat, armLerpSpeed);

            // Terapkan Morph Target Mulut (Lip-Sync) & Kedipan Kelopak Mata (Blink)
            if (this.morphMeshes.length > 0) {
                for (let i = 0; i < this.morphMeshes.length; i++) {
                    const mesh = this.morphMeshes[i];
                    if (mesh.name && mesh.name.toLowerCase().includes('eye')) continue;
                    if (mesh.morphTargetInfluences) {
                        mesh.morphTargetInfluences[0] = THREE.MathUtils.lerp(mesh.morphTargetInfluences[0] || 0, mouthVal, 0.45);
                        const dict = mesh.morphTargetDictionary;
                        if (dict && dict['eye_close'] !== undefined) {
                            mesh.morphTargetInfluences[dict['eye_close']] = blinkVal;
                        }
                    }
                }
            }

            // Interpolasi Halus Rotasi Kepala (Damped Smooth Easing)
            const finalPitch = targetPitch + nodOffset + speakPitch + (bowPitch * 0.35);
            const finalYaw = targetYaw + speakYaw;

            this.currentHeadRot.x = THREE.MathUtils.lerp(this.currentHeadRot.x, finalPitch, dt * 5.0);
            this.currentHeadRot.y = THREE.MathUtils.lerp(this.currentHeadRot.y, finalYaw, dt * 5.0);

            const qHeadPitch = new THREE.Quaternion().setFromAxisAngle(axX, this.currentHeadRot.x);
            const qHeadYaw = new THREE.Quaternion().setFromAxisAngle(axY, this.currentHeadRot.y);

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
